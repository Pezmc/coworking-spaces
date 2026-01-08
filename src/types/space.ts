// Standardized enum values for filtering
export const NOISE_LEVELS = ['quiet', 'medium', 'loud'] as const
export const WIFI_SPEEDS = ['unknown', 'slow', 'medium', 'fast'] as const
export const AC_OPTIONS = ['yes', 'no', 'unknown'] as const
export const FOOD_AND_DRINK_OPTIONS = ['none', 'light', 'full'] as const
export const SEATING_TYPES = ['individual', 'mixed', 'group'] as const
export const OUTLET_OPTIONS = ['few', 'some', 'many', 'unknown'] as const

export type NoiseLevel = typeof NOISE_LEVELS[number]
export type WifiSpeed = typeof WIFI_SPEEDS[number]
export type HasAC = typeof AC_OPTIONS[number]
export type FoodAndDrinkAvailability = typeof FOOD_AND_DRINK_OPTIONS[number]
export type SeatingType = typeof SEATING_TYPES[number]
export type OutletAvailability = typeof OUTLET_OPTIONS[number]

export interface ICoordinates {
  lat: number
  lng: number
}

export interface ICoworkingSpace {
  // Basic info
  name: string
  address: string
  googleMapsUrl: string
  coordinates: ICoordinates

  // Standardized fields for filtering
  noiseLevel: NoiseLevel
  wifiSpeed: WifiSpeed
  hasAC: HasAC
  foodAndDrinkAvailability: FoodAndDrinkAvailability
  seatingType: SeatingType
  hasOutlets: OutletAvailability

  // Free-form detail fields
  description: string // general description of the space, shows on card
  openingHours: string // when open

  // Descriptive fields for standardised options
  atmosphereNotes: string // detail on the vibe/feeling/noise (noiseLevel)
  wifiNotes: string // speed test results if available (wifiSpeed)
  climateNotes: string // heating/cooling info (hasAC)
  foodNotes: string // notes about food (foodAndDrinkAvailability)
  drinkNotes: string // notes about drinks (foodAndDrinkAvailability)
  seatingNotes: string // description of the seating and layout (seatingType)
  outletNotes: string // notes about outlets (hasOutlets)
}

export interface IFilterState {
  noiseLevel: NoiseLevel | 'all'
  wifiSpeed: WifiSpeed | 'all'
  hasAC: HasAC | 'all'
  foodAvailability: FoodAndDrinkAvailability | 'all'
  seatingType: SeatingType | 'all'
  hasOutlets: OutletAvailability | 'all'
}

export type SortField = 'name' | 'wifiSpeed' | 'noiseLevel'
export type SortDirection = 'asc' | 'desc'

export interface ISortState {
  field: SortField
  direction: SortDirection
}

// Helper labels for display
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
  few: 'Few Outlets',
  some: 'Some Outlets',
  many: 'Many Outlets',
  unknown: 'Unknown',
}

// Category descriptions for tooltips and documentation
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
  few: '1–2 outlets in the space – arrive early to claim one',
  some: 'Several outlets available – most seats have access',
  many: 'Outlets at every table or seat – no worries about power',
}

export const AC_DESCRIPTIONS: Record<HasAC, string> = {
  unknown: 'Climate control has not been checked yet',
  yes: 'Air conditioning available – stays cool in summer',
  no: 'No air conditioning – may be warm on hot days',
}

