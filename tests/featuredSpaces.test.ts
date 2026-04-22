import { describe, it, expect } from 'vitest'
import { getFeaturedSpaces, dateKey } from '../src/utils/featuredSpaces'
import type { ICoworkingSpace } from '../src/types/space'

function mkSpace(overrides: Partial<ICoworkingSpace> & { name: string }): ICoworkingSpace {
  return {
    name: overrides.name,
    address: '',
    googleMapsUrl: '',
    coordinates: { lat: 0, lng: 0 },
    noiseLevel: 'medium',
    wifiSpeed: 'medium',
    hasAC: 'yes',
    foodAndDrinkAvailability: 'light',
    seatingType: 'mixed',
    hasOutlets: 'some',
    description: `Description of ${overrides.name}`,
    openingHours: 'Mon-Sun 09:00-18:00',
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

const POOL: ICoworkingSpace[] = [
  mkSpace({ name: 'Quiet-A', noiseLevel: 'quiet' }),
  mkSpace({ name: 'Quiet-B', noiseLevel: 'quiet' }),
  mkSpace({ name: 'Quiet-C', noiseLevel: 'quiet' }),
  mkSpace({ name: 'Social-A', foodAndDrinkAvailability: 'full' }),
  mkSpace({ name: 'Social-B', foodAndDrinkAvailability: 'full' }),
  mkSpace({ name: 'Social-C', foodAndDrinkAvailability: 'full' }),
  mkSpace({ name: 'Plain-A' }),
  mkSpace({ name: 'Plain-B' }),
  mkSpace({ name: 'Unverified', verified: false }),
]

describe('dateKey', () => {
  it('returns ISO date string in Europe/Brussels timezone', () => {
    const key = dateKey(new Date('2026-04-22T10:00:00Z'))
    expect(key).toBe('2026-04-22')
  })

  it('crosses date boundary correctly for late-UTC / early-Brussels', () => {
    // 23:30 UTC on April 22 = 01:30 Brussels on April 23 (CEST, +2)
    const key = dateKey(new Date('2026-04-22T23:30:00Z'))
    expect(key).toBe('2026-04-23')
  })
})

describe('getFeaturedSpaces', () => {
  it('returns three picks — one per slot', () => {
    const picks = getFeaturedSpaces(POOL, new Date('2026-04-22T10:00:00Z'))
    expect(picks).toHaveLength(3)
    expect(picks.map((p) => p.slot)).toEqual(['quiet', 'social', 'discovery'])
  })

  it('is deterministic — same date returns the same three spaces', () => {
    const a = getFeaturedSpaces(POOL, new Date('2026-04-22T10:00:00Z'))
    const b = getFeaturedSpaces(POOL, new Date('2026-04-22T18:00:00Z'))
    expect(a.map((p) => p.space.name)).toEqual(b.map((p) => p.space.name))
  })

  it('different dates generally produce different picks', () => {
    const day1 = getFeaturedSpaces(POOL, new Date('2026-04-22T10:00:00Z'))
    const day2 = getFeaturedSpaces(POOL, new Date('2026-04-23T10:00:00Z'))
    const day3 = getFeaturedSpaces(POOL, new Date('2026-04-24T10:00:00Z'))
    const allSame =
      day1.map((p) => p.space.name).join() === day2.map((p) => p.space.name).join() &&
      day2.map((p) => p.space.name).join() === day3.map((p) => p.space.name).join()
    expect(allSame).toBe(false)
  })

  it('never picks the same space twice across slots', () => {
    for (let day = 0; day < 30; day++) {
      const date = new Date('2026-04-01T10:00:00Z')
      date.setUTCDate(date.getUTCDate() + day)
      const picks = getFeaturedSpaces(POOL, date)
      const names = picks.map((p) => p.space.name)
      expect(new Set(names).size).toBe(names.length)
    }
  })

  it('excludes unverified spaces', () => {
    for (let day = 0; day < 30; day++) {
      const date = new Date('2026-04-01T10:00:00Z')
      date.setUTCDate(date.getUTCDate() + day)
      const picks = getFeaturedSpaces(POOL, date)
      for (const p of picks) {
        expect(p.space.verified).toBe(true)
      }
    }
  })

  it('quiet slot picks from the quiet pool when available', () => {
    for (let day = 0; day < 14; day++) {
      const date = new Date('2026-04-01T10:00:00Z')
      date.setUTCDate(date.getUTCDate() + day)
      const picks = getFeaturedSpaces(POOL, date)
      const quiet = picks.find((p) => p.slot === 'quiet')
      expect(quiet?.space.noiseLevel).toBe('quiet')
    }
  })

  it('social slot picks from full-food pool when available', () => {
    for (let day = 0; day < 14; day++) {
      const date = new Date('2026-04-01T10:00:00Z')
      date.setUTCDate(date.getUTCDate() + day)
      const picks = getFeaturedSpaces(POOL, date)
      const social = picks.find((p) => p.slot === 'social')
      expect(social?.space.foodAndDrinkAvailability).toBe('full')
    }
  })

  it('falls back to verified pool when a slot pool is empty', () => {
    const noQuiet = POOL.filter((s) => s.noiseLevel !== 'quiet')
    const picks = getFeaturedSpaces(noQuiet, new Date('2026-04-22T10:00:00Z'))
    expect(picks).toHaveLength(3)
    const quiet = picks.find((p) => p.slot === 'quiet')
    expect(quiet).toBeDefined()
    expect(quiet!.space.verified).toBe(true)
  })

  it('returns fewer picks gracefully when pool is tiny', () => {
    const tiny = [mkSpace({ name: 'Only-A' }), mkSpace({ name: 'Only-B' })]
    const picks = getFeaturedSpaces(tiny, new Date('2026-04-22T10:00:00Z'))
    expect(picks.length).toBeLessThanOrEqual(2)
    expect(new Set(picks.map((p) => p.space.name)).size).toBe(picks.length)
  })

  it('returns empty array when no verified spaces exist', () => {
    const all = [mkSpace({ name: 'X', verified: false })]
    const picks = getFeaturedSpaces(all, new Date('2026-04-22T10:00:00Z'))
    expect(picks).toEqual([])
  })

  it('real spaces.json data: picks three stable featured spaces', async () => {
    const mod = await import('../src/data/spaces.json')
    const spaces = (mod.default ?? mod) as unknown as ICoworkingSpace[]
    const picks = getFeaturedSpaces(spaces, new Date('2026-04-22T10:00:00Z'))
    expect(picks).toHaveLength(3)
    expect(new Set(picks.map((p) => p.space.name)).size).toBe(3)
    for (const p of picks) expect(p.space.verified).toBe(true)
  })
})
