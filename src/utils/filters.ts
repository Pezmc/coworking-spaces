// Single source of truth for "which spaces match the current filters".
//
// Before this module the predicate was duplicated in SpaceList.vue (list view)
// and App.vue (map view + the "N of 34" header count); the two could silently
// drift. Everything funnels through matchesFilters now.
//
//   spaces ─┬─► App.vue filteredSpaces ─┬─► MapView
//           │                           └─► "All spots  N of 34" count
//           └─► SpaceList filteredAndSortedSpaces ─► the list cards
//                         │
//                         └─ all three call matchesFilters(space, filters, now)
//
// TIME SEMANTICS
//   openNow / openAt are evaluated in Europe/Brussels (the venues are in Leuven),
//   NOT the visitor's local clock, so "open at 17:00" means Leuven 17:00 for a
//   trip-planner abroad too. openNow + openAt are mutually exclusive in the UI,
//   but matchesFilters AND-combines them defensively if both were ever set.
//
// ACTIVE-FILTER ACCOUNTING
//   openNow and openAt live in the toolbar "When?" cluster, not the More-filters
//   panel, so countActiveFilters excludes BOTH (like openNow always was). This
//   also sidesteps the string-sentinel trap: a number|null openAt would read as
//   active under the old `Object.values(rest).some(v => v !== 'all')`.

import type { ICoworkingSpace, IFilterState } from '../types/space'
import { isOpenAt, parseOpeningHours } from './hoursBasic'

// Valid minutes-since-midnight range for an openAt value (any time of day).
// The chip menu only offers 06:00–23:00, but NL parsing can produce any minute,
// and a tampered URL can carry anything — so validate the full structural range.
export const OPEN_AT_MIN = 0
export const OPEN_AT_MAX = 23 * 60 + 59 // 1439

// One reusable formatter — constructing Intl.DateTimeFormat per call (×34 spaces
// per recompute) is wasteful.
const BRUSSELS_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Brussels',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const WEEKDAY_TO_DAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/**
 * Day-of-week (0=Sun) and minutes-since-midnight for `now` in Europe/Brussels.
 * Falls back to the local clock if the Intl timeZone is unsupported (very old
 * engines) rather than throwing.
 */
export function brusselsParts(now: Date): { day: number; minutes: number } {
  try {
    let weekday = ''
    let hour = 0
    let minute = 0
    for (const part of BRUSSELS_FMT.formatToParts(now)) {
      if (part.type === 'weekday') weekday = part.value
      else if (part.type === 'hour') hour = parseInt(part.value, 10)
      else if (part.type === 'minute') minute = parseInt(part.value, 10)
    }
    if (hour === 24) hour = 0 // some engines emit "24" for midnight under hour12:false
    const day = WEEKDAY_TO_DAY[weekday]
    if (day === undefined || Number.isNaN(hour) || Number.isNaN(minute)) {
      return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() }
    }
    return { day, minutes: hour * 60 + minute }
  } catch {
    return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() }
  }
}

/** "1020" → "17:00", "570" → "09:30". 24h, matches the openingHours data format. */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/**
 * Does a space match every active filter? AND across all dimensions.
 * Opening hours are parsed only when a time filter is active (perf).
 */
export function matchesFilters(space: ICoworkingSpace, f: IFilterState, now: Date): boolean {
  if (f.noiseLevel !== 'all' && space.noiseLevel !== f.noiseLevel) return false
  if (f.wifiSpeed !== 'all' && space.wifiSpeed !== f.wifiSpeed) return false
  if (f.hasAC !== 'all' && space.hasAC !== f.hasAC) return false
  if (f.foodAvailability !== 'all' && space.foodAndDrinkAvailability !== f.foodAvailability)
    return false
  if (f.seatingType !== 'all' && space.seatingType !== f.seatingType) return false
  if (f.hasOutlets !== 'all' && space.hasOutlets !== f.hasOutlets) return false
  if (f.verified !== 'all' && (f.verified === 'verified' ? !space.verified : space.verified))
    return false

  if (f.openNow || f.openAt !== null) {
    const schedule = parseOpeningHours(space.openingHours)
    const { day, minutes } = brusselsParts(now)
    // === true excludes the ~21% of spaces whose hours are unknown (null) —
    // consistent with how "Open now" already behaves.
    if (f.openNow && isOpenAt(schedule, day, minutes) !== true) return false
    if (f.openAt !== null && isOpenAt(schedule, day, f.openAt) !== true) return false
  }

  return true
}

/**
 * Count of active "More filters" panel selections. Excludes openNow AND openAt
 * (both live in the toolbar cluster, not the panel) — which also keeps the
 * number|null openAt from ever reading as active.
 */
export function countActiveFilters(f: IFilterState): number {
  const { openNow: _now, openAt: _at, ...selects } = f
  return Object.values(selects).filter((v) => v !== 'all').length
}

export function hasActiveFilters(f: IFilterState): boolean {
  return countActiveFilters(f) > 0
}

/**
 * Parse an openAt value from a URL param (user-editable). Rejects NaN, empty,
 * non-integer, and out-of-range to null — a tampered ?openAt never sets a
 * broken filter.
 */
export function parseOpenAt(raw: string | undefined | null): number | null {
  if (raw === undefined || raw === null || raw.trim() === '') return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n < OPEN_AT_MIN || n > OPEN_AT_MAX) return null
  return n
}

/** Serialize an openAt value for the URL, or null when the filter is off. */
export function serializeOpenAt(openAt: number | null): string | null {
  return openAt === null ? null : String(openAt)
}
