import { describe, expect, it } from 'vitest'
import { parseAsk } from '../src/utils/askParser'

describe('parseAsk', () => {
  it('returns empty matches for empty input', () => {
    const r = parseAsk('')
    expect(r.matches).toEqual([])
    expect(r.filterPatch).toEqual({})
  })

  it('returns empty matches for whitespace', () => {
    const r = parseAsk('   ')
    expect(r.matches).toEqual([])
    expect(r.filterPatch).toEqual({})
  })

  it('returns empty matches for garbage with no known phrases', () => {
    const r = parseAsk('xyzzy plover frobnicate')
    expect(r.matches).toEqual([])
    expect(r.filterPatch).toEqual({})
  })

  it('matches "quiet" → noiseLevel=quiet', () => {
    const r = parseAsk('somewhere quiet please')
    expect(r.filterPatch).toEqual({ noiseLevel: 'quiet' })
    expect(r.matches.map((m) => m.label)).toEqual(['Quiet'])
  })

  it('matches "deep work" (multi-word) → noiseLevel=quiet', () => {
    const r = parseAsk('need a deep work spot')
    expect(r.filterPatch).toEqual({ noiseLevel: 'quiet' })
  })

  it('matches "lively" → noiseLevel=loud', () => {
    const r = parseAsk('looking for somewhere lively and buzzy')
    expect(r.filterPatch).toEqual({ noiseLevel: 'loud' })
  })

  it('matches "fast wifi" → wifiSpeed=fast', () => {
    const r = parseAsk('i need fast wifi for uploads')
    expect(r.filterPatch).toEqual({ wifiSpeed: 'fast' })
  })

  it('matches "zoom" → wifiSpeed=fast', () => {
    const r = parseAsk('have a zoom in 20 min')
    expect(r.filterPatch).toEqual({ wifiSpeed: 'fast' })
  })

  it('matches "hot" → hasAC=yes', () => {
    const r = parseAsk('so hot today')
    expect(r.filterPatch).toEqual({ hasAC: 'yes' })
  })

  it('matches "air con" (2-word phrase) → hasAC=yes', () => {
    const r = parseAsk('need somewhere with air con')
    expect(r.filterPatch).toEqual({ hasAC: 'yes' })
  })

  it('matches "outlets" → hasOutlets=many', () => {
    const r = parseAsk('many outlets please')
    expect(r.filterPatch).toEqual({ hasOutlets: 'many' })
  })

  it('matches "battery dying" → hasOutlets=many', () => {
    const r = parseAsk('my battery is dying — battery dying here')
    expect(r.filterPatch).toEqual({ hasOutlets: 'many' })
  })

  it('matches "lunch" → foodAvailability=full', () => {
    const r = parseAsk('need lunch')
    expect(r.filterPatch).toEqual({ foodAvailability: 'full' })
  })

  it('matches "pastry" → foodAvailability=light', () => {
    const r = parseAsk('just a pastry to go with my coffee')
    expect(r.filterPatch).toEqual({ foodAvailability: 'light' })
  })

  it('matches "hot food" (multi-word beats "hot" AC match)', () => {
    const r = parseAsk('need hot food')
    expect(r.filterPatch).toEqual({ foodAvailability: 'full' })
    // "hot" alone should NOT also trigger hasAC because it was consumed by "hot food"
    expect(r.filterPatch.hasAC).toBeUndefined()
  })

  it('matches "open now" → openNow=true', () => {
    const r = parseAsk('what is open now')
    expect(r.filterPatch).toEqual({ openNow: true })
  })

  it('matches "verified" → verified=verified', () => {
    const r = parseAsk('only verified places')
    expect(r.filterPatch).toEqual({ verified: 'verified' })
  })

  it('combines multiple filters from one query', () => {
    const r = parseAsk('quiet spot with fast wifi and ac, open now')
    expect(r.filterPatch).toEqual({
      noiseLevel: 'quiet',
      wifiSpeed: 'fast',
      hasAC: 'yes',
      openNow: true,
    })
    expect(r.matches).toHaveLength(4)
  })

  it('later match wins for same filter (reading-flow override)', () => {
    const r = parseAsk('somewhere quiet but actually lively')
    expect(r.filterPatch).toEqual({ noiseLevel: 'loud' })
  })

  it('emits chips in query order, not dictionary order', () => {
    const r = parseAsk('hot today and need a zoom call')
    expect(r.matches.map((m) => m.label)).toEqual(['Air Conditioning', 'Fast WiFi'])
  })

  it('word boundary: "focus" matches, "focusable" does not', () => {
    const r = parseAsk('focusable elements')
    expect(r.filterPatch).toEqual({})
  })

  it('word boundary: "ac" matches as standalone word', () => {
    const r = parseAsk('ac please')
    expect(r.filterPatch).toEqual({ hasAC: 'yes' })
  })

  it('word boundary: "ac" inside "acoustic" does not match', () => {
    const r = parseAsk('acoustic tiles')
    expect(r.filterPatch).toEqual({})
  })

  it('case insensitive', () => {
    const r = parseAsk('QUIET please')
    expect(r.filterPatch).toEqual({ noiseLevel: 'quiet' })
  })

  it('longest match wins for overlapping phrases', () => {
    // "air conditioning" should beat "ac" if both were to match same span
    const r = parseAsk('air conditioning required')
    expect(r.filterPatch).toEqual({ hasAC: 'yes' })
    expect(r.matches).toHaveLength(1)
    expect(r.matches[0].phrase).toBe('air conditioning')
  })

  it('punctuation does not break matching', () => {
    const r = parseAsk('quiet, with fast wifi!')
    expect(r.filterPatch).toEqual({ noiseLevel: 'quiet', wifiSpeed: 'fast' })
  })

  it('chips include phrase for debuggability', () => {
    const r = parseAsk('need fast wifi')
    expect(r.matches[0].phrase).toBe('fast wifi')
    expect(r.matches[0].filter).toBe('wifiSpeed')
    expect(r.matches[0].value).toBe('fast')
  })

  it('matches "I fancy a snack" → foodAvailability=light', () => {
    const r = parseAsk('I fancy a snack')
    expect(r.filterPatch).toEqual({ foodAvailability: 'light' })
  })

  it('matches "I\'m hungry" → foodAvailability=full', () => {
    const r = parseAsk("I'm hungry")
    expect(r.filterPatch).toEqual({ foodAvailability: 'full' })
  })

  it('matches "I want an energetic vibe" → noiseLevel=loud', () => {
    const r = parseAsk('I want an energetic vibe')
    expect(r.filterPatch).toEqual({ noiseLevel: 'loud' })
  })

  it('matches "my laptop is low on power" → hasOutlets=many', () => {
    const r = parseAsk('my laptop is low on power')
    expect(r.filterPatch).toEqual({ hasOutlets: 'many' })
  })

  it('matches "I need to charge my phone" → hasOutlets=many', () => {
    const r = parseAsk('I need to charge my phone')
    expect(r.filterPatch).toEqual({ hasOutlets: 'many' })
  })

  it('matches "it must be quiet" → noiseLevel=quiet', () => {
    const r = parseAsk('it must be quiet')
    expect(r.filterPatch).toEqual({ noiseLevel: 'quiet' })
  })

  it('matches "I have a headache" → noiseLevel=quiet', () => {
    const r = parseAsk('I have a headache')
    expect(r.filterPatch).toEqual({ noiseLevel: 'quiet' })
  })

  it('matches "migraine" → noiseLevel=quiet', () => {
    const r = parseAsk('migraine today, somewhere chill?')
    expect(r.filterPatch.noiseLevel).toBe('quiet')
  })

  it('matches "stuffy" → hasAC=yes', () => {
    const r = parseAsk('feels stuffy in here')
    expect(r.filterPatch).toEqual({ hasAC: 'yes' })
  })

  it('matches "low battery" → hasOutlets=many', () => {
    const r = parseAsk('low battery, help')
    expect(r.filterPatch).toEqual({ hasOutlets: 'many' })
  })

  it('matches "starving" → foodAvailability=full', () => {
    const r = parseAsk('absolutely starving')
    expect(r.filterPatch).toEqual({ foodAvailability: 'full' })
  })

  it('matches "good vibes" → noiseLevel=loud', () => {
    const r = parseAsk('want somewhere with good vibes')
    expect(r.filterPatch).toEqual({ noiseLevel: 'loud' })
  })

  it('matches "teams call" → wifiSpeed=fast', () => {
    const r = parseAsk('have a teams call in 10')
    expect(r.filterPatch).toEqual({ wifiSpeed: 'fast' })
  })

  it('"fan" inside "fancy" does not match (word boundary, fancy a snack wins)', () => {
    const r = parseAsk('I fancy a snack')
    // Should match "fancy a snack" (Snacks), not pick up some stray substring
    expect(r.matches.map((m) => m.label)).toEqual(['Snacks'])
  })

  it('truncates pathologically long input to 1000 chars', () => {
    const padding = 'x '.repeat(600) // ~1200 chars, beyond the cap
    const beyondCap = parseAsk(`${padding}fast wifi`)
    expect(beyondCap.matches).toHaveLength(0)
    const beforeCap = parseAsk(`fast wifi ${padding}`)
    expect(beforeCap.filterPatch).toEqual({ wifiSpeed: 'fast' })
  })
})
