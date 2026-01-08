// Standardized enum values for filtering
export const NOISE_LEVELS = ['quiet', 'medium', 'loud'] as const
export const WIFI_SPEEDS = ['unknown', 'slow', 'medium', 'fast'] as const
export const AC_OPTIONS = ['yes', 'no', 'unknown'] as const
export const FOOD_OPTIONS = ['none', 'light', 'full'] as const
export const SEATING_TYPES = ['individual', 'mixed', 'group'] as const
export const OUTLET_OPTIONS = ['few', 'some', 'many', 'unknown'] as const

export type NoiseLevel = typeof NOISE_LEVELS[number]
export type WifiSpeed = typeof WIFI_SPEEDS[number]
export type HasAC = typeof AC_OPTIONS[number]
export type FoodAvailability = typeof FOOD_OPTIONS[number]
export type SeatingType = typeof SEATING_TYPES[number]
export type OutletAvailability = typeof OUTLET_OPTIONS[number]

export interface ICoworkingSpace {
  // Unique identifier
  id: string

  // Basic info
  name: string
  address: string
  googleMapsUrl: string

  // Standardized fields for filtering
  noiseLevel: NoiseLevel
  wifiSpeed: WifiSpeed
  hasAC: HasAC
  foodAvailability: FoodAvailability
  seatingType: SeatingType
  hasOutlets: OutletAvailability

  // Free-form descriptive fields
  atmosphere: string
  spaceDescription: string
  wifiDetails: string
  noiseNotes: string
  climateNotes: string
  drinks: string
  foodNotes: string
  openingHours: string
  notes: string
}

export interface IFilterState {
  noiseLevel: NoiseLevel | 'all'
  wifiSpeed: WifiSpeed | 'all'
  hasAC: HasAC | 'all'
  foodAvailability: FoodAvailability | 'all'
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

export const FOOD_LABELS: Record<FoodAvailability, string> = {
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

