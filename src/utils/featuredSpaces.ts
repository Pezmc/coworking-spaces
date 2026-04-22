import type { ICoworkingSpace } from '../types/space'

export type FeaturedSlot = 'quiet' | 'social' | 'discovery'

export interface IFeaturedPick {
  slot: FeaturedSlot
  label: string
  hook: string
  space: ICoworkingSpace
}

const SLOT_META: Record<FeaturedSlot, { label: string; hook: string }> = {
  quiet: { label: 'Quiet focus', hook: 'Deep-work mode' },
  social: { label: 'Meet a friend', hook: 'Snacks & company' },
  discovery: { label: "Today's discovery", hook: 'Somewhere new' },
}

export function dateKey(date: Date, timeZone = 'Europe/Brussels'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function hash(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) + h + str.charCodeAt(i)
  }
  return h >>> 0
}

export function getFeaturedSpaces(
  spaces: ICoworkingSpace[],
  date: Date = new Date(),
): IFeaturedPick[] {
  const seed = hash(dateKey(date))
  const picked = new Set<string>()

  const pickFrom = (pool: ICoworkingSpace[], offset: number): ICoworkingSpace | null => {
    const avail = pool.filter((s) => !picked.has(s.name))
    const chosen = avail[(seed + offset) % avail.length]
    if (!chosen) return null
    picked.add(chosen.name)
    return chosen
  }

  const verified = spaces.filter((s) => s.verified)
  const quietPool = verified.filter((s) => s.noiseLevel === 'quiet')
  const socialPool = verified.filter((s) => s.foodAndDrinkAvailability === 'full')

  const slots: IFeaturedPick[] = []
  const slotDefs: { slot: FeaturedSlot; pool: ICoworkingSpace[]; offset: number }[] = [
    { slot: 'quiet', pool: quietPool.length ? quietPool : verified, offset: 0 },
    { slot: 'social', pool: socialPool.length ? socialPool : verified, offset: 7 },
    { slot: 'discovery', pool: verified, offset: 13 },
  ]

  for (const { slot, pool, offset } of slotDefs) {
    const space = pickFrom(pool, offset)
    if (space) {
      slots.push({ slot, ...SLOT_META[slot], space })
    }
  }

  return slots
}
