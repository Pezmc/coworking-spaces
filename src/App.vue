<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import type { ICoworkingSpace, IFilterState, ISortState } from './types/space'
import { NEW_SPACE_URL } from './utils/issueUrl'
import FilterBar from './components/FilterBar.vue'
import SpaceList from './components/SpaceList.vue'
import MapView from './components/MapView.vue'
import VisitProgress from './components/VisitProgress.vue'
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
})

// Sync filters to URL
watch(
  filters,
  (newFilters) => {
    const filterKeys = Object.keys(DEFAULT_FILTERS) as (keyof IFilterState)[]
    for (const key of filterKeys) {
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
  return Object.values(filters.value).filter((v) => v !== 'all').length
})

const filteredSpaces = computed(() => {
  return spaces.filter((space) => {
    const activeFilters = filters.value

    return (
      (activeFilters.noiseLevel === 'all' || space.noiseLevel === activeFilters.noiseLevel) &&
      (activeFilters.wifiSpeed === 'all' || space.wifiSpeed === activeFilters.wifiSpeed) &&
      (activeFilters.hasAC === 'all' || space.hasAC === activeFilters.hasAC) &&
      (activeFilters.foodAvailability === 'all' || space.foodAndDrinkAvailability === activeFilters.foodAvailability) &&
      (activeFilters.seatingType === 'all' || space.seatingType === activeFilters.seatingType) &&
      (activeFilters.hasOutlets === 'all' || space.hasOutlets === activeFilters.hasOutlets) &&
      (activeFilters.verified === 'all' || (activeFilters.verified === 'verified' ? space.verified : !space.verified))
    )
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#fffaf0]">
    <!-- Header -->
    <header class="bg-[#1a365d] px-4 py-6 text-white sm:px-6 sm:py-8">
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
          <p class="m-0 text-sm text-[#cbd5e0] sm:text-lg">
            Find your perfect spot to work in Leuven
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-6xl px-6 py-8">
      <!-- Toolbar: Space count, Filter toggle, View mode -->
      <div class="mb-4 flex items-center justify-between">
        <p class="m-0 text-sm text-[#718096]">
          Showing {{ filteredSpaces.length }} of {{ spaces.length }} spaces
        </p>

        <div class="flex items-center gap-3">
          <!-- Filter Toggle -->
          <button
            class="flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors"
            :class="
              showFilters
                ? 'border-[#1a365d] bg-[#1a365d] text-white'
                : 'border-[#1a365d] bg-white text-[#1a365d] hover:bg-[#f5f0e6]'
            "
            @click="showFilters = !showFilters"
          >
            🎛️ Filters
            <span
              v-if="activeFilterCount > 0"
              class="rounded-full px-1.5 py-0.5 text-xs font-bold"
              :class="showFilters ? 'bg-[#ed8936] text-white' : 'bg-[#ed8936] text-white'"
            >
              {{ activeFilterCount }}
            </span>
          </button>

          <!-- View Mode Toggle -->
          <div class="inline-flex overflow-hidden rounded-lg border-2 border-[#1a365d]">
            <button
              class="px-4 py-2 text-sm font-medium transition-colors"
              :class="
                viewMode === 'list'
                  ? 'bg-[#1a365d] text-white'
                  : 'bg-white text-[#1a365d] hover:bg-[#f5f0e6]'
              "
              @click="viewMode = 'list'"
            >
              📋 List
            </button>
            <button
              class="border-l-2 border-[#1a365d] px-4 py-2 text-sm font-medium transition-colors"
              :class="
                viewMode === 'map'
                  ? 'bg-[#1a365d] text-white'
                  : 'bg-white text-[#1a365d] hover:bg-[#f5f0e6]'
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
    <footer class="mt-12 border-t-2 border-[#e2d9c8] bg-[#f5f0e6] px-6 py-8 pb-24">
      <div class="mx-auto max-w-6xl space-y-6 text-center">
        <div class="flex flex-col justify-center gap-2 sm:flex-row">
          <div
            class="w-full rounded-lg bg-[#1a365d] p-6 text-white sm:w-auto sm:max-w-md sm:flex-1"
          >
            <p class="m-0 mb-3 text-lg font-medium">🏢 Know a great coworking spot?</p>
            <p class="m-0 mb-4 text-sm text-[#cbd5e0]">
              Help fellow remote workers find new places!
            </p>
            <div class="flex flex-wrap justify-center gap-3">
              <a
                :href="NEW_SPACE_URL"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded bg-[#ed8936] px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#dd7826]"
              >
                ✨ Suggest via GitHub
              </a>
              <a
                href="https://pezcuckow.com"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded bg-white px-4 py-2 text-sm font-semibold text-[#1a365d] no-underline transition-colors hover:bg-[#f5f0e6]"
              >
                ✉️ Email me
              </a>
            </div>
          </div>
          <div
            class="w-full rounded-lg border-2 border-[#ed8936] bg-white p-6 sm:w-auto sm:max-w-md sm:flex-1"
          >
            <p class="m-0 mb-2 text-lg font-medium text-[#1a365d]">
              👋 Looking for people to co-work with?
            </p>
            <p class="m-0 mb-4 text-sm text-[#718096]">
              <strong>Join</strong> the Leuven Social Groups co-working group!
            </p>
            <a
              href="https://labs.pez.io/leuven-social-groups/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block rounded bg-[#ed8936] px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#dd7826]"
            >
              Learn more →
            </a>
          </div>
        </div>
        <p class="m-0 text-sm text-[#718096]">
          Made with ☕ in Leuven by
          <a
            href="https://pezcuckow.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#718096] underline hover:text-[#ed8936]"
          >
            Pez
          </a>
          ·
          <a
            href="https://github.com/Pezmc/coworking-spaces"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#718096] underline hover:text-[#ed8936]"
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
