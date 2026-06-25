import type { IWifiSpeedMbps, WifiSpeed } from '../types/space'

// Thresholds match WIFI_SPEED_DESCRIPTIONS: slow <25, medium 25–100, fast >100 Mbps.
const MEDIUM_FLOOR_MBPS = 25
const FAST_THRESHOLD_MBPS = 100

// Sanity bounds for validation — a home/café line above 10 Gbps or a latency
// over 100s is almost certainly a data-entry error, not a real measurement.
const MAX_MBPS = 10_000
const MAX_LATENCY_MS = 100_000

/**
 * Derive the `wifiSpeed` bucket from a measurement, keyed on download speed
 * (the number that matters for laptop work). `null` (unmeasured) → "unknown".
 * down > 100 → "fast", 25–100 → "medium", < 25 → "slow". Non-finite or
 * non-positive `down` → "unknown" (defensive: never confidently mislabel garbage
 * as "slow" if a caller bypasses validateWifiSpeedMbps).
 */
export function deriveWifiSpeed(mbps: IWifiSpeedMbps | null): WifiSpeed {
  if (!mbps || !Number.isFinite(mbps.down) || mbps.down <= 0) return 'unknown'
  if (mbps.down > FAST_THRESHOLD_MBPS) return 'fast'
  if (mbps.down >= MEDIUM_FLOOR_MBPS) return 'medium'
  return 'slow'
}

/**
 * Human-readable measurement, e.g. "400 ↓ / 120 ↑ Mbps" (with " · 33 ms" when
 * latency is known). Returns '' when unmeasured (null) so callers can `v-if` it.
 */
export function formatWifiSpeed(mbps: IWifiSpeedMbps | null): string {
  if (!mbps) return ''
  const base = `${mbps.down} ↓ / ${mbps.up} ↑ Mbps`
  return mbps.latencyMs !== undefined ? `${base} · ${mbps.latencyMs} ms` : base
}

/**
 * The drift guard: a measurement and the `wifiSpeed` bucket are consistent when
 * there is no measurement, or the bucket equals what the measurement derives.
 */
export function wifiSpeedMatchesMeasurement(
  wifiSpeed: WifiSpeed,
  mbps: IWifiSpeedMbps | null,
): boolean {
  return !mbps || deriveWifiSpeed(mbps) === wifiSpeed
}

/**
 * Structural validation for a space's `wifiSpeedMbps` field. Returns
 * human-readable problems (empty array = valid). `null` is valid (unmeasured).
 * Does NOT check consistency with `wifiSpeed` — that needs both fields and lives
 * with the space-level validator (it calls wifiSpeedMatchesMeasurement).
 */
export function validateWifiSpeedMbps(value: unknown): string[] {
  if (value === null) return []
  if (typeof value !== 'object' || Array.isArray(value)) {
    return ['wifiSpeedMbps must be an object { down, up } or null']
  }
  const errors: string[] = []
  const v = value as Record<string, unknown>

  for (const key of ['down', 'up'] as const) {
    const n = v[key]
    if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0 || n > MAX_MBPS) {
      errors.push(`wifiSpeedMbps.${key} must be a positive number of Mbps (0–${MAX_MBPS})`)
    }
  }
  if (v.latencyMs !== undefined) {
    const l = v.latencyMs
    if (typeof l !== 'number' || !Number.isFinite(l) || l < 0 || l > MAX_LATENCY_MS) {
      errors.push('wifiSpeedMbps.latencyMs must be a non-negative number of milliseconds')
    }
  }
  for (const key of Object.keys(v)) {
    if (!['down', 'up', 'latencyMs'].includes(key)) {
      errors.push(`wifiSpeedMbps has unexpected key "${key}"`)
    }
  }

  return errors
}
