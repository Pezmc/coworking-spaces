import { describe, it, expect } from 'vitest'
import {
  deriveWifiSpeed,
  formatWifiSpeed,
  validateWifiSpeedMbps,
  wifiSpeedMatchesMeasurement,
} from '../src/utils/wifiSpeed'

describe('deriveWifiSpeed', () => {
  it('maps download speed to the bucket (matching WIFI_SPEED_DESCRIPTIONS)', () => {
    expect(deriveWifiSpeed(null)).toBe('unknown')
    expect(deriveWifiSpeed({ down: 3, up: 2 })).toBe('slow') // < 25
    expect(deriveWifiSpeed({ down: 24, up: 5 })).toBe('slow')
    expect(deriveWifiSpeed({ down: 25, up: 5 })).toBe('medium') // 25 floor
    expect(deriveWifiSpeed({ down: 100, up: 20 })).toBe('medium') // 100 inclusive
    expect(deriveWifiSpeed({ down: 101, up: 20 })).toBe('fast') // > 100
    expect(deriveWifiSpeed({ down: 400, up: 120 })).toBe('fast')
  })
  it('treats non-finite or non-positive down as unknown (defensive against bad input)', () => {
    expect(deriveWifiSpeed({ down: NaN, up: 5 })).toBe('unknown')
    expect(deriveWifiSpeed({ down: 0, up: 5 })).toBe('unknown')
    expect(deriveWifiSpeed({ down: -10, up: 5 })).toBe('unknown')
  })
})

describe('formatWifiSpeed', () => {
  it('renders down/up Mbps, with latency when present', () => {
    expect(formatWifiSpeed({ down: 400, up: 120 })).toBe('400 ↓ / 120 ↑ Mbps')
    expect(formatWifiSpeed({ down: 200, up: 25, latencyMs: 33 })).toBe('200 ↓ / 25 ↑ Mbps · 33 ms')
  })
  it('returns empty string when unmeasured', () => {
    expect(formatWifiSpeed(null)).toBe('')
  })
})

describe('wifiSpeedMatchesMeasurement (drift guard)', () => {
  it('a null measurement always matches — the bucket may be a qualitative judgement', () => {
    expect(wifiSpeedMatchesMeasurement('medium', null)).toBe(true)
    expect(wifiSpeedMatchesMeasurement('unknown', null)).toBe(true)
  })
  it('treats undefined like null (no measurement → matches any bucket)', () => {
    expect(wifiSpeedMatchesMeasurement('medium', undefined as unknown as null)).toBe(true)
  })
  it('a measurement must equal the bucket it derives', () => {
    expect(wifiSpeedMatchesMeasurement('fast', { down: 400, up: 120 })).toBe(true)
    expect(wifiSpeedMatchesMeasurement('medium', { down: 400, up: 120 })).toBe(false)
  })
})

describe('validateWifiSpeedMbps', () => {
  it('accepts null (unmeasured)', () => {
    expect(validateWifiSpeedMbps(null)).toEqual([])
  })
  it('accepts a well-formed measurement (decimals + latency, up may exceed down)', () => {
    expect(validateWifiSpeedMbps({ down: 3.6, up: 13.6 })).toEqual([])
    expect(validateWifiSpeedMbps({ down: 200, up: 25, latencyMs: 33 })).toEqual([])
  })
  it('rejects a non-object', () => {
    expect(validateWifiSpeedMbps('400 down').length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps([]).length).toBeGreaterThan(0)
  })
  it('rejects non-positive or missing down/up', () => {
    expect(validateWifiSpeedMbps({ down: 0, up: 10 }).some((e) => e.includes('down'))).toBe(true)
    expect(validateWifiSpeedMbps({ down: 10 }).some((e) => e.includes('up'))).toBe(true)
    expect(validateWifiSpeedMbps({ down: -5, up: 10 }).some((e) => e.includes('down'))).toBe(true)
  })
  it('rejects a negative latency and unexpected keys', () => {
    expect(
      validateWifiSpeedMbps({ down: 50, up: 10, latencyMs: -1 }).some((e) => e.includes('latency')),
    ).toBe(true)
    expect(
      validateWifiSpeedMbps({ down: 50, up: 10, jitter: 5 }).some((e) => e.includes('jitter')),
    ).toBe(true)
  })
  it('rejects down/up above the sanity cap (data-entry error guard)', () => {
    expect(validateWifiSpeedMbps({ down: 10001, up: 10 }).some((e) => e.includes('down'))).toBe(
      true,
    )
    expect(validateWifiSpeedMbps({ down: 50, up: 99999 }).some((e) => e.includes('up'))).toBe(true)
  })
  it('rejects latency above the sanity cap', () => {
    expect(
      validateWifiSpeedMbps({ down: 50, up: 10, latencyMs: 100001 }).some((e) =>
        e.includes('latency'),
      ),
    ).toBe(true)
  })
  it('rejects NaN / Infinity (reachable from unknown LLM-pipeline input)', () => {
    expect(validateWifiSpeedMbps({ down: Infinity, up: 10 }).length).toBeGreaterThan(0)
    expect(validateWifiSpeedMbps({ down: NaN, up: 10 }).length).toBeGreaterThan(0)
  })
  it('rejects a non-number down/up (e.g. a stringified speed)', () => {
    expect(validateWifiSpeedMbps({ down: '400', up: 10 }).some((e) => e.includes('down'))).toBe(
      true,
    )
  })
})
