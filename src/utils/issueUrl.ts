import type { ICoworkingSpace } from '../types/space'

const GITHUB_REPO = 'Pezmc/coworking-spaces'

export const NEW_SPACE_URL = `https://github.com/${GITHUB_REPO}/issues/new?template=suggest-space.yml`

/**
 * Builds a GitHub issue URL for updating/verifying a space with pre-populated fields
 */
export function buildUpdateSpaceUrl(space: ICoworkingSpace): string {
  const baseUrl = `https://github.com/${GITHUB_REPO}/issues/new`

  const params = new URLSearchParams({
    template: 'update-space.yml',
    title: `[Update]: ${space.name}`,
    name: space.name,
    address: space.address,
    'google-maps': space.googleMapsUrl,
  })

  // Add optional fields if they have values
  if (space.description) {
    params.set('description', space.description)
  }

  if (space.openingHours) {
    params.set('opening-hours', space.openingHours)
  }

  if (space.atmosphereNotes) {
    params.set('atmosphere-notes', space.atmosphereNotes)
  }

  if (space.wifiNotes) {
    params.set('wifi-notes', space.wifiNotes)
  }

  if (space.climateNotes) {
    params.set('climate-notes', space.climateNotes)
  }

  if (space.foodNotes) {
    params.set('food-notes', space.foodNotes)
  }

  if (space.drinkNotes) {
    params.set('drink-notes', space.drinkNotes)
  }

  if (space.seatingNotes) {
    params.set('seating-notes', space.seatingNotes)
  }

  if (space.outletNotes) {
    params.set('outlet-notes', space.outletNotes)
  }

  return `${baseUrl}?${params.toString()}`
}
