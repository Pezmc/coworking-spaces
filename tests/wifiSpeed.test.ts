import { describe, it, expect } from 'vitest'
import {
  deriveWifiSpeed,
  resolveWifiSpeed,
  formatWifiSpeed,
  validateWifiSpeedMbps,
} from '../src/utils/wifiSpeed'

describe('deriveWifiSpeed — bucket from a measurement', () => {
  it('>100 down → fast', () => {
    expect(deriveWifiSpeed({ down: 400, up: 120 })).toBe('fast')
    expect(deriveWifiSpeed({ down: 101, up: 10 })).toBe('fast')
  })
  it('25–100 down → medium (boundaries: 25 medium, 100 medium)', () => {
    expect(deriveWifiSpeed({ down: 100, up: 50 })).toBe('medium')
    expect(deriveWifiSpeed({ down: 25, up: 5 })).toBe('medium')
    expect(deriveWifiSpeed({ down: 50, up: 20 })).toBe('medium')
  })
  it('<25 down → slow', () => {
    expect(deriveWifiSpeed({ down: 24.9, up: 5 })).toBe('slow')
    expect(deriveWifiSpeed({ down: 3, up: 2 })).toBe('slow')
  })
  it('null / non-positive / non-finite down → null (unknown)', () => {
    expect(deriveWifiSpeed(null)).toBeNull()
    expect(deriveWifiSpeed({ down: 0, up: 5 })).toBeNull()
    expect(deriveWifiSpeed({ down: -1, up: 5 })).toBeNull()
    expect(deriveWifiSpeed({ down: NaN, up: 5 })).toBeNull()
  })
})

describe('resolveWifiSpeed — measurement wins, else stored bucket', () => {
  it('uses the derived bucket when measured (ignores stored)', () => {
    expect(resolveWifiSpeed(null, { down: 400, up: 120 })).toBe('fast')
    expect(resolveWifiSpeed('slow', { down: 400, up: 120 })).toBe('fast')
  })
  it('falls back to the stored bucket when unmeasured', () => {
    expect(resolveWifiSpeed('medium', null)).toBe('medium')
    expect(resolveWifiSpeed(null, null)).toBeNull()
  })
})

describe('formatWifiSpeed — human display string', () => {
  it('down / up, no latency', () => {
    expect(formatWifiSpeed({ down: 400, up: 120 })).toBe('400 ↓ / 120 ↑ Mbps')
  })
  it('appends latency when known', () => {
    expect(formatWifiSpeed({ down: 400, up: 120, latencyMs: 12 })).toBe(
      '400 ↓ / 120 ↑ Mbps · 12 ms',
    )
  })
  it('empty string when unmeasured', () => {
    expect(formatWifiSpeed(null)).toBe('')
  })
})

describe('validateWifiSpeedMbps — data gate', () => {
  it('accepts null (unmeasured) and a valid measurement', () => {
    expect(validateWifiSpeedMbps(null)).toEqual([])
    expect(validateWifiSpeedMbps({ down: 400, up: 120 })).toEqual([])
    expect(validateWifiSpeedMbps({ down: 50, up: 10, latencyMs: 20 })).toEqual([])
  })
  it('rejects non-objects and arrays', () => {
    expect(validateWifiSpeedMbps(42).length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps('fast').length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps([]).length).toBeGreaterThan(0)
  })
  it('rejects non-positive, non-finite, or out-of-range down/up', () => {
    expect(validateWifiSpeedMbps({ down: 0, up: 10 }).length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps({ down: 50, up: -1 }).length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps({ down: 50 }).length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps({ down: 99999, up: 10 }).length).toBeGreaterThan(0)
  })
  it('rejects a bad latencyMs but allows omitting it', () => {
    expect(validateWifiSpeedMbps({ down: 50, up: 10, latencyMs: -5 }).length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps({ down: 50, up: 10 })).toEqual([])
  })
  it('rejects unexpected keys', () => {
    expect(validateWifiSpeedMbps({ down: 50, up: 10, jitter: 3 }).length).toBeGreaterThan(0)
  })
})
