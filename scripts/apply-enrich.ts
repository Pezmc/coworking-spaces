import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import spaces from '../src/data/spaces.json'
import {
  extractJson,
  validateSpaceShape,
  ENUM_FIELDS,
  ENUM_FIELD_NAMES,
  IMMUTABLE_FIELDS,
  stringifySpaces,
  atomicWriteFile,
  colors,
  type EnumFieldName,
} from './space-validator'
import type { ICoworkingSpace } from '../src/types/space'

const REPO_ROOT = join(import.meta.dir, '..')
const RESPONSE_FILE = join(REPO_ROOT, '.gstack', 'enrich-response.txt')
const LOG_FILE = join(REPO_ROOT, '.gstack', 'enrichment-log.jsonl')
const SPACES_FILE = join(REPO_ROOT, 'src', 'data', 'spaces.json')

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const TOOL = (args.find((a) => a.startsWith('--tool='))?.split('=')[1] ?? 'unknown-llm').trim()

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
const bySpaceName = new Map(allSpaces.map((s) => [s.name, s]))

interface IAcceptedChange {
  spaceName: string
  field: EnumFieldName
  oldValue: string | null
  newValue: string
}

interface IRejectedChange {
  spaceName: string
  field: string
  reason: string
  oldValue: unknown
  newValue: unknown
}

const accepted: IAcceptedChange[] = []
const rejected: IRejectedChange[] = []
const validationErrors: string[] = []

for (let i = 0; i < parsed.length; i++) {
  const candidate = parsed[i] as Partial<ICoworkingSpace>
  const label = candidate.name ?? `(index ${i})`
  const errs = validateSpaceShape(candidate, label)
  if (errs.length > 0) {
    for (const e of errs) validationErrors.push(`${e.spaceName}: ${e.field} — ${e.reason}`)
    continue
  }

  const current = bySpaceName.get(candidate.name!)
  if (!current) {
    validationErrors.push(
      `${candidate.name}: not found in spaces.json (enrichment cannot add new spaces)`,
    )
    continue
  }

  // Verified: true spaces are input context only; silently discard any change.
  if (current.verified) {
    for (const key of Object.keys(candidate) as (keyof ICoworkingSpace)[]) {
      if (JSON.stringify(candidate[key]) !== JSON.stringify(current[key])) {
        rejected.push({
          spaceName: current.name,
          field: String(key),
          reason: 'verified:true — all changes discarded',
          oldValue: current[key],
          newValue: candidate[key],
        })
      }
    }
    continue
  }

  // Non-verified: immutable fields must not change.
  for (const field of IMMUTABLE_FIELDS) {
    const before = (current as Record<string, unknown>)[field]
    const after = (candidate as Record<string, unknown>)[field]
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      rejected.push({
        spaceName: current.name,
        field,
        reason: 'immutable field changed on non-verified space',
        oldValue: before,
        newValue: after,
      })
    }
  }

  // Non-verified: enum fields may only transition null (unknown) -> allowed value.
  for (const field of ENUM_FIELD_NAMES) {
    const before = (current as Record<string, unknown>)[field] as string | null
    const after = (candidate as Record<string, unknown>)[field] as string | null
    if (before === after) continue
    if (before !== null) {
      rejected.push({
        spaceName: current.name,
        field,
        reason: `already-set field would change (${before} -> ${after})`,
        oldValue: before,
        newValue: after,
      })
      continue
    }
    const allowed = ENUM_FIELDS[field] as readonly string[]
    if (after === null || !allowed.includes(after)) {
      rejected.push({
        spaceName: current.name,
        field,
        reason: `invalid enum value (${after}); allowed: ${allowed.join('|')}`,
        oldValue: before,
        newValue: after,
      })
      continue
    }
    // Within-response dedup: reject if an earlier candidate in this response
    // already proposed a transition for the same (space, field). Without this,
    // a duplicate object in the LLM output would silently let the later value win.
    const dupe = accepted.find((a) => a.spaceName === current.name && a.field === field)
    if (dupe) {
      rejected.push({
        spaceName: current.name,
        field,
        reason: `duplicate transition in response (already accepted ${dupe.oldValue} -> ${dupe.newValue})`,
        oldValue: before,
        newValue: after,
      })
      continue
    }
    accepted.push({
      spaceName: current.name,
      field,
      oldValue: before,
      newValue: after,
    })
  }
}

