import { ref, type Ref } from 'vue'

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'unknown'

export interface Weather {
  tempC: number
  condition: WeatherCondition
  weatherCode: number
  fetchedAt: number
}

const CACHE_KEY = 'weather-leuven-v1'
const TTL_MS = 30 * 60 * 1000
const LEUVEN = { lat: 50.8798, lng: 4.7005 }

function classifyWmo(code: number): WeatherCondition {
  if (code === 0 || code === 1) return 'sunny'
  if (code === 2 || code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'foggy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rainy'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowy'
  return 'unknown'
}

function readCache(): Weather | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Weather
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(w: Weather) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(w))
  } catch {
    // storage disabled; ignore
  }
}

async function fetchWeather(): Promise<Weather | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LEUVEN.lat}&longitude=${LEUVEN.lng}` +
      `&current=temperature_2m,weather_code&timezone=Europe/Brussels`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const t = data?.current?.temperature_2m
    const c = data?.current?.weather_code
    if (typeof t !== 'number' || typeof c !== 'number') return null
    return {
      tempC: Math.round(t),
      condition: classifyWmo(c),
      weatherCode: c,
      fetchedAt: Date.now(),
    }
  } catch {
    return null
  }
}

interface UseWeatherResult {
  weather: Ref<Weather | null>
  loading: Ref<boolean>
  failed: Ref<boolean>
}

let sharedState: UseWeatherResult | null = null

export function useWeather(): UseWeatherResult {
  if (sharedState) return sharedState

  const weather = ref<Weather | null>(null)
  const loading = ref(true)
  const failed = ref(false)

  const cached = readCache()
  if (cached) {
    weather.value = cached
    loading.value = false
  } else {
    fetchWeather().then((w) => {
      if (w) {
        weather.value = w
        writeCache(w)
      } else {
        failed.value = true
      }
      loading.value = false
    })
  }

  sharedState = { weather, loading, failed }
  return sharedState
}
