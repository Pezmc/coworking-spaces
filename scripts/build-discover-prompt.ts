import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import spaces from '../src/data/spaces.json'
import { LEUVEN_BBOX } from './space-validator'
import type { ICoworkingSpace } from '../src/types/space'

const REPO_ROOT = join(import.meta.dir, '..')
const OUT_DIR = join(REPO_ROOT, '.gstack')
const OUT_FILE = join(OUT_DIR, 'discover-prompt.txt')

const args = process.argv.slice(2)
const countArg = args.find((a) => a.startsWith('--count='))
const COUNT = countArg ? parseInt(countArg.split('=')[1], 10) : 10

const all = spaces as ICoworkingSpace[]
const existingNames = all.map((s) => s.name).sort()

// Grab a verified space as a shape example so the LLM matches style.
const example = all.find((s) => s.verified) ?? all[0]

const rubric = `FIELD RUBRICS (use EXACT string values):

- noiseLevel: "quiet" | "medium" | "loud" (avoid "unknown" for new spaces)
- wifiSpeed: "slow" | "medium" | "fast" | "unknown"
- wifiSpeedMbps: object { "down": number, "up": number, "latencyMs"?: number } in
  Mbps when a speed test is known, otherwise null. When set, it MUST agree with
  wifiSpeed (down >100 → "fast", 25–100 → "medium", <25 → "slow"); a number-less
  reputation ("reported to have decent wifi") stays null with a hand-set wifiSpeed.
- hasAC: "yes" | "no" | "unknown"
- foodAndDrinkAvailability: "none" | "light" | "full"
- seatingType: "individual" | "mixed" | "group"
- hasOutlets: "few" | "some" | "many" | "unknown"
- hours: object with keys monday..sunday (all seven required), each an array of
  { "open": "HH:MM", "close": "HH:MM" } in 24-hour time. Use [] for a day the
  venue is closed. If a venue closes after midnight, set close to the
  post-midnight time (e.g. "01:00") — it is attributed to the next day. Use a
  close of "24:00" for "open until midnight". Set hours to null only if you
  genuinely cannot find any opening hours.
- hoursNote (optional): a short free-text caveat that doesn't fit the grid, e.g.
  "Occasional Sunday brunch". Omit the key entirely when there is none.`

const prompt = `You are researching laptop-friendly coworking cafes in Leuven, Belgium.

TASK: Find ${COUNT} spaces in Leuven NOT in the existing list below that would be
good for working on a laptop. Cafes, libraries, hotel lobbies, bookable coworking
spaces, bookshops with seating — all fair game. Prioritise USEFULNESS for someone
looking for "where can I work this afternoon?", not comprehensiveness.

HARD CONSTRAINTS:
- Coordinates MUST fall inside the Leuven bounding box:
    lat ${LEUVEN_BBOX.latMin}..${LEUVEN_BBOX.latMax}
    lng ${LEUVEN_BBOX.lngMin}..${LEUVEN_BBOX.lngMax}
- Do NOT include any space with a name or location within ~50m of one in the
  existing list below. Different branches of the same chain at different
  addresses ARE allowed.
- Every space object MUST include every field shown in the example below.
- Set "verified": false on every new entry.
- Fill fields with high-confidence values. Only use "unknown" on wifiSpeed, hasAC,
  hasOutlets if no public evidence exists; noiseLevel, seatingType, and
  foodAndDrinkAvailability should be filled based on reviews / site photos /
  menu pages.
- Return exactly one fenced \`\`\`json code block containing a JSON array of
  ${COUNT} space objects. A short summary sentence BEFORE the block is OK; nothing
  AFTER.

${rubric}

EXAMPLE SHAPE (copy this structure exactly):

\`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\`

EXISTING SPACES — DO NOT PROPOSE THESE (or anything within 50m):
${existingNames.map((n) => `- ${n}`).join('\n')}

Return ${COUNT} new laptop-friendly spaces in Leuven as a JSON array matching the example shape.
`

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_FILE, prompt, 'utf8')

console.log(`Wrote ${OUT_FILE}`)
console.log(`  Target: ${COUNT} new spaces`)
console.log(`  Excluding ${existingNames.length} existing spaces`)
console.log('')
console.log('Next: paste the prompt into Gemini/ChatGPT, save the response to')
console.log('  .gstack/discover-response.txt')
console.log('Then run: bun scripts/apply-discover.ts')
