import { describe, it, expect } from 'vitest'
import {
  buildSchedule,
  clockToMinutes,
  formatHours,
  isOpen,
  isOpenAt,
  validateWeeklyHours,
} from '../src/utils/hoursBasic'
import { DAYS_OF_WEEK, type IOpeningInterval, type WeeklyHours } from '../src/types/space'

const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const

function at(dow: keyof typeof DOW, hh: number, mm = 0): Date {
  // Build entirely in LOCAL time so getDay()/getHours() (what isOpen reads) match
  // intent on any machine timezone. A UTC anchor + local setHours() would land on
  // the previous weekday under UTC-negative offsets (e.g. America/*).
  const base = new Date(2026, 3, 19, 0, 0, 0, 0) // local midnight; week-Apr 2026
  const offset = (DOW[dow] - base.getDay() + 7) % 7
  return new Date(2026, 3, 19 + offset, hh, mm, 0, 0)
}

/** Build a full WeeklyHours from a partial; unspecified days are closed ([]). */
function wh(partial: Partial<Record<keyof WeeklyHours, IOpeningInterval[]>>): WeeklyHours {
  const out = {} as WeeklyHours
  for (const day of DAYS_OF_WEEK) out[day] = partial[day] ?? []
  return out
}

describe('clockToMinutes', () => {
  it('parses HH:MM to minutes since midnight', () => {
    expect(clockToMinutes('00:00')).toBe(0)
    expect(clockToMinutes('08:30')).toBe(510)
    expect(clockToMinutes('17:00')).toBe(1020)
    expect(clockToMinutes('24:00')).toBe(1440)
  })
  it('rejects malformed values with null', () => {
    expect(clockToMinutes('')).toBeNull()
    expect(clockToMinutes('9')).toBeNull()
    expect(clockToMinutes('9:5')).toBeNull()
    expect(clockToMinutes('25:00')).toBeNull()
    expect(clockToMinutes('12:60')).toBeNull()
    expect(clockToMinutes('24:01')).toBeNull()
    expect(clockToMinutes('noon')).toBeNull()
  })
  it('requires a two-digit hour ("9:00" is rejected, "09:00" is not)', () => {
    expect(clockToMinutes('9:00')).toBeNull()
    expect(clockToMinutes('09:00')).toBe(540)
  })
})

describe('buildSchedule', () => {
  it('returns null for unknown hours', () => {
    expect(buildSchedule(null)).toBeNull()
  })

  it('maps weekday names to JS getDay() indices', () => {
    const s = buildSchedule(wh({ monday: [{ open: '09:00', close: '18:00' }] }))!
    expect(s[DOW.Mon]).toEqual([{ start: 540, end: 1080 }])
    expect(s[DOW.Tue]).toEqual([])
    expect(s[DOW.Sun]).toEqual([])
  })

  it('keeps closed days empty', () => {
    const s = buildSchedule(wh({ friday: [{ open: '09:00', close: '15:00' }] }))!
    expect(s[DOW.Sat]).toEqual([])
    expect(s[DOW.Sun]).toEqual([])
  })

  it('supports split shifts (multiple intervals per day)', () => {
    const s = buildSchedule(
      wh({
        monday: [
          { open: '09:00', close: '12:00' },
          { open: '14:00', close: '18:00' },
        ],
      }),
    )!
    expect(s[DOW.Mon]).toEqual([
      { start: 540, end: 720 },
      { start: 840, end: 1080 },
    ])
  })

  it('treats a "00:00" close as end-of-day, no spill', () => {
    const s = buildSchedule(wh({ monday: [{ open: '10:00', close: '00:00' }] }))!
    expect(s[DOW.Mon]).toEqual([{ start: 600, end: 1440 }])
    expect(s[DOW.Tue]).toEqual([])
  })

  it('treats a "24:00" close as end-of-day, no spill', () => {
    const s = buildSchedule(wh({ saturday: [{ open: '17:00', close: '24:00' }] }))!
    expect(s[DOW.Sat]).toEqual([{ start: 1020, end: 1440 }])
    expect(s[DOW.Sun]).toEqual([])
  })

  // The core overnight fix: a post-midnight close spills into the NEXT day.
  it('splits an overnight interval across midnight into the next day', () => {
    const s = buildSchedule(wh({ tuesday: [{ open: '15:00', close: '01:00' }] }))!
    expect(s[DOW.Tue]).toEqual([{ start: 900, end: 1440 }]) // Tue 15:00 → midnight
    expect(s[DOW.Wed]).toEqual([{ start: 0, end: 60 }]) // Wed 00:00 → 01:00
  })

  it('wraps Sunday overnight into Monday', () => {
    const s = buildSchedule(wh({ sunday: [{ open: '20:00', close: '02:00' }] }))!
    expect(s[DOW.Sun]).toEqual([{ start: 1200, end: 1440 }])
    expect(s[DOW.Mon]).toEqual([{ start: 0, end: 120 }])
  })

  it('treats close === open as a full 24h wrap into the next day', () => {
    // close <= open is the overnight trigger; the boundary (equal) means 24h.
    const s = buildSchedule(wh({ monday: [{ open: '09:00', close: '09:00' }] }))!
    expect(s[DOW.Mon]).toEqual([{ start: 540, end: 1440 }])
    expect(s[DOW.Tue]).toEqual([{ start: 0, end: 540 }])
  })
})

