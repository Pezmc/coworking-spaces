import { writeFileSync, renameSync } from 'node:fs'
import {
  NOISE_LEVELS,
  WIFI_SPEEDS,
  AC_OPTIONS,
  FOOD_AND_DRINK_OPTIONS,
  SEATING_TYPES,
  OUTLET_OPTIONS,
  type ICoworkingSpace,
} from '../src/types/space'
import { validateWeeklyHours } from '../src/utils/hoursBasic'

// Allowed concrete values per enum field. "Unknown / not yet researched" is NOT
// a member of any of these — it's represented by `null` on the space. So this
// table doubles as (a) the legal replacement values when enriching a null field
// (apply-enrich) and (b) the membership set when validating stored data
// (validateEnumValues). A stored string outside its set — e.g. a stray
// "unknown" — is invalid.
export const ENUM_FIELDS = {
  noiseLevel: NOISE_LEVELS, // quiet | medium | loud
  wifiSpeed: WIFI_SPEEDS, // slow | medium | fast
  hasAC: AC_OPTIONS, // yes | no
  foodAndDrinkAvailability: FOOD_AND_DRINK_OPTIONS, // none | light | full
  seatingType: SEATING_TYPES, // individual | mixed | group
  hasOutlets: OUTLET_OPTIONS, // none | few | some | many
} as const

export type EnumFieldName = keyof typeof ENUM_FIELDS

export const ENUM_FIELD_NAMES = Object.keys(ENUM_FIELDS) as EnumFieldName[]

// Enum fields that may be `null` (unknown / not yet researched) — every
// standardized field except foodAndDrinkAvailability, which is always
// determinable. Used by validateSpaceShape to allow null only where the type does.
export const NULLABLE_ENUM_FIELDS: readonly EnumFieldName[] = [
  'noiseLevel',
  'wifiSpeed',
  'hasAC',
  'seatingType',
  'hasOutlets',
]

// Whitelist of fields persisted into spaces.json. Anything else in an
// LLM response is dropped on the floor by pickKnownSpaceFields.
export const KNOWN_SPACE_KEYS: readonly (keyof ICoworkingSpace)[] = [
  'name',
  'address',
  'googleMapsUrl',
  'coordinates',
  'noiseLevel',
  'wifiSpeed',
  'hasAC',
  'foodAndDrinkAvailability',
  'seatingType',
  'hasOutlets',
  'description',
  'hours',
  'hoursNote',
  'atmosphereNotes',
  'wifiNotes',
  'climateNotes',
  'foodNotes',
  'drinkNotes',
  'seatingNotes',
  'outletNotes',
  'verified',
  'imageUrl',
] as const

export function pickKnownSpaceFields(c: Record<string, unknown>): ICoworkingSpace {
  const out: Record<string, unknown> = {}
  for (const k of KNOWN_SPACE_KEYS) out[k] = c[k]
  return out as ICoworkingSpace
}

// Atomic file replacement: write to .tmp then rename. POSIX rename is atomic,
// so a crash during writeFileSync leaves either the old file or the new file
// intact, never a half-written one.
export function atomicWriteFile(path: string, content: string): void {
  const tmp = path + '.tmp'
  writeFileSync(tmp, content, 'utf8')
  renameSync(tmp, path)
}

// Free-text / structural fields that must never change on non-verified spaces
// via the enrichment pipeline.
export const IMMUTABLE_FIELDS = [
  'name',
  'address',
  'googleMapsUrl',
  'coordinates',
  'description',
  'hours',
  'hoursNote',
  'atmosphereNotes',
  'wifiNotes',
  'climateNotes',
  'foodNotes',
  'drinkNotes',
  'seatingNotes',
  'outletNotes',
  'verified',
  'imageUrl',
] as const

export const LEUVEN_BBOX = {
  latMin: 50.85,
  latMax: 50.92,
  lngMin: 4.65,
  lngMax: 4.75,
}

// Two new spaces within this distance are treated as duplicates.
// Tuned for Leuven's dense centre: 45m caught a real false positive
// (Swartehond vs MadMum Tiensestraat on adjacent streets).
export const PROXIMITY_DUPE_METRES = 50

/**
 * Returns the list of enum fields whose (non-null) value is not in the allowed
 * set for that field. Used by apply-discover.ts to reject LLM hallucinations
 * before they reach spaces.json, and by the data-integrity gates (the test and
 * the build validator). apply-enrich.ts has its own per-transition check (only
 * allows null -> valid enum on non-verified spaces).
 *
 * `null` means unknown / not yet researched and is always allowed (skipped
 * here). Any concrete string outside the allowed set — including a stray
 * "unknown" — is rejected.
 */
export function validateEnumValues(candidate: Record<string, unknown>): IValidationError[] {
  const errors: IValidationError[] = []
  const label = (candidate.name as string) ?? '(unnamed)'
  for (const field of ENUM_FIELD_NAMES) {
    const value = candidate[field]
    if (typeof value !== 'string') continue // null (unknown) / type errors handled by shape validator
    const allowed = ENUM_FIELDS[field] as readonly string[]
    if (!allowed.includes(value)) {
      errors.push({
        spaceName: label,
        field,
        reason: `invalid enum value "${value}"; allowed: ${allowed.join('|')}`,
      })
    }
  }
  return errors
}

/**
 * Two-stage JSON extraction from LLM output.
 * Stage 1: fenced ```json ... ``` block.
 * Stage 2: first `[` ... matching `]` array.
 * Returns null on failure.
 */
