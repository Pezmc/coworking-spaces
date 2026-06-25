import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import spaces from '../src/data/spaces.json'
import { ENUM_FIELD_NAMES, type EnumFieldName } from './space-validator'
import type { ICoworkingSpace } from '../src/types/space'

const REPO_ROOT = join(import.meta.dir, '..')
const OUT_DIR = join(REPO_ROOT, '.gstack')
const OUT_FILE = join(OUT_DIR, 'enrich-prompt.txt')

const all = spaces as ICoworkingSpace[]

function hasUnknown(s: ICoworkingSpace): boolean {
  return ENUM_FIELD_NAMES.some((f) => (s as Record<string, unknown>)[f] === 'unknown')
}

const candidates = all.filter((s) => !s.verified && hasUnknown(s))

const rubric = `FIELD RUBRICS (use EXACT string values, lowercase):

- noiseLevel: "quiet" | "medium" | "loud" | "unknown"
  - quiet = library-level, no conversation audible
  - medium = background chatter, some music, focus-able with headphones
  - loud = busy cafe, hard to take calls

- wifiSpeed: "slow" | "medium" | "fast" | "unknown"
  - slow = under 25 Mbps or widely reported as bad
  - medium = 25-100 Mbps, fine for browsing and calls
  - fast = over 100 Mbps or advertised as fiber/pro-grade

- hasAC: "yes" | "no" | "unknown"
  - Treat "yes" as present AND functional in summer, not just installed

- foodAndDrinkAvailability: "none" | "light" | "full"
  - none = drinks only
  - light = snacks, sandwiches, pastries
  - full = proper meals

- seatingType: "individual" | "mixed" | "group"
  - individual = mostly 1-2 person tables
  - group = mostly 4+ person tables or communal benches
  - mixed = both

- hasOutlets: "few" | "some" | "many" | "unknown"
  - few = 1-3 outlets, first-come-first-served
  - some = outlets at most tables but not all
  - many = every table has an outlet OR abundant multi-gang strips`

const prompt = `You are researching laptop-friendly coworking cafes in Leuven, Belgium.

TASK: For each space below, use web search to fill fields currently set to "unknown".
Return the SAME JSON structure with "unknown" replaced only where high-confidence
evidence exists.

HARD RULES:
- If you cannot verify a field against (a) an official website, (b) a Google Maps
  review that names the attribute, or (c) a published tourism/coworking listing
  (VisitLeuven, Nomadlist, etc.), leave it as "unknown". Guessing is wrong.
- Do NOT change any field that is not currently "unknown".
- Do NOT reword description, atmosphereNotes, wifiNotes, climateNotes, foodNotes,
  drinkNotes, seatingNotes, outletNotes, hours, hoursNote, address, googleMapsUrl.
  Preserve them byte-for-byte.
- Preserve ALL existing keys and their current values.
- Preserve coordinates exactly.
- Preserve "verified" exactly (will always be false for these candidates).
- Return exactly one fenced \`\`\`json code block containing the full array.
  A short summary sentence BEFORE the block is OK; nothing AFTER.
- Preserve the array length exactly (${candidates.length} items).

${rubric}

SPACES (${candidates.length} candidates, all currently non-verified with at least one "unknown"):

\`\`\`json
${JSON.stringify(candidates, null, 2)}
\`\`\`

Return the same array with unknowns filled where supported by web evidence.
`

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_FILE, prompt, 'utf8')

const unknownCounts: Record<EnumFieldName, number> = {
  noiseLevel: 0,
  wifiSpeed: 0,
  hasAC: 0,
  foodAndDrinkAvailability: 0,
  seatingType: 0,
  hasOutlets: 0,
}
for (const s of candidates) {
  for (const f of ENUM_FIELD_NAMES) {
    if ((s as Record<string, unknown>)[f] === 'unknown') unknownCounts[f]++
  }
}

console.log(`Wrote ${OUT_FILE}`)
console.log(`  ${candidates.length} candidate spaces (non-verified, >=1 unknown)`)
console.log(`  Unknown counts:`)
for (const f of ENUM_FIELD_NAMES) {
  if (unknownCounts[f] > 0) console.log(`    ${f}: ${unknownCounts[f]}`)
}
console.log('')
console.log('Next: paste the prompt into Gemini/ChatGPT, save the response to')
console.log('  .gstack/enrich-response.txt')
console.log('Then run: bun scripts/apply-enrich.ts')
