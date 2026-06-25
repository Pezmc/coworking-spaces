import type { IFilterState } from '../types/space'
import { formatMinutes } from './filters'

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
      'headache',
      'migraine',
      'hungover',
      'hangover',
      'think clearly',
      'clear my head',
      'serene',
      'tranquil',
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
      'energetic vibe',
      'bustling',
      'noisy',
      'loud',
      'fun vibe',
      'good vibes',
      'good atmosphere',
      'lively atmosphere',
      'people watching',
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
      'teams call',
      'teams meeting',
      'google meet',
      'webinar',
      'remote work',
      'remote working',
      'work from here',
      'work remotely',
      'screen share',
      'screen sharing',
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
      'stuffy',
      'humid',
      'muggy',
      'roasting',
      'melting',
      'too warm',
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
      'phone dying',
      'phone is dying',
      'need power',
      'power outlet',
      'every table',
      'low on power',
      'low power',
      'low battery',
      'low on battery',
      'out of battery',
      'out of power',
      'out of charge',
      'out of juice',
      'low on juice',
      'no battery',
      'recharge',
      'recharging',
      'top up battery',
      'usb',
      'usb-c',
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
      'starving',
      'famished',
      'grab dinner',
      'grab lunch',
      'something to eat',
      'sit down meal',
      'sit-down meal',
      'warm food',
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
      'fancy a snack',
      'peckish',
      'nibble',
      'nibbles',
      'treat',
      'treats',
      'bite',
      'small bite',
      'muffin',
      'muffins',
      'brownie',
      'brownies',
      'biscuit',
      'biscuits',
      'scone',
      'scones',
      'donut',
      'donuts',
      'doughnut',
      'doughnuts',
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

const MAX_QUERY_LENGTH = 1000

// ── Dynamic time phrase: "open at 5pm" → openAt minutes ──────────────────────
// The static table maps phrase→fixed value; a time is a parsed number, so it
// gets its own regex pass. Anchored on "open" so "meeting at 5pm" never matches.
const TIME_RE = /\bopen(?:ing)?\s+(?:at|from|after|by)?\s*(\d{1,2})(:(\d{2}))?\s*(am|pm)?\b/gi

interface ITimeMatch {
  minutes: number
  start: number
  end: number
  text: string
}

function timeToMinutes(m: RegExpExecArray): number | null {
  const hour = parseInt(m[1] ?? '', 10)
  const hasColon = m[2] !== undefined
  const minute = m[3] !== undefined ? parseInt(m[3], 10) : 0
  const ampm = m[4]?.toLowerCase()
  if (Number.isNaN(hour) || minute > 59) return null
  if (ampm) {
    if (hour < 1 || hour > 12) return null // "13pm" is nonsense
    return ((hour % 12) + (ampm === 'pm' ? 12 : 0)) * 60 + minute
  }
  if (hour > 23) return null
  // A bare 1–12 with no colon and no am/pm is ambiguous (5 = 05:00 or 17:00?) — skip it.
  if (!hasColon && hour >= 1 && hour <= 12) return null
  return hour * 60 + minute
}

// Later position wins, matching the per-filter rule for the static phrases.
function lastTimeMatch(normalized: string): ITimeMatch | null {
  TIME_RE.lastIndex = 0
  let last: ITimeMatch | null = null
  let m: RegExpExecArray | null
  while ((m = TIME_RE.exec(normalized)) !== null) {
    const minutes = timeToMinutes(m)
    if (minutes !== null) {
      last = { minutes, start: m.index, end: m.index + m[0].length, text: m[0] }
    }
    if (m.index === TIME_RE.lastIndex) TIME_RE.lastIndex++ // guard against zero-width loop
  }
  return last
}

export function parseAsk(query: string): IAskResult {
  const normalized = query.slice(0, MAX_QUERY_LENGTH).toLowerCase()
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

  // Build emittable chips (static winners + the dynamic time match), query order.
  const emittable: { start: number; match: IAskMatch }[] = [...byFilter.values()].map((m) => ({
    start: m.start,
    match: {
      phrase: m.entry.phrase,
      filter: m.entry.filter,
      value: m.entry.value,
      label: m.entry.label,
    },
  }))

  const timeMatch = lastTimeMatch(normalized)
  if (timeMatch) {
    // Decision 5: openAt and openNow are mutually exclusive — a parsed time
    // supersedes any "open now" phrase, so drop the openNow chip/patch.
    for (let i = emittable.length - 1; i >= 0; i--) {
      if (emittable[i]?.match.filter === 'openNow') emittable.splice(i, 1)
    }
    emittable.push({
      start: timeMatch.start,
      match: {
        phrase: timeMatch.text,
        filter: 'openAt',
        value: timeMatch.minutes,
        label: `Open at ${formatMinutes(timeMatch.minutes)}`,
      },
    })
  }

  emittable.sort((a, b) => a.start - b.start)
  const matches: IAskMatch[] = emittable.map((e) => e.match)
  const filterPatch: Partial<IFilterState> = {}
  for (const e of emittable) {
    ;(filterPatch as Record<string, unknown>)[e.match.filter] = e.match.value
  }

  return { matches, filterPatch }
}
