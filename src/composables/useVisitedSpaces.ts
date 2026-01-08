import { ref, computed, watch } from 'vue'
import { slugify } from '../utils/slug'

const STORAGE_KEY = 'coworking-visited-spaces'

// Load initial state from localStorage
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

// Reactive set of visited space slugs
const visitedSlugs = ref<Set<string>>(loadVisitedSpaces())

// Save to localStorage whenever it changes
watch(visitedSlugs, (newValue) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...newValue]))
  } catch (e) {
    console.warn('Failed to save visited spaces to localStorage', e)
  }
}, { deep: true })

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

  return {
    visitedCount,
    isVisited,
    toggleVisited,
    markVisited,
    markUnvisited,
  }
}

