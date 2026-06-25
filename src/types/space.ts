// Standardized enum values for filtering
export const NOISE_LEVELS = ['quiet', 'medium', 'loud'] as const
export const WIFI_SPEEDS = ['unknown', 'slow', 'medium', 'fast'] as const
export const AC_OPTIONS = ['yes', 'no', 'unknown'] as const
export const FOOD_AND_DRINK_OPTIONS = ['none', 'light', 'full'] as const
export const SEATING_TYPES = ['individual', 'mixed', 'group'] as const
export const OUTLET_OPTIONS = ['none', 'few', 'some', 'many', 'unknown'] as const
export const VERIFIED_OPTIONS = ['all', 'verified', 'unverified'] as const

export type NoiseLevel = (typeof NOISE_LEVELS)[number]
export type WifiSpeed = (typeof WIFI_SPEEDS)[number]
export type HasAC = (typeof AC_OPTIONS)[number]
export type FoodAndDrinkAvailability = (typeof FOOD_AND_DRINK_OPTIONS)[number]
export type SeatingType = (typeof SEATING_TYPES)[number]
export type OutletAvailability = (typeof OUTLET_OPTIONS)[number]

export interface ICoordinates {
  lat: number
  lng: number
}

export type VerifiedFilter = (typeof VERIFIED_OPTIONS)[number]

// Structured opening hours --------------------------------------------------
// `openingHours` used to be a free-form string parsed at filter time; one
// non-conforming entry (a trailing parenthetical) silently dropped a venue
// from every time filter. Hours are now structured data — the source of truth —
// and the human-readable string is derived from them (see utils/hoursBasic.ts).

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

/**
 * One open→close interval on a single day, as 24-hour "HH:MM" (00:00–24:00).
 * If `close` is at or before `open`, the interval runs past midnight into the
 * next day (e.g. `{ open: "15:00", close: "01:00" }` is open until 01:00 the
 * following morning). A `close` of "00:00" or "24:00" means exactly midnight
 * and does not spill into the next day.
 */
export interface IOpeningInterval {
  open: string
  close: string
}

/**
 * A full week of opening hours. Every day key is present; an empty array means
 * closed that day. A space's `hours: null` means hours are unknown (not yet
 * researched) — distinct from "known and closed every day".
 */
export type WeeklyHours = Record<DayOfWeek, IOpeningInterval[]>

// Structured wi-fi speed ----------------------------------------------------
// The measured Mbps used to live only inside the free-text `wifiNotes` prose
// (e.g. "Fast (400 Mbps down, 120 Mbps up)") while the filterable `wifiSpeed`
// bucket was hand-set separately — the two could silently disagree. The number
// is now structured. `wifiSpeed` stays the bucket (it also covers qualitative,
// number-less assessments), but when a measurement IS present it must equal
// deriveWifiSpeed(it), enforced by validation so they can't drift (see
// utils/wifiSpeed.ts).

/**
 * A measured wi-fi speed test, in Mbps, plus optional latency. `wifiSpeedMbps:
 * null` on a space means no measurement (the `wifiSpeed` bucket may still be a
 * qualitative judgement). `up` may exceed `down` — that's what some venues
 * actually measure.
 */
export interface IWifiSpeedMbps {
  down: number
  up: number
  latencyMs?: number
}

export interface ICoworkingSpace {
  // Basic info
  name: string
  address: string
  googleMapsUrl: string
  coordinates: ICoordinates

  // Standardized fields for filtering
  noiseLevel: NoiseLevel
  wifiSpeed: WifiSpeed // bucket: derived from wifiSpeedMbps when measured, else a qualitative judgement
  wifiSpeedMbps: IWifiSpeedMbps | null // measured speed test (Mbps); null = unmeasured
  hasAC: HasAC
  foodAndDrinkAvailability: FoodAndDrinkAvailability
  seatingType: SeatingType
  hasOutlets: OutletAvailability

  // Free-form detail fields
  description: string // general description of the space, shows on card

  // Opening hours: structured source of truth (null = unknown). The display
  // string is derived via formatHours(); hoursNote carries any human caveat
  // that doesn't fit the weekly grid (e.g. "occasional Sunday brunch").
  hours: WeeklyHours | null
  hoursNote?: string

  // Descriptive fields for standardised options
  atmosphereNotes: string // detail on the vibe/feeling/noise (noiseLevel)
  wifiNotes: string // human colour on the wifi (reliability, peak-time dips); the number lives in wifiSpeedMbps
  climateNotes: string // heating/cooling info (hasAC)
  foodNotes: string // notes about food (foodAndDrinkAvailability)
  drinkNotes: string // notes about drinks (foodAndDrinkAvailability)
  seatingNotes: string // description of the seating and layout (seatingType)
  outletNotes: string // notes about outlets (hasOutlets)

