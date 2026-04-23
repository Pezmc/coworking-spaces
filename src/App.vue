<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import type { ICoworkingSpace, IFilterState, ISortState } from './types/space'
import { NEW_SPACE_URL } from './utils/issueUrl'
import FilterBar from './components/FilterBar.vue'
import SpaceList from './components/SpaceList.vue'
import MapView from './components/MapView.vue'
import VisitProgress from './components/VisitProgress.vue'
import OpenNowChip from './components/OpenNowChip.vue'
import TodayView from './components/TodayView.vue'
import AskBar from './components/AskBar.vue'
import { parseOpeningHours, isOpen } from './utils/hoursBasic'
import spacesData from './data/spaces.json'

const spaces = spacesData as ICoworkingSpace[]

const DEFAULT_FILTERS: IFilterState = {
  noiseLevel: 'all',
  wifiSpeed: 'all',
  hasAC: 'all',
  foodAvailability: 'all',
  seatingType: 'all',
  hasOutlets: 'all',
  verified: 'all',
  openNow: false,
}

// URL params and filter states
const urlParams = useUrlSearchParams<Record<string, string>>('history')
const filters = ref<IFilterState>({
  noiseLevel: (urlParams.noiseLevel as IFilterState['noiseLevel']) || DEFAULT_FILTERS.noiseLevel,
  wifiSpeed: (urlParams.wifiSpeed as IFilterState['wifiSpeed']) || DEFAULT_FILTERS.wifiSpeed,
  hasAC: (urlParams.hasAC as IFilterState['hasAC']) || DEFAULT_FILTERS.hasAC,
  foodAvailability:
    (urlParams.foodAvailability as IFilterState['foodAvailability']) ||
    DEFAULT_FILTERS.foodAvailability,
  seatingType:
    (urlParams.seatingType as IFilterState['seatingType']) || DEFAULT_FILTERS.seatingType,
  hasOutlets: (urlParams.hasOutlets as IFilterState['hasOutlets']) || DEFAULT_FILTERS.hasOutlets,
  verified: (urlParams.verified as IFilterState['verified']) || DEFAULT_FILTERS.verified,
  openNow: urlParams.openNow === '1',
})

// Sync filters to URL
watch(
  filters,
  (newFilters) => {
    if (newFilters.openNow) {
      urlParams.openNow = '1'
    } else {
      delete urlParams.openNow
    }
    const selectKeys = Object.keys(DEFAULT_FILTERS).filter((k) => k !== 'openNow') as Exclude<
      keyof IFilterState,
      'openNow'
    >[]
    for (const key of selectKeys) {
      if (newFilters[key] !== 'all') {
        urlParams[key] = newFilters[key]
      } else {
        delete urlParams[key]
      }
    }
  },
  { deep: true },
)

const sort = ref<ISortState>({
  field: 'name',
  direction: 'asc',
})

type ViewMode = 'list' | 'map'
const viewMode = ref<ViewMode>('list')

const showFilters = ref(false)

const activeFilterCount = computed(() => {
  const { openNow: _ignored, ...rest } = filters.value
  return Object.values(rest).filter((v) => v !== 'all').length
})

const filteredSpaces = computed(() => {
  const now = new Date()
  return spaces.filter((space) => {
    const activeFilters = filters.value

    if (activeFilters.openNow) {
      if (isOpen(parseOpeningHours(space.openingHours), now) !== true) return false
    }

    return (
      (activeFilters.noiseLevel === 'all' || space.noiseLevel === activeFilters.noiseLevel) &&
      (activeFilters.wifiSpeed === 'all' || space.wifiSpeed === activeFilters.wifiSpeed) &&
      (activeFilters.hasAC === 'all' || space.hasAC === activeFilters.hasAC) &&
      (activeFilters.foodAvailability === 'all' ||
        space.foodAndDrinkAvailability === activeFilters.foodAvailability) &&
      (activeFilters.seatingType === 'all' || space.seatingType === activeFilters.seatingType) &&
      (activeFilters.hasOutlets === 'all' || space.hasOutlets === activeFilters.hasOutlets) &&
      (activeFilters.verified === 'all' ||
        (activeFilters.verified === 'verified' ? space.verified : !space.verified))
    )
  })
})

function toggleOpenNow() {
  filters.value = { ...filters.value, openNow: !filters.value.openNow }
}

function applyAskPatch(patch: Partial<IFilterState>) {
  filters.value = { ...filters.value, ...patch }
}
</script>

