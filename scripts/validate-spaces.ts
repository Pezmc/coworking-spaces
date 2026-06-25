import spaces from '../src/data/spaces.json'
import { slugify } from '../src/utils/slug'
import { validateWeeklyHours } from '../src/utils/hoursBasic'
import { validateWifiSpeedMbps } from '../src/utils/wifiSpeed'
import { WIFI_SPEEDS, type WifiSpeed } from '../src/types/space'

const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

interface IValidationWarning {
  spaceId: string
  spaceName: string
  issue: string
}

// Coordinate / name / address problems are advisory (warn, exit 0) — the
// historical behaviour. Structured-hours problems are HARD ERRORS (exit 1):
// invalid or incomplete hours silently drop a venue from time filters or
// render a misleading schedule, so the build must fail rather than ship them.
const warnings: IValidationWarning[] = []
const errors: IValidationWarning[] = []

for (const space of spaces) {
  const spaceId = space.name ? slugify(space.name) : 'unnamed'
  const name = space.name || '[unnamed]'

  // Check for missing or invalid coordinates
  if (!space.coordinates) {
    warnings.push({
      spaceId,
      spaceName: name,
      issue: 'Missing coordinates',
    })
  } else {
    const { lat, lng } = space.coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      warnings.push({
        spaceId,
        spaceName: name,
        issue: 'Invalid coordinates (lat/lng must be numbers)',
      })
    } else if (lat < -90 || lat > 90) {
      warnings.push({
        spaceId,
        spaceName: name,
        issue: `Invalid latitude: ${lat} (must be between -90 and 90)`,
      })
    } else if (lng < -180 || lng > 180) {
      warnings.push({
        spaceId,
        spaceName: name,
        issue: `Invalid longitude: ${lng} (must be between -180 and 180)`,
      })
    }
  }

  // Check for missing required fields
  if (!space.name?.trim()) {
    warnings.push({
      spaceId,
      spaceName: name,
      issue: 'Missing name',
    })
  }

  if (!space.address?.trim()) {
    warnings.push({
      spaceId,
      spaceName: name,
      issue: 'Missing address',
    })
  }

  if (!space.googleMapsUrl?.trim()) {
    warnings.push({
      spaceId,
      spaceName: name,
      issue: 'Missing Google Maps URL',
    })
  }

  // Structured opening hours must be a valid WeeklyHours object or null.
  for (const issue of validateWeeklyHours((space as { hours?: unknown }).hours)) {
    errors.push({ spaceId, spaceName: name, issue })
  }

  // wifiSpeed must be null when wifiSpeedMbps is set (derived), else a stored bucket.
  const wifiMbps = (space as { wifiSpeedMbps?: unknown }).wifiSpeedMbps
  const wifiIssues = validateWifiSpeedMbps(wifiMbps)
  for (const issue of wifiIssues) {
    errors.push({ spaceId, spaceName: name, issue })
  }
  if (wifiIssues.length === 0) {
    const ws = (space as { wifiSpeed?: unknown }).wifiSpeed
    if (wifiMbps !== null && ws !== null) {
      errors.push({
        spaceId,
        spaceName: name,
        issue: 'wifiSpeed must be null when wifiSpeedMbps is set',
      })
    } else if (wifiMbps === null && !WIFI_SPEEDS.includes(ws as WifiSpeed)) {
      errors.push({
        spaceId,
        spaceName: name,
        issue: `wifiSpeed must be ${WIFI_SPEEDS.join('|')} when there is no measurement`,
      })
    }
  }
}

if (warnings.length > 0) {
  console.warn(`\n${YELLOW}⚠️  Space data validation warnings:${RESET}\n`)
  for (const warning of warnings) {
    console.warn(`${YELLOW}  • ${warning.spaceName} (${warning.spaceId}): ${warning.issue}${RESET}`)
  }
  console.warn('')
}

if (errors.length > 0) {
  console.error(`\n${RED}✖ Space data validation errors (build blocked):${RESET}\n`)
  for (const error of errors) {
    console.error(`${RED}  • ${error.spaceName} (${error.spaceId}): ${error.issue}${RESET}`)
  }
  console.error('')
  process.exit(1)
}

process.exit(0)