  // Verification status
  verified: boolean // has this space been personally visited and verified?

  // Optional photo (relative path under /photos/, scraped from the web)
  imageUrl?: string
}

export interface IFilterState {
  noiseLevel: NoiseLevel | 'all'
  wifiSpeed: WifiSpeed | 'all'
  hasAC: HasAC | 'all'
  foodAvailability: FoodAndDrinkAvailability | 'all'
  seatingType: SeatingType | 'all'
  hasOutlets: OutletAvailability | 'all'
  verified: VerifiedFilter
  openNow: boolean
  openAt: number | null // minutes since midnight (Europe/Brussels), e.g. 1020 = 17:00; null = off
}

export type SortField = 'name' | 'wifiSpeed' | 'noiseLevel'
export type SortDirection = 'asc' | 'desc'

export interface ISortState {
  field: SortField
  direction: SortDirection
}

export const NOISE_LEVEL_LABELS: Record<NoiseLevel, string> = {
  quiet: 'Quiet',
  medium: 'Medium',
  loud: 'Loud',
}

export const WIFI_SPEED_LABELS: Record<WifiSpeed, string> = {
  unknown: 'Unknown',
  slow: 'Slow',
  medium: 'Medium',
  fast: 'Fast',
}

export const AC_LABELS: Record<HasAC, string> = {
  yes: 'Has AC',
  no: 'No AC',
  unknown: 'Unknown',
}

export const FOOD_LABELS: Record<FoodAndDrinkAvailability, string> = {
  none: 'No Food',
  light: 'Light Food',
  full: 'Full Menu',
}

export const SEATING_LABELS: Record<SeatingType, string> = {
  individual: 'Individual Tables',
  mixed: 'Mixed Seating',
  group: 'Group Tables',
}

export const OUTLET_LABELS: Record<OutletAvailability, string> = {
  none: 'No Outlets',
  few: 'Few Outlets',
  some: 'Some Outlets',
  many: 'Many Outlets',
  unknown: 'Unknown',
}

// The Mbps figures here mirror MEDIUM_FLOOR_MBPS (25) and FAST_THRESHOLD_MBPS
// (100) in utils/wifiSpeed.ts (deriveWifiSpeed). Change them together.
export const WIFI_SPEED_DESCRIPTIONS: Record<WifiSpeed, string> = {
  unknown: 'WiFi speed has not been tested yet',
  slow: 'Under 25 Mbps – suitable for browsing and email',
  medium: '25–100 Mbps – good for video calls and general work',
  fast: 'Over 100 Mbps – great for large uploads and multiple devices',
}

export const NOISE_LEVEL_DESCRIPTIONS: Record<NoiseLevel, string> = {
  quiet: 'Library-like atmosphere – minimal background noise, whispered conversations',
  medium: 'Café ambiance – background chatter and music at moderate volume',
  loud: 'Lively environment – loud music, busy conversations, energetic vibe',
}

export const FOOD_DESCRIPTIONS: Record<FoodAndDrinkAvailability, string> = {
  none: 'No food available – drinks only',
  light: 'Snacks and light bites – pastries, sandwiches, simple items',
  full: 'Full menu – hot meals, substantial food options',
}

export const SEATING_DESCRIPTIONS: Record<SeatingType, string> = {
  individual: 'Mostly 1–2 person tables – best for solo work',
  mixed: 'Variety of table sizes – options for both solo and group work',
  group: 'Primarily large tables (4+ people) – communal seating',
}

export const OUTLET_DESCRIPTIONS: Record<OutletAvailability, string> = {
  unknown: 'Outlet availability has not been checked yet',
  none: 'No outlets available – bring a fully charged laptop',
  few: '1–2 outlets in the space – arrive early to claim one',
  some: 'Several outlets available – most seats have access',
  many: 'Outlets at every table or seat – no worries about power',
}

export const AC_DESCRIPTIONS: Record<HasAC, string> = {
  unknown: 'Climate control has not been checked yet',
  yes: 'Air conditioning available – stays cool in summer',
  no: 'No air conditioning – may be warm on hot days',
}

export const VERIFIED_DESCRIPTIONS = {
  verified: 'This space has been personally visited and verified – details are accurate',
  unverified:
    "This space hasn't been verified yet – details may be incomplete or outdated. Help verify it!",
}
