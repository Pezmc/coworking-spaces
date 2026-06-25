import { describe, it, expect } from 'vitest'
import {
  matchesFilters,
  countActiveFilters,
  hasActiveFilters,
  parseOpenAt,
  serializeOpenAt,
  formatMinutes,
  brusselsParts,
} from '../src/utils/filters'
import type { ICoworkingSpace, IFilterState } from '../src/types/space'

function space(overrides: Partial<ICoworkingSpace> = {}): ICoworkingSpace {
  return {
    name: 'Test',
    address: '',
    googleMapsUrl: '',
    coordinates: { lat: 0, lng: 0 },
    noiseLevel: 'quiet',
    wifiSpeed: 'fast',
    hasAC: 'yes',
    foodAndDrinkAvailability: 'full',
    seatingType: 'mixed',
    hasOutlets: 'many',
    description: '',
    openingHours: 'Mon-Sun 09:00-17:00',
    atmosphereNotes: '',
    wifiNotes: '',
    climateNotes: '',
    foodNotes: '',
    drinkNotes: '',
    seatingNotes: '',
    outletNotes: '',
    verified: true,
    ...overrides,
  }
}

const NONE: IFilterState = {
  noiseLevel: 'all',
  wifiSpeed: 'all',
  hasAC: 'all',
  foodAvailability: 'all',
  seatingType: 'all',
  hasOutlets: 'all',
  verified: 'all',
  openNow: false,
  openAt: null,
}

// A fixed mid-day instant so brusselsParts is deterministic (CEST, UTC+2).
// 2026-06-22 is a Monday; 12:00 UTC → 14:00 Brussels.
const MON = new Date('2026-06-22T10:00:00Z') // Brussels 12:00 Monday
const TUE = new Date('2026-06-23T10:00:00Z') // Brussels 12:00 Tuesday

describe('formatMinutes', () => {
  it('formats minutes-since-midnight as HH:MM (24h)', () => {
    expect(formatMinutes(1020)).toBe('17:00')
    expect(formatMinutes(570)).toBe('09:30')
    expect(formatMinutes(0)).toBe('00:00')
    expect(formatMinutes(1439)).toBe('23:59')
  })
})

describe('parseOpenAt — URL validation (user-editable input)', () => {
  it('accepts a valid minute value', () => {
    expect(parseOpenAt('1020')).toBe(1020)
    expect(parseOpenAt('0')).toBe(0)
    expect(parseOpenAt('1439')).toBe(1439)
  })
  it('rejects junk → null', () => {
    expect(parseOpenAt('banana')).toBeNull()
    expect(parseOpenAt('12.5')).toBeNull()
    expect(parseOpenAt('-1')).toBeNull()
    expect(parseOpenAt('99999')).toBeNull()
    expect(parseOpenAt('1440')).toBeNull()
    expect(parseOpenAt('')).toBeNull()
    expect(parseOpenAt('  ')).toBeNull()
    expect(parseOpenAt(undefined)).toBeNull()
  })
})

describe('serializeOpenAt', () => {
  it('round-trips through parseOpenAt', () => {
    expect(serializeOpenAt(1020)).toBe('1020')
    expect(serializeOpenAt(0)).toBe('0')
    expect(serializeOpenAt(null)).toBeNull()
    expect(parseOpenAt(serializeOpenAt(1020) ?? undefined)).toBe(1020)
  })
})

describe('countActiveFilters / hasActiveFilters — sentinel regression', () => {
  it('off-state counts zero', () => {
    expect(countActiveFilters(NONE)).toBe(0)
    expect(hasActiveFilters(NONE)).toBe(false)
  })
  it('openAt=null is NOT counted active (the bug this guards)', () => {
    expect(countActiveFilters({ ...NONE, openAt: null })).toBe(0)
    expect(hasActiveFilters({ ...NONE, openAt: null })).toBe(false)
  })
  it('openAt set is still not a panel filter (lives in the toolbar cluster)', () => {
    expect(countActiveFilters({ ...NONE, openAt: 1020 })).toBe(0)
  })
  it('openNow is excluded too', () => {
    expect(countActiveFilters({ ...NONE, openNow: true })).toBe(0)
  })
  it('counts only the panel selects', () => {
    expect(countActiveFilters({ ...NONE, noiseLevel: 'quiet' })).toBe(1)
    expect(countActiveFilters({ ...NONE, noiseLevel: 'quiet', wifiSpeed: 'fast' })).toBe(2)
    expect(countActiveFilters({ ...NONE, noiseLevel: 'quiet', openAt: 1020 })).toBe(1)
  })
})

