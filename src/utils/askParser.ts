import type { IFilterState } from '../types/space'

export interface IAskMatch {
  phrase: string
  filter: keyof IFilterState
  value: IFilterState[keyof IFilterState]
  label: string
}

export interface IAskResult {
  matches: IAskMatch[]
  filterPatch: Partial<IFilterState>
}

interface IPhraseEntry {
  phrase: string
  filter: keyof IFilterState
  value: IFilterState[keyof IFilterState]
  label: string
}

const entries = (
  phrases: string[],
  filter: keyof IFilterState,
  value: IFilterState[keyof IFilterState],
  label: string,
): IPhraseEntry[] => phrases.map((phrase) => ({ phrase, filter, value, label }))

const PHRASES: IPhraseEntry[] = [
  ...entries(
    [
      'quiet',
      'silent',
      'silence',
      'calm',
      'peaceful',
      'focus',
      'focused',
      'deep work',
      'deep-work',
      'concentrate',
      'concentration',
      'study',
      'studying',
      'reading',
      'no noise',
      'library',
      'library-like',
      'zen',
      'meditative',
      'no distractions',
      'no distraction',
      'heads down',
      'heads-down',
    ],
    'noiseLevel',
    'quiet',
    'Quiet',
  ),
  ...entries(
    [
      'lively',
      'buzzy',
      'buzz',
      'social',
      'chatty',
      'vibrant',
      'energetic',
      'bustling',
      'noisy',
      'loud',
    ],
    'noiseLevel',
    'loud',
    'Lively',
  ),
  ...entries(
    [
      'fast wifi',
      'fast internet',
      'strong wifi',
      'strong internet',
      'good wifi',
      'great wifi',
      'reliable wifi',
      'fast connection',
      'zoom',
      'zoom call',
      'zoom calls',
      'video call',
      'video calls',
      'video meeting',
      'video meetings',
      'meetings',
      'meeting',
      'streaming',
      'stream',
      'heavy upload',
      'big upload',
      'big download',
      'bandwidth',
      'high bandwidth',
    ],
    'wifiSpeed',
    'fast',
    'Fast WiFi',
  ),
  ...entries(
    [
      'hot',
      'warm',
      'heatwave',
      'heat wave',
      'ac',
      'a/c',
      'air conditioning',
      'air-conditioning',
      'air con',
      'aircon',
      'air-con',
      'cooling',
      'cool down',
      'summer',
      'hot day',
      "it's hot",
      'boiling',
      'sweating',
      'sweaty',
    ],
    'hasAC',
    'yes',
    'Air Conditioning',
  ),
  ...entries(
    [
      'outlet',
      'outlets',
      'plug',
      'plugs',
      'plug socket',
      'plug sockets',
      'charge',
      'charger',
      'charging',
      'power',
      'sockets',
      'socket',
      'battery dying',
      'laptop dying',
      'need power',
      'power outlet',
      'every table',
    ],
    'hasOutlets',
    'many',
    'Plenty of Outlets',
  ),
  ...entries(
    [
      'lunch',
      'dinner',
      'hungry',
      'meal',
      'meals',
      'brunch',
      'food',
      'hot food',
      'hot meal',
      'hot meals',
      'full menu',
      'proper meal',
      'proper food',
    ],
    'foodAvailability',
    'full',
    'Full Menu',
  ),
  ...entries(
    [
      'snack',
      'snacks',
      'pastry',
      'pastries',
      'cake',
      'cakes',
      'cookie',
      'cookies',
      'croissant',
      'croissants',
      'light bite',
      'light bites',
      'something small',
      'sandwich',
      'sandwiches',
    ],
    'foodAvailability',
    'light',
    'Snacks',
  ),
  ...entries(
    [
      'open now',
      'open right now',
      'right now',
      'currently open',
      'available now',
      'now open',
      'is it open',
      'open today',
      'open at the moment',
    ],
    'openNow',
    true,
    'Open Now',
  ),
  ...entries(
    ['verified', 'confirmed', 'trusted', 'visited', 'personally visited'],
    'verified',
    'verified',
    'Verified',
  ),
]

const SORTED_PHRASES = [...PHRASES].sort((a, b) => b.phrase.length - a.phrase.length)

interface IRawMatch {
  entry: IPhraseEntry
  start: number
  end: number
}

function isWordBoundary(ch: string | undefined): boolean {
  return !ch || !/[a-z0-9]/.test(ch)
}

export function parseAsk(query: string): IAskResult {
  const normalized = query.toLowerCase()
  const rawMatches: IRawMatch[] = []

  for (const entry of SORTED_PHRASES) {
    const needle = entry.phrase.toLowerCase()
    let from = 0
    while (from <= normalized.length - needle.length) {
      const idx = normalized.indexOf(needle, from)
      if (idx === -1) break
      const before = idx > 0 ? normalized[idx - 1] : undefined
      const after =
        idx + needle.length < normalized.length ? normalized[idx + needle.length] : undefined
      if (!isWordBoundary(before) || !isWordBoundary(after)) {
        from = idx + 1
        continue
      }
      rawMatches.push({ entry, start: idx, end: idx + needle.length })
      from = idx + needle.length
    }
  }

  // Remove overlapping shorter matches (longest phrase wins)
  rawMatches.sort((a, b) => b.end - b.start - (a.end - a.start))
  const consumed = new Array<boolean>(normalized.length).fill(false)
  const kept: IRawMatch[] = []
  for (const m of rawMatches) {
    let overlap = false
    for (let i = m.start; i < m.end; i++) {
      if (consumed[i]) {
        overlap = true
        break
      }
    }
    if (overlap) continue
    for (let i = m.start; i < m.end; i++) consumed[i] = true
    kept.push(m)
  }

  // Per filter, later position wins (natural reading flow)
  const byFilter = new Map<keyof IFilterState, IRawMatch>()
  for (const m of kept) {
    const existing = byFilter.get(m.entry.filter)
    if (!existing || m.start > existing.start) {
      byFilter.set(m.entry.filter, m)
    }
  }

  // Emit chips in query order
  const winners = [...byFilter.values()].sort((a, b) => a.start - b.start)
  const matches: IAskMatch[] = []
  const filterPatch: Partial<IFilterState> = {}
  for (const m of winners) {
    matches.push({
      phrase: m.entry.phrase,
      filter: m.entry.filter,
      value: m.entry.value,
      label: m.entry.label,
    })
    ;(filterPatch as Record<string, unknown>)[m.entry.filter] = m.entry.value
  }

  return { matches, filterPatch }
}
