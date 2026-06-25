<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUrlSearchParams } from '@vueuse/core'
import type { ICoworkingSpace, IFilterState, ISortState } from './types/space'
import FilterBar from './components/FilterBar.vue'
import SpaceList from './components/SpaceList.vue'
import MapView from './components/MapView.vue'
import VisitProgress from './components/VisitProgress.vue'
import OpenNowChip from './components/OpenNowChip.vue'
import OpenAtChip from './components/OpenAtChip.vue'
import TodayView from './components/TodayView.vue'
import AskBar from './components/AskBar.vue'
import IconDefs from './components/IconDefs.vue'
import ViewSegmented from './components/ViewSegmented.vue'
import CoworkingGroupCallout from './components/CoworkingGroupCallout.vue'
import SiteFooter from './components/SiteFooter.vue'
import { matchesFilters, countActiveFilters, parseOpenAt, serializeOpenAt } from './utils/filters'
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
  openAt: null,
}

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
  openAt: parseOpenAt(urlParams.openAt),
})

// Decision 5: openNow and openAt are mutually exclusive. A stale or hand-crafted
// URL could carry both — openAt is the more specific intent, so it wins on load.
if (filters.value.openNow && filters.value.openAt !== null) {
  filters.value.openNow = false
}

watch(
  filters,
  (newFilters) => {
    if (newFilters.openNow) {
      urlParams.openNow = '1'
    } else {
      delete urlParams.openNow
    }
    // openAt is number|null, not an 'all'-sentinel string — serialize it
    // explicitly (like openNow) and keep it out of the generic select loop below.
    const openAtParam = serializeOpenAt(newFilters.openAt)
    if (openAtParam !== null) {
      urlParams.openAt = openAtParam
    } else {
      delete urlParams.openAt
    }
    const selectKeys = Object.keys(DEFAULT_FILTERS).filter(
      (k) => k !== 'openNow' && k !== 'openAt',
    ) as Exclude<keyof IFilterState, 'openNow' | 'openAt'>[]
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

const activeFilterCount = computed(() => countActiveFilters(filters.value))

const filteredSpaces = computed(() => {
  const now = new Date()
  return spaces.filter((space) => matchesFilters(space, filters.value, now))
})

function toggleOpenNow() {
  const openNow = !filters.value.openNow
  // Decision 5: turning on "Open now" clears any chosen openAt time.
  filters.value = { ...filters.value, openNow, openAt: openNow ? null : filters.value.openAt }
}

function setOpenAt(minutes: number | null) {
  // Decision 5: choosing a time clears "Open now"; "Any time" (null) just clears openAt.
  filters.value = {
    ...filters.value,
    openAt: minutes,
    openNow: minutes !== null ? false : filters.value.openNow,
  }
}

function applyAskPatch(patch: Partial<IFilterState>) {
  const next = { ...filters.value, ...patch }
  // Decision 5: a phrase can set only one of now/at — the one in this patch wins.
  if (patch.openAt !== undefined && patch.openAt !== null) next.openNow = false
  else if (patch.openNow) next.openAt = null
  filters.value = next
}
</script>

<template>
  <IconDefs />
  <div class="bg-paper min-h-screen">
    <main class="mx-auto max-w-6xl px-5 pt-8 pb-8 sm:px-6 sm:pt-12">
      <!-- Masthead -->
      <header
        class="border-rule mb-8 flex flex-col items-baseline justify-between gap-3 border-b pb-5 sm:flex-row sm:gap-8 sm:pb-7"
      >
        <h1
          class="font-display text-navy m-0 text-3xl leading-[1.05] font-bold tracking-tight sm:text-4xl md:text-5xl"
        >
          Coworking Cafes
        </h1>
        <p
          class="font-desc text-muted m-0 max-w-xl text-sm leading-snug sm:text-right sm:text-base"
        >
          A small Leuven field guide to cafés where it's nice to open a laptop.
        </p>
      </header>

      <!-- Today's picks: standalone subordinate section, visible in both list and map views -->
      <TodayView :spaces="spaces" />

      <!-- All spots: the main section with prominent List/Map toggle -->
      <div
        class="border-rule mt-10 flex flex-col-reverse items-stretch justify-between gap-3 border-t pt-6 sm:flex-row sm:items-baseline sm:gap-6 sm:pt-7"
      >
        <h2 class="font-display text-navy m-0 text-xl font-semibold tracking-tight sm:text-2xl">
          All spots
          <span class="text-muted ml-2 font-mono text-xs font-normal">
            {{ filteredSpaces.length
            }}<span v-if="filteredSpaces.length !== spaces.length" class="text-faint">
              of {{ spaces.length }}</span
            >
          </span>
        </h2>
        <ViewSegmented v-model="viewMode" />
      </div>

      <!-- Toolbar: When? cluster (open now / open at) + filters disclosure -->
      <div class="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <div role="group" aria-label="When" class="flex flex-wrap items-center gap-2 sm:gap-3">
          <OpenNowChip :active="filters.openNow" @toggle="toggleOpenNow" />
          <OpenAtChip :minutes="filters.openAt" @select="setOpenAt" />
        </div>
        <button
          type="button"
          class="text-ink hover:text-rust focus-visible:ring-rust inline-flex cursor-pointer items-center gap-1.5 border-0 border-b-2 border-transparent bg-transparent px-1 pb-0.5 font-sans text-xs font-medium tracking-[0.04em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          :class="showFilters ? '!border-rust' : ''"
          :aria-expanded="showFilters"
          @click="showFilters = !showFilters"
        >
          More filters
          <span
            v-if="activeFilterCount > 0"
            class="bg-rust text-paper inline-flex h-4 min-w-4 items-center justify-center px-1 text-[10px] font-bold"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <!-- AskBar (smart filter) -->
      <AskBar @apply="applyAskPatch" />

      <!-- Collapsible filter dropdowns -->
      <FilterBar
        v-show="showFilters"
        :filters="filters"
        :sort="sort"
        @update:filters="filters = $event"
        @update:sort="sort = $event"
      />

      <!-- List or Map -->
      <SpaceList v-if="viewMode === 'list'" :spaces="spaces" :filters="filters" :sort="sort" />
      <MapView v-else :spaces="filteredSpaces" :all-spaces="spaces" />

      <!-- Marketing callout: Leuven coworking group -->
      <CoworkingGroupCallout />

      <!-- Footer -->
      <SiteFooter :total-spaces="spaces.length" />
    </main>

    <!-- Visit progress (sticky bottom bar; appears once any space is marked visited) -->
    <VisitProgress :total-spaces="spaces.length" />
  </div>
</template>