<template>
  <div class="bg-cream min-h-screen">
    <!-- Header -->
    <header class="bg-primary px-4 py-6 text-white sm:px-6 sm:py-8">
      <div class="mx-auto flex max-w-6xl items-center gap-4 sm:gap-6">
        <img
          src="/favicon.svg"
          alt="Leuven Coworking Cafes logo"
          class="h-12 w-12 flex-shrink-0 rounded-full bg-white p-1.5 sm:h-16 sm:w-16 md:h-20 md:w-20"
        />
        <div>
          <h1 class="font-display m-0 mb-1 text-2xl font-bold sm:mb-2 sm:text-4xl md:text-5xl">
            Leuven Coworking Cafes
          </h1>
          <p class="text-cool m-0 text-sm sm:text-lg">Find your perfect spot to work in Leuven</p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-6xl px-6 py-8">
      <!-- Today's picks (list view only) -->
      <TodayView v-if="viewMode === 'list'" :spaces="spaces" />

      <!-- Smart search: natural-language filter -->
      <AskBar @apply="applyAskPatch" />

      <!-- Toolbar: Space count, Filter toggle, View mode -->
      <div class="mb-4 flex flex-wrap items-center justify-between gap-y-3">
        <p class="text-muted m-0 text-sm">
          Showing {{ filteredSpaces.length }} of {{ spaces.length }} spaces
        </p>

        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- Open now chip -->
          <OpenNowChip :active="filters.openNow" @toggle="toggleOpenNow" />

          <!-- Filter Toggle -->
          <button
            class="focus-visible:ring-accent flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            :class="
              showFilters
                ? 'border-primary bg-primary text-white'
                : 'border-primary text-primary hover:bg-cream-panel bg-white'
            "
            @click="showFilters = !showFilters"
          >
            🎛️ Filters
            <span
              v-if="activeFilterCount > 0"
              class="rounded-full px-1.5 py-0.5 text-xs font-bold"
              :class="showFilters ? 'bg-accent text-white' : 'bg-accent text-white'"
            >
              {{ activeFilterCount }}
            </span>
          </button>

          <!-- View Mode Toggle -->
          <div class="border-primary inline-flex overflow-hidden rounded-lg border-2">
            <button
              class="focus-visible:ring-accent px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none"
              :class="
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-primary hover:bg-cream-panel bg-white'
              "
              @click="viewMode = 'list'"
            >
              📋 List
            </button>
            <button
              class="border-primary focus-visible:ring-accent border-l-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none"
              :class="
                viewMode === 'map'
                  ? 'bg-primary text-white'
                  : 'text-primary hover:bg-cream-panel bg-white'
              "
              @click="viewMode = 'map'"
            >
              🗺️ Map
            </button>
          </div>
        </div>
      </div>

      <!-- Collapsible Filters -->
      <FilterBar
        v-show="showFilters"
        :filters="filters"
        :sort="sort"
        @update:filters="filters = $event"
        @update:sort="sort = $event"
      />

      <!-- List View -->
      <SpaceList v-if="viewMode === 'list'" :spaces="spaces" :filters="filters" :sort="sort" />

      <!-- Map View -->
      <MapView v-else :spaces="filteredSpaces" :all-spaces="spaces" />
    </main>

    <!-- Footer -->
    <footer class="border-warm bg-cream-panel mt-12 border-t-2 px-6 py-8 pb-24">
      <div class="mx-auto max-w-6xl space-y-6 text-center">
        <div class="flex flex-col justify-center gap-2 sm:flex-row">
          <div class="bg-primary w-full rounded-lg p-6 text-white sm:w-auto sm:max-w-md sm:flex-1">
            <p class="m-0 mb-3 text-lg font-medium">🏢 Know a great coworking spot?</p>
            <p class="text-cool m-0 mb-4 text-sm">Help fellow remote workers find new places!</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a
                :href="NEW_SPACE_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="bg-accent hover:bg-accent-hover focus-visible:ring-accent rounded px-4 py-2 text-sm font-semibold text-white no-underline transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
              >
                ✨ Suggest via GitHub
              </a>
              <a
                href="https://pezcuckow.com"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary hover:bg-cream-panel focus-visible:ring-accent rounded bg-white px-4 py-2 text-sm font-semibold no-underline transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
              >
                ✉️ Email me
              </a>
            </div>
          </div>
          <div
            class="border-accent w-full rounded-lg border-2 bg-white p-6 sm:w-auto sm:max-w-md sm:flex-1"
          >
            <p class="text-primary m-0 mb-2 text-lg font-medium">
              👋 Looking for people to co-work with?
            </p>
            <p class="text-muted m-0 mb-4 text-sm">
              <strong>Join</strong> the Leuven Social Groups co-working group!
            </p>
            <a
              href="https://labs.pez.io/leuven-social-groups/"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-accent hover:bg-accent-hover focus-visible:ring-accent inline-block rounded px-4 py-2 text-sm font-semibold text-white no-underline transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              Learn more →
            </a>
          </div>
        </div>
        <p class="text-muted m-0 text-sm">
          Made with ☕ in Leuven by
          <a
            href="https://pezcuckow.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted hover:text-accent focus-visible:ring-accent rounded underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Pez
          </a>
          ·
          <a
            href="https://github.com/Pezmc/coworking-spaces"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted hover:text-accent focus-visible:ring-accent rounded underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Open Source
          </a>
        </p>
      </div>
    </footer>

    <!-- Visit Progress Bar -->
    <VisitProgress :total-spaces="spaces.length" />
  </div>
</template>