if (validationErrors.length > 0) {
  console.error(`${colors.red}${colors.bold}Validation errors:${colors.reset}`)
  for (const e of validationErrors) console.error(`  ${colors.red}• ${e}${colors.reset}`)
  console.error(
    `\n${colors.red}Refusing to apply any changes until validation errors are fixed.${colors.reset}`,
  )
  process.exit(1)
}

console.log(`${colors.bold}Enrichment review${colors.reset} (tool: ${TOOL})\n`)

if (accepted.length === 0 && rejected.length === 0) {
  console.log(`${colors.dim}No changes proposed.${colors.reset}`)
  process.exit(0)
}

if (rejected.length > 0) {
  console.log(`${colors.yellow}${colors.bold}Rejected (${rejected.length}):${colors.reset}`)
  for (const r of rejected) {
    console.log(
      `  ${colors.yellow}✗${colors.reset} ${colors.bold}${r.spaceName}${colors.reset} · ${r.field}`,
    )
    console.log(`      ${colors.dim}reason:${colors.reset} ${r.reason}`)
    console.log(
      `      ${colors.dim}old:${colors.reset} ${JSON.stringify(r.oldValue)}  ${colors.dim}new:${colors.reset} ${JSON.stringify(r.newValue)}`,
    )
  }
  console.log('')
}

if (accepted.length > 0) {
  console.log(`${colors.green}${colors.bold}Accepted (${accepted.length}):${colors.reset}`)
  const byName = new Map<string, IAcceptedChange[]>()
  for (const a of accepted) {
    if (!byName.has(a.spaceName)) byName.set(a.spaceName, [])
    byName.get(a.spaceName)!.push(a)
  }
  for (const [name, changes] of byName) {
    console.log(`  ${colors.green}✓${colors.reset} ${colors.bold}${name}${colors.reset}`)
    for (const c of changes) {
      console.log(
        `      ${c.field}: ${colors.red}${c.oldValue}${colors.reset} → ${colors.green}${c.newValue}${colors.reset}`,
      )
    }
  }
  console.log('')
}

if (!APPLY) {
  console.log(
    `${colors.cyan}Dry run. Re-run with ${colors.bold}--apply${colors.reset}${colors.cyan} to write changes.${colors.reset}`,
  )
  process.exit(0)
}

// Apply accepted changes in-place.
const byName = new Map<string, IAcceptedChange[]>()
for (const a of accepted) {
  if (!byName.has(a.spaceName)) byName.set(a.spaceName, [])
  byName.get(a.spaceName)!.push(a)
}

const updated = allSpaces.map((s) => {
  const changes = byName.get(s.name)
  if (!changes) return s
  const copy: Record<string, unknown> = { ...s }
  for (const c of changes) copy[c.field] = c.newValue
  return copy as ICoworkingSpace
})

atomicWriteFile(SPACES_FILE, stringifySpaces(updated) + '\n')

mkdirSync(join(REPO_ROOT, '.gstack'), { recursive: true })
const ts = new Date().toISOString()
for (const c of accepted) {
  appendFileSync(
    LOG_FILE,
    JSON.stringify({
      timestamp: ts,
      spaceName: c.spaceName,
      field: c.field,
      oldValue: c.oldValue,
      newValue: c.newValue,
      tool: TOOL,
    }) + '\n',
    'utf8',
  )
}

console.log(`${colors.green}Applied ${accepted.length} field change(s).${colors.reset}`)
console.log(`Wrote ${SPACES_FILE}`)
console.log(`Logged to ${LOG_FILE}`)
