import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import spaces from '../src/data/spaces.json'
import {
  extractJson,
  validateSpaceShape,
  validateEnumValues,
  isInLeuvenBbox,
  distanceMetres,
  normalizeName,
  stringifySpaces,
  atomicWriteFile,
  pickKnownSpaceFields,
  colors,
  PROXIMITY_DUPE_METRES,
} from './space-validator'
import { formatHours } from '../src/utils/hoursBasic'
import type { ICoworkingSpace } from '../src/types/space'

const REPO_ROOT = join(import.meta.dir, '..')
const RESPONSE_FILE = join(REPO_ROOT, '.gstack', 'discover-response.txt')
const SPACES_FILE = join(REPO_ROOT, 'src', 'data', 'spaces.json')

const args = process.argv.slice(2)
const AUTO_YES = args.includes('--yes')

if (!existsSync(RESPONSE_FILE)) {
  console.error(`${colors.red}ERROR: ${RESPONSE_FILE} not found.${colors.reset}`)
  console.error(`Paste the LLM response into that file and re-run.`)
  process.exit(1)
}

const raw = readFileSync(RESPONSE_FILE, 'utf8')
const parsed = extractJson(raw)
if (!parsed) {
  console.error(`${colors.red}ERROR: Could not extract JSON from response.${colors.reset}`)
  console.error(`Tried fenced \`\`\`json block and bracket-matched array. Neither parsed.`)
  console.error(`First 500 chars of response:`)
  console.error(raw.slice(0, 500))
  process.exit(1)
}

if (!Array.isArray(parsed)) {
  console.error(`${colors.red}ERROR: Extracted JSON is not an array.${colors.reset}`)
  process.exit(1)
}

const allSpaces = spaces as ICoworkingSpace[]
const existingNorms = new Set(allSpaces.map((s) => normalizeName(s.name)))

interface IRejection {
  label: string
  reason: string
}
interface ICandidate {
  space: ICoworkingSpace
  notes: string[]
}

const rejections: IRejection[] = []
const candidates: ICandidate[] = []

for (let i = 0; i < parsed.length; i++) {
  const c = parsed[i] as Partial<ICoworkingSpace>
  const label = c.name ?? `(index ${i})`

  const errs = validateSpaceShape(c, label)
  if (errs.length > 0) {
    rejections.push({
      label,
      reason: `shape errors: ${errs.map((e) => `${e.field} (${e.reason})`).join('; ')}`,
    })
    continue
  }

  const enumErrs = validateEnumValues(c as Record<string, unknown>)
  if (enumErrs.length > 0) {
    rejections.push({
      label,
      reason: `enum errors: ${enumErrs.map((e) => `${e.field} (${e.reason})`).join('; ')}`,
    })
    continue
  }

  const space = c as ICoworkingSpace

  if (space.verified !== false) {
    rejections.push({
      label,
      reason: `verified must be false on new spaces (got ${JSON.stringify(space.verified)})`,
    })
    continue
  }

  if (!isInLeuvenBbox(space.coordinates.lat, space.coordinates.lng)) {
    rejections.push({
      label,
      reason: `coordinates ${space.coordinates.lat},${space.coordinates.lng} outside Leuven bbox`,
    })
    continue
  }

  if (existingNorms.has(normalizeName(space.name))) {
    rejections.push({ label, reason: 'duplicate name matches an existing space' })
    continue
  }

  // Within-response dedup: also check against earlier candidates accepted in this run.
  const allKnownSpaces: { name: string; coordinates: { lat: number; lng: number } }[] = [
    ...allSpaces,
    ...candidates.map((c) => c.space),
  ]
  const near = allKnownSpaces.find(
    (s) => distanceMetres(s.coordinates, space.coordinates) < PROXIMITY_DUPE_METRES,
  )
  if (near) {
    rejections.push({
      label,
      reason: `within ${PROXIMITY_DUPE_METRES}m of existing "${near.name}" (${Math.round(distanceMetres(near.coordinates, space.coordinates))}m)`,
    })
    continue
  }

  // Persist only known fields; LLM noise (sourceUrls, confidence, etc.) gets dropped.
  const cleanSpace = pickKnownSpaceFields(c as Record<string, unknown>)
  const notes: string[] = []
  if (cleanSpace.noiseLevel === 'unknown') notes.push('noiseLevel=unknown')
  if (cleanSpace.seatingType === 'unknown') notes.push('seatingType=unknown')
  existingNorms.add(normalizeName(cleanSpace.name))
  candidates.push({ space: cleanSpace, notes })
}

