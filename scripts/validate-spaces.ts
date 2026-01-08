import spaces from '../src/data/spaces.json'

const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

interface IValidationWarning {
  spaceId: string
  spaceName: string
  issue: string
}

const warnings: IValidationWarning[] = []

for (const space of spaces) {
  // Check for missing or invalid coordinates
  if (!space.coordinates) {
    warnings.push({
      spaceId: space.id,
      spaceName: space.name,
      issue: 'Missing coordinates',
    })
  } else {
    const { lat, lng } = space.coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      warnings.push({
        spaceId: space.id,
        spaceName: space.name,
        issue: 'Invalid coordinates (lat/lng must be numbers)',
      })
    } else if (lat < -90 || lat > 90) {
      warnings.push({
        spaceId: space.id,
        spaceName: space.name,
        issue: `Invalid latitude: ${lat} (must be between -90 and 90)`,
      })
    } else if (lng < -180 || lng > 180) {
      warnings.push({
        spaceId: space.id,
        spaceName: space.name,
        issue: `Invalid longitude: ${lng} (must be between -180 and 180)`,
      })
    }
  }

  // Check for missing required fields
  if (!space.name?.trim()) {
    warnings.push({
      spaceId: space.id,
      spaceName: space.name || '(unnamed)',
      issue: 'Missing name',
    })
  }

  if (!space.address?.trim()) {
    warnings.push({
      spaceId: space.id,
      spaceName: space.name,
      issue: 'Missing address',
    })
  }

  if (!space.googleMapsUrl?.trim()) {
    warnings.push({
      spaceId: space.id,
      spaceName: space.name,
      issue: 'Missing Google Maps URL',
    })
  }
}

if (warnings.length > 0) {
  console.warn(`\n${YELLOW}⚠️  Space data validation warnings:${RESET}\n`)
  for (const warning of warnings) {
    console.warn(`${YELLOW}  • ${warning.spaceName} (${warning.spaceId}): ${warning.issue}${RESET}`)
  }
  console.warn('')
}

process.exit(0)

