const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const DAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export interface TimeRange {
  start: number
  end: number
}

export type DaySchedule = Record<number, TimeRange[]>

function normalizeDashes(s: string): string {
  return s.replace(/[–—−]/g, '-')
}

function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim())
  if (!m || m[1] === undefined || m[2] === undefined) return null
  const h = parseInt(m[1], 10)
  const mm = parseInt(m[2], 10)
  if (h < 0 || h > 24 || mm < 0 || mm >= 60) return null
  return h * 60 + mm
}

function parseDayList(daysPart: string): number[] | null {
  const parts = daysPart.split('-').map((s) => s.trim())
  if (parts.length === 1) {
    const key = parts[0]
    if (!key) return null
    const d = DAY_INDEX[key]
    return d === undefined ? null : [d]
  }
  if (parts.length !== 2) return null
  const keyA = parts[0]
  const keyB = parts[1]
  if (!keyA || !keyB) return null
  const a = DAY_INDEX[keyA]
  const b = DAY_INDEX[keyB]
  if (a === undefined || b === undefined) return null
  const result: number[] = []
  let i = a
  while (true) {
    result.push(i)
    if (i === b) break
    i = (i + 1) % 7
    if (result.length > 7) return null
  }
  return result
}

function emptySchedule(): DaySchedule {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
}

export function parseOpeningHours(raw: string): DaySchedule | null {
  if (!raw || !raw.trim()) return null
  const normalized = normalizeDashes(raw)
  const schedule = emptySchedule()

  for (const segment of normalized
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const firstSpace = segment.indexOf(' ')
    if (firstSpace === -1) return null
    const daysPart = segment.slice(0, firstSpace)
    const rest = segment.slice(firstSpace + 1).trim()
    const days = parseDayList(daysPart)
    if (!days) return null

    if (rest.toLowerCase() === 'closed') continue

    const timeMatch = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/.exec(rest)
    if (!timeMatch || timeMatch[1] === undefined || timeMatch[2] === undefined) return null
    const start = parseHHMM(timeMatch[1])
    const end = parseHHMM(timeMatch[2])
    if (start === null || end === null) return null
    const effectiveEnd = end === 0 ? 24 * 60 : end
    const isOvernight = effectiveEnd <= start
    const clampedEnd = isOvernight ? 24 * 60 : effectiveEnd

    for (const d of days) {
      const dayRanges = schedule[d]
      if (dayRanges) dayRanges.push({ start, end: clampedEnd })
    }
  }

  return schedule
}

/**
 * Pure time-of-day open check, decoupled from `Date`.
 *
 *   minutes >= start && minutes < end   ← END-EXCLUSIVE
 *   opens 17:00 → open at 1020 ✓   closes 17:00 → NOT open at 1020 ✗
 *
 * Returns `null` when hours are unknown (unparseable), `false` on a day with
 * no ranges, otherwise whether `minutes` falls inside any range for `day`.
 */
export function isOpenAt(
  schedule: DaySchedule | null,
  day: number,
  minutes: number,
): boolean | null {
  if (!schedule) return null
  const ranges = schedule[day]
  if (!ranges || ranges.length === 0) return false
  return ranges.some((r) => minutes >= r.start && minutes < r.end)
}

export function isOpen(schedule: DaySchedule | null, at: Date): boolean | null {
  return isOpenAt(schedule, at.getDay(), at.getHours() * 60 + at.getMinutes())
}

export const __TEST_ONLY__ = { DAYS, DAY_INDEX, normalizeDashes, parseHHMM, parseDayList }
