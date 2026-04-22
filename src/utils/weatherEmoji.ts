import type { Weather } from './weather'

export function weatherEmoji(w: Weather | null, loading = false): string {
  if (loading) return '⏳'
  if (!w) return '⏰'
  if (w.condition === 'snowy' || w.tempC < 5) return '❄️'
  if (w.condition === 'rainy') return '🌧️'
  if (w.condition === 'foggy') return '🌫️'
  if (w.condition === 'cloudy') return '⛅'
  if (w.condition === 'sunny' && w.tempC >= 15) return '☀️'
  return '⛅'
}