describe('brusselsParts — venues evaluated in Leuven time, not the visitor clock', () => {
  it('summer (CEST, UTC+2)', () => {
    expect(brusselsParts(new Date('2026-06-25T12:00:00Z'))).toEqual({ day: 4, minutes: 840 })
  })
  it('winter (CET, UTC+1)', () => {
    expect(brusselsParts(new Date('2026-01-15T12:00:00Z'))).toEqual({ day: 4, minutes: 780 })
  })
})

describe('matchesFilters', () => {
  it('passes a fully-open space with no filters', () => {
    expect(matchesFilters(space(), NONE, MON)).toBe(true)
  })

  it('select mismatch fails', () => {
    expect(
      matchesFilters(space({ noiseLevel: 'quiet' }), { ...NONE, noiseLevel: 'loud' }, MON),
    ).toBe(false)
  })

  it('verified filter', () => {
    expect(
      matchesFilters(space({ verified: true }), { ...NONE, verified: 'unverified' }, MON),
    ).toBe(false)
    expect(
      matchesFilters(space({ verified: false }), { ...NONE, verified: 'unverified' }, MON),
    ).toBe(true)
  })

  describe('openAt', () => {
    const s = space({ openingHours: 'Mon-Sun 09:00-17:00' })
    it('open during hours', () => {
      expect(matchesFilters(s, { ...NONE, openAt: 600 }, MON)).toBe(true) // 10:00
    })
    it('end-exclusive: closes at 17:00 is NOT open at 17:00', () => {
      expect(matchesFilters(s, { ...NONE, openAt: 1020 }, MON)).toBe(false)
    })
    it('before opening', () => {
      expect(matchesFilters(s, { ...NONE, openAt: 480 }, MON)).toBe(false) // 08:00
    })
    it('blank hours are excluded (unknown ≠ open)', () => {
      expect(matchesFilters(space({ openingHours: '' }), { ...NONE, openAt: 600 }, MON)).toBe(false)
    })
    it('ANDs with a panel select', () => {
      expect(matchesFilters(s, { ...NONE, openAt: 600, noiseLevel: 'quiet' }, MON)).toBe(true)
      expect(matchesFilters(s, { ...NONE, openAt: 600, noiseLevel: 'loud' }, MON)).toBe(false)
    })
    it('uses the Brussels day-of-week', () => {
      const monOnly = space({ openingHours: 'Mon 09:00-17:00, Tue-Sun closed' })
      expect(matchesFilters(monOnly, { ...NONE, openAt: 600 }, MON)).toBe(true)
      expect(matchesFilters(monOnly, { ...NONE, openAt: 600 }, TUE)).toBe(false)
    })
  })

  // Regression: openNow filtering moved out of App/SpaceList into matchesFilters
  // and switched from the visitor's local clock to Europe/Brussels.
  describe('openNow', () => {
    const monOnly = space({ openingHours: 'Mon 09:00-17:00, Tue-Sun closed' })
    it('passes when Brussels-now is inside hours', () => {
      expect(matchesFilters(monOnly, { ...NONE, openNow: true }, MON)).toBe(true) // Mon 12:00
    })
    it('fails when closed at Brussels-now', () => {
      expect(matchesFilters(monOnly, { ...NONE, openNow: true }, TUE)).toBe(false) // Tue
    })
    it('excludes blank-hours spaces', () => {
      expect(matchesFilters(space({ openingHours: '' }), { ...NONE, openNow: true }, MON)).toBe(
        false,
      )
    })
  })
})