console.log(`${colors.bold}Discovery review${colors.reset}`)
console.log(`  ${parsed.length} candidates parsed`)
console.log(`  ${candidates.length} passed automated checks`)
console.log(`  ${rejections.length} rejected`)
console.log('')

if (rejections.length > 0) {
  console.log(`${colors.yellow}${colors.bold}Rejected:${colors.reset}`)
  for (const r of rejections) {
    console.log(
      `  ${colors.yellow}✗${colors.reset} ${colors.bold}${r.label}${colors.reset} — ${r.reason}`,
    )
  }
  console.log('')
}

if (candidates.length === 0) {
  console.log(`${colors.dim}Nothing to add.${colors.reset}`)
  process.exit(0)
}

async function askYesNo(rl: ReturnType<typeof createInterface>, q: string): Promise<boolean> {
  while (true) {
    const answer = (await rl.question(q)).trim().toLowerCase()
    if (answer === 'y' || answer === 'yes') return true
    if (answer === 'n' || answer === 'no' || answer === '') return false
  }
}

const accepted: ICoworkingSpace[] = []

if (AUTO_YES) {
  console.log(
    `${colors.cyan}--yes flag set: accepting all ${candidates.length} candidates${colors.reset}\n`,
  )
  for (const c of candidates) accepted.push(c.space)
} else {
  const rl = createInterface({ input, output })
  for (let i = 0; i < candidates.length; i++) {
    const { space, notes } = candidates[i]
    console.log(
      `\n${colors.cyan}${colors.bold}[${i + 1}/${candidates.length}] ${space.name}${colors.reset}`,
    )
    console.log(`  ${colors.dim}address:${colors.reset} ${space.address}`)
    console.log(
      `  ${colors.dim}coords:${colors.reset}  ${space.coordinates.lat},${space.coordinates.lng}`,
    )
    console.log(`  ${colors.dim}gmaps:${colors.reset}   ${space.googleMapsUrl}`)
    console.log(
      `  ${colors.dim}enums:${colors.reset}   noise=${space.noiseLevel} wifi=${space.wifiSpeed} ac=${space.hasAC} food=${space.foodAndDrinkAvailability} seat=${space.seatingType} outlets=${space.hasOutlets}`,
    )
    console.log(
      `  ${colors.dim}hours:${colors.reset}   ${formatHours(space.hours) || '(unknown)'}${space.hoursNote ? ` — ${space.hoursNote}` : ''}`,
    )
    console.log(`  ${colors.dim}desc:${colors.reset}    ${space.description}`)
    if (notes.length > 0) {
      console.log(`  ${colors.yellow}notes:${colors.reset}   ${notes.join(', ')}`)
    }
    const ok = await askYesNo(rl, `  ${colors.bold}Add this space? [y/N]${colors.reset} `)
    if (ok) accepted.push(space)
  }
  rl.close()
}

if (accepted.length === 0) {
  console.log(`\n${colors.dim}Nothing accepted.${colors.reset}`)
  process.exit(0)
}

const merged = [...allSpaces, ...accepted]
atomicWriteFile(SPACES_FILE, stringifySpaces(merged) + '\n')

console.log(
  `\n${colors.green}${colors.bold}Added ${accepted.length} new space(s) to ${SPACES_FILE}${colors.reset}`,
)
for (const a of accepted) console.log(`  ${colors.green}+${colors.reset} ${a.name}`)