export function extractJson(raw: string): unknown | null {
  // Stage 1: fenced json block
  const fenced = raw.match(/```(?:json)?\s*\n([\s\S]*?)\n```/)
  if (fenced) {
    try {
      return JSON.parse(fenced[1])
    } catch {
      // fall through
    }
  }

  // Stage 2: greedy bracket-match array (finds first '[' and matching ']')
  const start = raw.indexOf('[')
  if (start !== -1) {
    let depth = 0
    let inString = false
    let escape = false
    for (let i = start; i < raw.length; i++) {
      const c = raw[i]
      if (escape) {
        escape = false
        continue
      }
      if (c === '\\' && inString) {
        escape = true
        continue
      }
      if (c === '"') {
        inString = !inString
        continue
      }
      if (inString) continue
      if (c === '[') depth++
      else if (c === ']') {
        depth--
        if (depth === 0) {
          const slice = raw.slice(start, i + 1)
          try {
            return JSON.parse(slice)
          } catch {
            return null
          }
        }
      }
    }
  }

  return null
}

export interface IValidationError {
  spaceName: string
  field: string
  reason: string
}

/**
 * Validates a single space object has the required shape (types/presence).
 * Enum fields must be a string or, for the nullable ones, `null` (unknown).
 * Membership of concrete enum values is checked separately by validateEnumValues.
 */
export function validateSpaceShape(candidate: unknown, label: string): IValidationError[] {
  const errors: IValidationError[] = []
  if (!candidate || typeof candidate !== 'object') {
    errors.push({ spaceName: label, field: '(root)', reason: 'Not an object' })
    return errors
  }
  const s = candidate as Record<string, unknown>

  const requiredStrings: (keyof ICoworkingSpace)[] = [
    'name',
    'address',
    'googleMapsUrl',
    'description',
    'atmosphereNotes',
    'wifiNotes',
    'climateNotes',
    'foodNotes',
    'drinkNotes',
    'seatingNotes',
    'outletNotes',
  ]
  for (const f of requiredStrings) {
    if (typeof s[f] !== 'string') {
      errors.push({ spaceName: label, field: f, reason: `Expected string, got ${typeof s[f]}` })
    }
  }

  // Structured opening hours: WeeklyHours object or null. hoursNote optional string.
  for (const reason of validateWeeklyHours(s.hours)) {
    errors.push({ spaceName: label, field: 'hours', reason })
  }
  if (s.hoursNote !== undefined && typeof s.hoursNote !== 'string') {
    errors.push({
      spaceName: label,
      field: 'hoursNote',
      reason: `Expected string, got ${typeof s.hoursNote}`,
    })
  }

  if (typeof s.verified !== 'boolean') {
    errors.push({
      spaceName: label,
      field: 'verified',
      reason: `Expected boolean, got ${typeof s.verified}`,
    })
  }

  const coords = s.coordinates as { lat?: unknown; lng?: unknown } | undefined
  if (!coords || typeof coords !== 'object') {
    errors.push({ spaceName: label, field: 'coordinates', reason: 'Missing or not an object' })
  } else {
    if (typeof coords.lat !== 'number') {
      errors.push({ spaceName: label, field: 'coordinates.lat', reason: 'Not a number' })
    }
    if (typeof coords.lng !== 'number') {
      errors.push({ spaceName: label, field: 'coordinates.lng', reason: 'Not a number' })
    }
  }

  // Enum fields: a concrete string, or `null` (unknown) for the nullable ones.
  for (const f of ENUM_FIELD_NAMES) {
    const v = s[f]
    if (v === null) {
      if (!NULLABLE_ENUM_FIELDS.includes(f)) {
        errors.push({
          spaceName: label,
          field: f,
          reason: 'null not allowed (field has no unknown state)',
        })
      }
      continue
    }
    if (typeof v !== 'string') {
      errors.push({
        spaceName: label,
        field: f,
        reason: `Expected string or null, got ${typeof v}`,
      })
    }
  }

  return errors
}

export function isInLeuvenBbox(lat: number, lng: number): boolean {
  return (
    lat >= LEUVEN_BBOX.latMin &&
    lat <= LEUVEN_BBOX.latMax &&
    lng >= LEUVEN_BBOX.lngMin &&
    lng <= LEUVEN_BBOX.lngMax
  )
}

/**
 * Great-circle distance in metres between two lat/lng points (haversine).
 */
export function distanceMetres(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export function normalizeName(n: string): string {
  return n
    .toLowerCase()
    .replace(/[^\w]+/g, '')
    .trim()
}

/**
 * Stringify the spaces array matching the existing file's convention:
 * 2-space indent, but `coordinates` inlined and each `hours` weekday collapsed
 * to a single line (an open grid is far easier to scan and diff than ~40 lines
 * of expanded intervals per space).
 */
export function stringifySpaces(arr: unknown[]): string {
  const pretty = JSON.stringify(arr, null, 2)
  return (
    pretty
      .replace(
        /"coordinates": \{\s+"lat": ([^,]+),\s+"lng": ([^\n]+?)\s+\}/g,
        '"coordinates": { "lat": $1, "lng": $2 }',
      )
      // { "open": "08:00", "close": "23:30" } onto one line
      .replace(/\{\s+"open": ("[^"]+"),\s+"close": ("[^"]+")\s+\}/g, '{ "open": $1, "close": $2 }')
      // a weekday's non-empty interval array onto one line
      .replace(/\[\s+(\{ "open":[\s\S]*?\})\s+\]/g, (_m, inner: string) => {
        return `[${inner.replace(/,\s+/g, ', ')}]`
      })
  )
}

export const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
}
