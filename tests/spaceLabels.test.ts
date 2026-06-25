// Guards the original bug: a null (unknown / not-yet-researched) standardized
// field used to index its label map as `undefined` and render an EMPTY pill
// (noiseLevel/seatingType had no 'unknown' member). The display helpers must
// return a non-empty "Unknown" label and a real description for null, and the
// concrete value's mapped string otherwise.
import { describe, it, expect } from 'vitest'
import {
  noiseLevelLabel,
  wifiSpeedLabel,
  seatingTypeLabel,
  outletAvailabilityLabel,
  noiseLevelDescription,
  wifiSpeedDescription,
  seatingTypeDescription,
  outletAvailabilityDescription,
} from '../src/types/space'

describe('enum display helpers', () => {
  it('null renders as the "Unknown" label, never empty/undefined', () => {
    expect(noiseLevelLabel(null)).toBe('Unknown')
    expect(wifiSpeedLabel(null)).toBe('Unknown')
    expect(seatingTypeLabel(null)).toBe('Unknown')
    expect(outletAvailabilityLabel(null)).toBe('Unknown')
  })

  it('a concrete value maps to its label', () => {
    expect(noiseLevelLabel('quiet')).toBe('Quiet')
    expect(wifiSpeedLabel('fast')).toBe('Fast')
    expect(seatingTypeLabel('mixed')).toBe('Mixed Seating')
    expect(outletAvailabilityLabel('few')).toBe('Few Outlets')
  })

  it('null descriptions are a non-empty "not yet" string, never undefined', () => {
    for (const d of [
      noiseLevelDescription(null),
      wifiSpeedDescription(null),
      seatingTypeDescription(null),
      outletAvailabilityDescription(null),
    ]) {
      expect(typeof d).toBe('string')
      expect(d.length).toBeGreaterThan(0)
    }
  })

  it('a concrete value maps to its description', () => {
    expect(noiseLevelDescription('quiet')).toContain('Library')
    expect(wifiSpeedDescription('fast')).toContain('100')
  })
})
