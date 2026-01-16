import { ref, computed, watch } from 'vue'
import { slugify } from '../utils/slug'

const STORAGE_KEY = 'coworking-visited-spaces'
const URL_PARAM_KEY = 'v'

// Simple obfuscation: base64 with URL-safe chars and a version prefix
function encodeProgress(slugs: string[]): string {
  if (slugs.length === 0) return ''
  const data = JSON.stringify(slugs)
  const base64 = btoa(data)
  // Make URL-safe and add version prefix for future compatibility
  return '1' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeProgress(encoded: string): string[] {
  if (!encoded || encoded.length < 2) return []
  try {
    const version = encoded[0]
    if (version !== '1') return [] // Unknown version, ignore

    let base64 = encoded.slice(1).replace(/-/g, '+').replace(/_/g, '/')
    // Add back padding if needed
    while (base64.length % 4) base64 += '='
    const data = atob(base64)
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

function loadVisitedSpaces(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch (e) {
    console.warn('Failed to load visited spaces from localStorage', e)
  }
  return new Set()
}

function loadAndMergeFromUrl(): Set<string> {
  const localSpaces = loadVisitedSpaces()

  try {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get(URL_PARAM_KEY)
    if (encoded) {
      const urlSpaces = decodeProgress(encoded)
      urlSpaces.forEach((slug) => localSpaces.add(slug))

      // Clean up URL without triggering navigation
      params.delete(URL_PARAM_KEY)
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  } catch (e) {
    console.warn('Failed to load progress from URL', e)
  }

  return localSpaces
}

const visitedSlugs = ref<Set<string>>(loadAndMergeFromUrl())

watch(
  visitedSlugs,
  (newValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...newValue]))
    } catch (e) {
      console.warn('Failed to save visited spaces to localStorage', e)
    }
  },
  { deep: true },
)

export function useVisitedSpaces() {
  const visitedCount = computed(() => visitedSlugs.value.size)

  function isVisited(spaceName: string): boolean {
    return visitedSlugs.value.has(slugify(spaceName))
  }

  function toggleVisited(spaceName: string): boolean {
    const slug = slugify(spaceName)
    const newSet = new Set(visitedSlugs.value)

    if (newSet.has(slug)) {
      newSet.delete(slug)
      visitedSlugs.value = newSet
      return false
    } else {
      newSet.add(slug)
      visitedSlugs.value = newSet
      return true
    }
  }

  function markVisited(spaceName: string): void {
    const slug = slugify(spaceName)
    if (!visitedSlugs.value.has(slug)) {
      const newSet = new Set(visitedSlugs.value)
      newSet.add(slug)
      visitedSlugs.value = newSet
    }
  }

  function markUnvisited(spaceName: string): void {
    const slug = slugify(spaceName)
    if (visitedSlugs.value.has(slug)) {
      const newSet = new Set(visitedSlugs.value)
      newSet.delete(slug)
      visitedSlugs.value = newSet
    }
  }

  function getShareableUrl(): string {
    const slugs = [...visitedSlugs.value]
    if (slugs.length === 0) return window.location.origin + window.location.pathname

    const encoded = encodeProgress(slugs)
    const url = new URL(window.location.href)
    url.searchParams.set(URL_PARAM_KEY, encoded)
    return url.toString()
  }

  function getVisitedSlugs(): string[] {
    return [...visitedSlugs.value]
  }

  return {
    visitedCount,
    isVisited,
    toggleVisited,
    markVisited,
    markUnvisited,
    getShareableUrl,
    getVisitedSlugs,
  }
}
