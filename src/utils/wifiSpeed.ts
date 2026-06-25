import type { IWifiSpeedMbps, WifiSpeed } from '../types/space'

const MEDIUM_FLOOR_MBPS = 25
const FAST_THRESHOLD_MBPS = 100
const MAX_MBPS = 10_000
const MAX_LATENCY_MS = 100_000

// down >100 → fast, 25–100 → medium, <25 → slow; null/garbage → unknown.
export function deriveWifiSpeed(mbps: IWifiSpeedMbps | null): WifiSpeed {
  if (!mbps || !Number.isFinite(mbps.down) || mbps.down <= 0) return 'unknown'
  if (mbps.down > FAST_THRESHOLD_MBPS) return 'fast'
  if (mbps.down >= MEDIUM_FLOOR_MBPS) return 'medium'
  return 'slow'
}

// The effective bucket: derived from a measurement when present, else the stored judgement.
export function resolveWifiSpeed(
  wifiSpeed: WifiSpeed | null,
  mbps: IWifiSpeedMbps | null,
): WifiSpeed {
  return mbps ? deriveWifiSpeed(mbps) : (wifiSpeed ?? 'unknown')
}

// "400 ↓ / 120 ↑ Mbps" (· 33 ms when known); '' when unmeasured.
export function formatWifiSpeed(mbps: IWifiSpeedMbps | null): string {
  if (!mbps) return ''
  const base = `${mbps.down} ↓ / ${mbps.up} ↑ Mbps`
  return mbps.latencyMs !== undefined ? `${base} · ${mbps.latencyMs} ms` : base
}

// Problems with a wifiSpeedMbps value ([] = valid). null = unmeasured.
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
