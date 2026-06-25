// Data-integrity gate for the production spaces.json. The build-time validator
// (scripts/validate-spaces.ts) also checks this, but a committed test gives fast
// local feedback and a hard CI gate independent of the build step — so a hand
// edit that breaks a venue's hours can't silently ship (filter says closed,
// card renders garbage). See tests/hoursBasic.test.ts for the engine itself.
import { describe, it, expect } from 'vitest'
import spaces from '../src/data/spaces.json'
import { validateSpaceShape } from '../scripts/space-validator'
import { buildSchedule, validateWeeklyHours } from '../src/utils/hoursBasic'
import type { ICoworkingSpace } from '../src/types/space'

const data = spaces as unknown as ICoworkingSpace[]

describe('spaces.json data integrity', () => {
  it('has at least one space', () => {
    expect(data.length).toBeGreaterThan(0)
  })

  it('every space passes the shape validator (name, coords, enums, hours)', () => {
    const errors = data.flatMap((s) => validateSpaceShape(s, s.name))
    expect(errors).toEqual([])
  })

  it('every space has structurally valid hours (WeeklyHours object or null)', () => {
    const bad = data
      .map((s) => ({ name: s.name, errs: validateWeeklyHours(s.hours) }))
      .filter((x) => x.errs.length > 0)
    expect(bad).toEqual([])
  })

  it('buildSchedule handles every space without throwing', () => {
    for (const s of data) {
      expect(() => buildSchedule(s.hours)).not.toThrow()
    }
  })

  it('hoursNote, when present, is a non-empty string', () => {
    for (const s of data) {
      if (s.hoursNote !== undefined) {
        expect(typeof s.hoursNote).toBe('string')
        expect((s.hoursNote ?? '').trim().length).toBeGreaterThan(0)
      }
    }
  })
})
