import { describe, it, expect } from 'vitest'
import { parseOpeningHours, isOpen, isOpenAt } from '../src/utils/hoursBasic'

const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const

function at(dow: keyof typeof DOW, hh: number, mm = 0): Date {
  const d = new Date('2026-04-19T00:00:00Z')
  const current = d.getUTCDay()
  const target = DOW[dow]
  d.setUTCDate(d.getUTCDate() + ((target - current + 7) % 7))
  d.setHours(hh, mm, 0, 0)
  return d
}

describe('parseOpeningHours — dash normalization', () => {
  it('parses hyphen (U+002D) day ranges', () => {
    const s = parseOpeningHours('Mon-Fri 09:00-18:00')
    expect(s).not.toBeNull()
    expect(s![DOW.Mon]).toEqual([{ start: 540, end: 1080 }])
    expect(s![DOW.Fri]).toEqual([{ start: 540, end: 1080 }])
  })

  it('parses en-dash (U+2013) day ranges identically', () => {
    const s = parseOpeningHours('Mon\u2013Fri 09:00\u201318:00')
    expect(s).not.toBeNull()
    expect(s![DOW.Mon]).toEqual([{ start: 540, end: 1080 }])
    expect(s![DOW.Fri]).toEqual([{ start: 540, end: 1080 }])
  })

  it('treats mixed dash styles in one string correctly', () => {
    const s = parseOpeningHours('Mon-Fri 09:00\u201318:00, Sat\u2013Sun 10:00-17:00')
    expect(s).not.toBeNull()
    expect(s![DOW.Mon]).toEqual([{ start: 540, end: 1080 }])
    expect(s![DOW.Sat]).toEqual([{ start: 600, end: 1020 }])
    expect(s![DOW.Sun]).toEqual([{ start: 600, end: 1020 }])
  })
})

describe('parseOpeningHours — empty/invalid', () => {
  it('returns null for empty string', () => {
    expect(parseOpeningHours('')).toBeNull()
  })
  it('returns null for whitespace-only', () => {
    expect(parseOpeningHours('   ')).toBeNull()
  })
  it('returns null for garbage', () => {
    expect(parseOpeningHours('sometimes open')).toBeNull()
  })
})

describe('parseOpeningHours — closed days', () => {
  it('excludes days marked closed', () => {
    const s = parseOpeningHours('Mon-Thu 09:00-17:00, Fri 09:00-15:00, Sat-Sun closed')
    expect(s).not.toBeNull()
    expect(s![DOW.Mon]).toEqual([{ start: 540, end: 1020 }])
    expect(s![DOW.Fri]).toEqual([{ start: 540, end: 900 }])
    expect(s![DOW.Sat]).toEqual([])
    expect(s![DOW.Sun]).toEqual([])
  })
})

describe('parseOpeningHours — day wrapping', () => {
  it('handles Sun-Mon (wraps through week)', () => {
    const s = parseOpeningHours('Sun-Mon closed, Tue-Thu 11:00-18:00')
    expect(s).not.toBeNull()
    expect(s![DOW.Sun]).toEqual([])
    expect(s![DOW.Mon]).toEqual([])
    expect(s![DOW.Tue]).toEqual([{ start: 660, end: 1080 }])
  })
})

describe('parseOpeningHours — midnight and overnight', () => {
  it('treats 00:00 end as end-of-day (24:00)', () => {
    const s = parseOpeningHours('Mon-Fri 10:00-00:00')
    expect(s![DOW.Mon]).toEqual([{ start: 600, end: 1440 }])
  })
  it('treats overnight as closing at midnight of same day (W1 pragmatic)', () => {
    const s = parseOpeningHours('Sat 13:00-03:00')
    expect(s![DOW.Sat]).toEqual([{ start: 780, end: 1440 }])
  })
})

describe('isOpen', () => {
  const monFri9to18 = parseOpeningHours('Mon-Fri 09:00-18:00, Sat-Sun closed')

  it('returns true during open hours', () => {
    expect(isOpen(monFri9to18, at('Tue', 14, 20))).toBe(true)
  })
  it('returns false before opening', () => {
    expect(isOpen(monFri9to18, at('Tue', 8, 59))).toBe(false)
  })
  it('returns false exactly at closing time (end is exclusive)', () => {
    expect(isOpen(monFri9to18, at('Tue', 18, 0))).toBe(false)
  })
  it('returns false on closed day', () => {
    expect(isOpen(monFri9to18, at('Sat', 14, 0))).toBe(false)
  })
  it('returns null when schedule is null (unknown hours)', () => {
    expect(isOpen(null, at('Tue', 14, 0))).toBeNull()
  })
})

describe('isOpen — real spaces.json samples', () => {
  it('M-Tribe: open Tue 14:20 (Mon-Fri 08:30-18:00)', () => {
    const s = parseOpeningHours('Mon-Fri 08:30-18:00, Sat 08:30-18:00, Sun 09:00-17:00')
    expect(isOpen(s, at('Tue', 14, 20))).toBe(true)
  })
  it('Stadsbibliotheek-style: closed Sunday', () => {
    const s = parseOpeningHours('Mon\u2013Fri 09:00\u201318:00, Sat 10:00\u201318:00, Sun closed')
    expect(isOpen(s, at('Sun', 11, 0))).toBe(false)
  })
  it('Bar Permeke-style: open Sat 13:00 (overnight range)', () => {
    const s = parseOpeningHours('Mon-Fri 10:00-03:00, Sat 13:00-03:00, Sun 17:00-02:00')
    expect(isOpen(s, at('Sat', 14, 0))).toBe(true)
  })
})

describe('isOpenAt — pure time-of-day check (powers openAt + openNow)', () => {
  const monFri = parseOpeningHours('Mon-Fri 09:00-17:00, Sat-Sun closed')

  it('returns null when hours are unknown', () => {
    expect(isOpenAt(null, 2, 600)).toBeNull()
  })
  it('returns false on a closed day', () => {
    expect(isOpenAt(monFri, 0, 600)).toBe(false) // Sunday
  })
  it('open at the opening minute (start inclusive)', () => {
    expect(isOpenAt(monFri, 2, 540)).toBe(true) // Tue 09:00
  })
  it('NOT open at the closing minute (end exclusive)', () => {
    expect(isOpenAt(monFri, 2, 1020)).toBe(false) // Tue 17:00
  })
  it('open one minute before close', () => {
    expect(isOpenAt(monFri, 2, 1019)).toBe(true) // Tue 16:59
  })
  it('not open before opening', () => {
    expect(isOpenAt(monFri, 2, 539)).toBe(false) // Tue 08:59
  })
  it('overnight range clamps to midnight (W1 pragmatic)', () => {
    const s = parseOpeningHours('Sat 13:00-03:00')
    expect(isOpenAt(s, 6, 1020)).toBe(true) // Sat 17:00 inside 13:00–24:00
    expect(isOpenAt(s, 6, 120)).toBe(false) // Sat 02:00 not covered (clamped at midnight)
  })
})