describe('isOpen', () => {
  const monFri9to18 = buildSchedule(
    wh({
      monday: [{ open: '09:00', close: '18:00' }],
      tuesday: [{ open: '09:00', close: '18:00' }],
      wednesday: [{ open: '09:00', close: '18:00' }],
      thursday: [{ open: '09:00', close: '18:00' }],
      friday: [{ open: '09:00', close: '18:00' }],
    }),
  )

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

describe('isOpen — overnight venue reads open after midnight', () => {
  // Café Entrepot-style: open Mon–Sat 09:30 until 01:00 the next morning.
  const overnight = buildSchedule(
    wh({
      monday: [{ open: '09:30', close: '01:00' }],
      tuesday: [{ open: '09:30', close: '01:00' }],
    }),
  )
  it('open just after midnight on the following day (the bug this fixes)', () => {
    expect(isOpen(overnight, at('Tue', 0, 30))).toBe(true)
  })
  it('closed at the post-midnight closing minute (end exclusive)', () => {
    expect(isOpen(overnight, at('Tue', 1, 0))).toBe(false)
  })
})

describe('isOpenAt — pure time-of-day check (powers openAt + openNow)', () => {
  const monFri = buildSchedule(
    wh({
      monday: [{ open: '09:00', close: '17:00' }],
      tuesday: [{ open: '09:00', close: '17:00' }],
      wednesday: [{ open: '09:00', close: '17:00' }],
      thursday: [{ open: '09:00', close: '17:00' }],
      friday: [{ open: '09:00', close: '17:00' }],
    }),
  )

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
})

describe('formatHours', () => {
  it('returns empty string for unknown hours', () => {
    expect(formatHours(null)).toBe('')
  })

  it('collapses consecutive identical days into a range', () => {
    const text = formatHours(
      wh({
        monday: [{ open: '08:30', close: '18:00' }],
        tuesday: [{ open: '08:30', close: '18:00' }],
        wednesday: [{ open: '08:30', close: '18:00' }],
        thursday: [{ open: '08:30', close: '18:00' }],
        friday: [{ open: '08:30', close: '18:00' }],
        saturday: [{ open: '09:00', close: '17:00' }],
      }),
    )
    expect(text).toBe('Mon–Fri 08:30–18:00, Sat 09:00–17:00, Sun closed')
  })

  it('renders a single open day with the rest closed', () => {
    expect(formatHours(wh({ monday: [{ open: '09:00', close: '17:00' }] }))).toBe(
      'Mon 09:00–17:00, Tue–Sun closed',
    )
  })

  it('joins split shifts with " & "', () => {
    const text = formatHours(
      wh({
        monday: [
          { open: '09:00', close: '12:00' },
          { open: '14:00', close: '18:00' },
        ],
      }),
    )
    expect(text).toBe('Mon 09:00–12:00 & 14:00–18:00, Tue–Sun closed')
  })

  it('returns "Closed" when every day is empty', () => {
    expect(formatHours(wh({}))).toBe('Closed')
  })

  it('does not include the hoursNote (callers render it separately)', () => {
    // formatHours takes only the structured grid; bar Stan's caveat lives in hoursNote.
    expect(formatHours(wh({ monday: [{ open: '08:00', close: '23:30' }] }))).not.toContain('brunch')
  })

  it('renders an overnight interval with its post-midnight close (Café Entrepot-style)', () => {
    expect(formatHours(wh({ monday: [{ open: '15:00', close: '01:00' }] }))).toBe(
      'Mon 15:00–01:00, Tue–Sun closed',
    )
  })

  it('renders a midnight close verbatim (STUKcafé-style 00:00)', () => {
    expect(formatHours(wh({ monday: [{ open: '10:00', close: '00:00' }] }))).toBe(
      'Mon 10:00–00:00, Tue–Sun closed',
    )
  })
})

describe('validateWeeklyHours', () => {
  it('accepts null (unknown hours)', () => {
    expect(validateWeeklyHours(null)).toEqual([])
  })
  it('accepts a well-formed week', () => {
    expect(validateWeeklyHours(wh({ monday: [{ open: '09:00', close: '17:00' }] }))).toEqual([])
  })
  it('rejects a non-object', () => {
    expect(validateWeeklyHours('Mon-Fri 9-5').length).toBeGreaterThan(0)
    expect(validateWeeklyHours([]).length).toBeGreaterThan(0)
  })
  it('flags a missing weekday', () => {
    const partial = { ...wh({}) } as Record<string, unknown>
    delete partial.sunday
    expect(validateWeeklyHours(partial).some((e) => e.includes('sunday'))).toBe(true)
  })
  it('flags a malformed time', () => {
    const bad = wh({ monday: [{ open: '9am', close: '17:00' }] })
    expect(validateWeeklyHours(bad).some((e) => e.includes('open'))).toBe(true)
  })
  it('flags an unexpected key', () => {
    const extra = { ...wh({}), funday: [] } as Record<string, unknown>
    expect(validateWeeklyHours(extra).some((e) => e.includes('funday'))).toBe(true)
  })
  it('rejects open "24:00" (only valid as a close)', () => {
    const bad = wh({ monday: [{ open: '24:00', close: '02:00' }] })
    expect(validateWeeklyHours(bad).some((e) => e.includes('open'))).toBe(true)
  })
  it('accepts close "24:00" (open until midnight)', () => {
    expect(validateWeeklyHours(wh({ monday: [{ open: '08:00', close: '24:00' }] }))).toEqual([])
  })
  it('flags a malformed close time', () => {
    const bad = wh({ monday: [{ open: '09:00', close: '25:99' }] })
    expect(validateWeeklyHours(bad).some((e) => e.includes('close'))).toBe(true)
  })
  it('flags a non-object interval element', () => {
    const bad = { ...wh({}), monday: [null] } as unknown
    expect(validateWeeklyHours(bad).some((e) => e.includes('open, close'))).toBe(true)
  })
})
