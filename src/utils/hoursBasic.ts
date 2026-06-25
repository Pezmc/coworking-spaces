import { DAYS_OF_WEEK, type DayOfWeek, type WeeklyHours } from '../types/space'

export interface TimeRange {
  start: number
  end: number
}

export type DaySchedule = Record<number, TimeRange[]>

const MINUTES_PER_DAY = 24 * 60

// DaySchedule is keyed by JS Date.getDay() (0 = Sun … 6 = Sat); WeeklyHours is
// keyed by day name. This maps each name to its getDay() index.
const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

// Mon-first display order + abbreviations used by formatHours.
const DAY_ABBR: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

/**
 * "HH:MM" → minutes since midnight (0–1440). Strict two-digit hour and minute
 * ("00:00"–"24:00"); "9:00" is rejected so it can't ship and then render as a
 * separate day-group from "09:00" in formatHours. Returns null on any malformed
 * value so bad data is caught by validation rather than treated as midnight.
 */
export function clockToMinutes(s: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(s.trim())
  if (!m || m[1] === undefined || m[2] === undefined) return null
  const h = parseInt(m[1], 10)
  const mm = parseInt(m[2], 10)
  if (h < 0 || h > 24 || mm < 0 || mm >= 60) return null
  const total = h * 60 + mm
  if (total > MINUTES_PER_DAY) return null // rejects 24:01–24:59
  return total
}

function emptySchedule(): DaySchedule {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
}

/**
 * Convert structured WeeklyHours into the minutes-based DaySchedule the
 * open-checks run against. Returns null when hours are unknown (null in).
 *
 * Overnight handling: when an interval's close is at or before its open, it
 * runs past midnight — the slice after midnight is attributed to the NEXT day.
 * So `{ tuesday: [{ open: "15:00", close: "01:00" }] }` reads as open at
 * Wed 00:30. A close of "00:00"/"24:00" is exactly midnight and does not spill.
 *
 * Malformed times are skipped defensively (validateWeeklyHours is the real gate).
 */
export function buildSchedule(hours: WeeklyHours | null): DaySchedule | null {
  if (!hours) return null
  const schedule = emptySchedule()

  for (const day of DAYS_OF_WEEK) {
    const intervals = hours[day]
    if (!intervals) continue
    const idx = DAY_TO_INDEX[day]
    for (const { open, close } of intervals) {
      const start = clockToMinutes(open)
      let end = clockToMinutes(close)
      if (start === null || end === null) continue
      if (end === 0) end = MINUTES_PER_DAY // a "00:00" close means end-of-day
      if (end <= start) {
        // Wraps past midnight: [start, 24:00] today, [00:00, end] tomorrow.
        schedule[idx]!.push({ start, end: MINUTES_PER_DAY })
        if (end > 0) schedule[(idx + 1) % 7]!.push({ start: 0, end })
      } else {
        schedule[idx]!.push({ start, end })
      }
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
 * Returns `null` when hours are unknown (schedule null), `false` on a day with
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

/**
 * Human-readable schedule derived from structured hours, e.g.
 * "Mon–Fri 08:30–18:00, Sat 09:00–17:00, Sun closed". Consecutive days with
 * identical hours collapse into a range; split shifts join with " & ". Returns
 * '' for unknown hours (null) and 'Closed' when every day is empty. Does NOT
 * include `hoursNote` — callers render that separately.
 */
export function formatHours(hours: WeeklyHours | null): string {
  if (!hours) return ''

  const signature = (day: DayOfWeek): string => {
    const intervals = hours[day] ?? []
    if (intervals.length === 0) return 'closed'
    return intervals.map((i) => `${i.open}–${i.close}`).join(' & ')
  }

  // Collapse consecutive same-signature days, in Mon-first order.
  const groups: { start: DayOfWeek; end: DayOfWeek; sig: string }[] = []
  for (const day of DAYS_OF_WEEK) {
    const sig = signature(day)
    const last = groups[groups.length - 1]
    if (last && last.sig === sig) last.end = day
    else groups.push({ start: day, end: day, sig })
  }

  if (groups.length === 1 && groups[0]!.sig === 'closed') return 'Closed'

  return groups
    .map((g) => {
      const label =
        g.start === g.end ? DAY_ABBR[g.start] : `${DAY_ABBR[g.start]}–${DAY_ABBR[g.end]}`
      return `${label} ${g.sig}`
    })
    .join(', ')
}

/**
 * Structural validation for a space's `hours` field. Returns human-readable
 * problems (empty array = valid). `null` is valid (unknown hours). Shared by
 * the build-time data validator and the LLM-enrichment pipeline so the rules
 * live in exactly one place.
 */
export function validateWeeklyHours(hours: unknown): string[] {
  if (hours === null) return []
  if (typeof hours !== 'object' || Array.isArray(hours)) {
    return ['hours must be an object keyed by weekday, or null']
  }
  const errors: string[] = []
  const h = hours as Record<string, unknown>

  for (const day of DAYS_OF_WEEK) {
    const intervals = h[day]
    if (!Array.isArray(intervals)) {
      errors.push(`hours.${day} must be an array ([] = closed)`)
      continue
    }
    intervals.forEach((iv, i) => {
      if (!iv || typeof iv !== 'object') {
        errors.push(`hours.${day}[${i}] must be an { open, close } object`)
        return
      }
      const { open, close } = iv as Record<string, unknown>
      const openMin = typeof open === 'string' ? clockToMinutes(open) : null
      if (openMin === null) {
        errors.push(`hours.${day}[${i}].open is not a valid "HH:MM" time`)
      } else if (openMin >= MINUTES_PER_DAY) {
        // "24:00" is end-of-day midnight — only meaningful as a close.
        errors.push(`hours.${day}[${i}].open cannot be "24:00" — use a real opening time`)
      }
      if (typeof close !== 'string' || clockToMinutes(close) === null) {
        errors.push(`hours.${day}[${i}].close is not a valid "HH:MM" time`)
      }
    })
  }

  for (const key of Object.keys(h)) {
    if (!(DAYS_OF_WEEK as readonly string[]).includes(key)) {
      errors.push(`hours has unexpected key "${key}"`)
    }
  }

  return errors
}
