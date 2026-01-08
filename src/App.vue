<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ICoworkingSpace, IFilterState, ISortState } from './types/space'
import FilterBar from './components/FilterBar.vue'
import SpaceList from './components/SpaceList.vue'
import MapView from './components/MapView.vue'
import spacesData from './data/spaces.json'

// TODO: Update data to match new ICoworkingSpace shape
const spaces = spacesData as unknown as ICoworkingSpace[]

const filters = ref<IFilterState>({
  noiseLevel: 'all',
  wifiSpeed: 'all',
  hasAC: 'all',
  foodAvailability: 'all',
  seatingType: 'all',
  hasOutlets: 'all',
  verified: 'all',
})

const sort = ref<ISortState>({
  field: 'name',
  direction: 'asc',
})

type ViewMode = 'list' | 'map'
const viewMode = ref<ViewMode>('list')

// Filter spaces based on current filters
const filteredSpaces = computed(() => {
  return spaces.filter((space) => {
    if (filters.value.noiseLevel !== 'all' && space.noiseLevel !== filters.value.noiseLevel) return false
    if (filters.value.wifiSpeed !== 'all' && space.wifiSpeed !== filters.value.wifiSpeed) return false
    if (filters.value.hasAC !== 'all' && space.hasAC !== filters.value.hasAC) return false
    if (filters.value.foodAvailability !== 'all' && space.foodAndDrinkAvailability !== filters.value.foodAvailability) return false
    if (filters.value.seatingType !== 'all' && space.seatingType !== filters.value.seatingType) return false
    if (filters.value.hasOutlets !== 'all' && space.hasOutlets !== filters.value.hasOutlets) return false
    if (filters.value.verified === 'verified' && !space.verified) return false
    if (filters.value.verified === 'unverified' && space.verified) return false
    return true
  })
})

const GITHUB_REPO = 'Pezmc/coworking-spaces'
const NEW_ISSUE_URL = `https://github.com/${GITHUB_REPO}/issues/new?template=suggest-space.yml`
const VERIFY_URL = `https://github.com/${GITHUB_REPO}/issues/new?template=suggest-space.yml&title=Verify+Space`
</script>

<template>
  <div class="min-h-screen bg-[#fffaf0]">
    <!-- Header -->
    <header class="bg-[#1a365d] text-white py-8 px-6">
      <div class="max-w-6xl mx-auto">
        <h1 class="font-display text-4xl md:text-5xl font-bold m-0 mb-2">
          Leuven Coworking Spaces
        </h1>
        <p class="text-[#cbd5e0] text-lg m-0">
          Find your perfect spot to work in Leuven
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-8">
      <FilterBar
        :filters="filters"
        :sort="sort"
        @update:filters="filters = $event"
        @update:sort="sort = $event"
      />

      <!-- View Mode Toggle -->
      <div class="flex justify-end mb-4">
        <div class="inline-flex rounded-lg border-2 border-[#1a365d] overflow-hidden">
          <button
            class="px-4 py-2 text-sm font-medium transition-colors"
            :class="viewMode === 'list'
              ? 'bg-[#1a365d] text-white'
              : 'bg-white text-[#1a365d] hover:bg-[#f5f0e6]'"
            @click="viewMode = 'list'"
          >
            📋 List
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors border-l-2 border-[#1a365d]"
            :class="viewMode === 'map'
              ? 'bg-[#1a365d] text-white'
              : 'bg-white text-[#1a365d] hover:bg-[#f5f0e6]'"
            @click="viewMode = 'map'"
          >
            🗺️ Map
          </button>
        </div>
      </div>

      <!-- List View -->
      <SpaceList
        v-if="viewMode === 'list'"
        :spaces="spaces"
        :filters="filters"
        :sort="sort"
        :verify-url="VERIFY_URL"
      />

      <!-- Map View -->
      <MapView
        v-else
        :spaces="filteredSpaces"
        :all-spaces="spaces"
        :verify-url="VERIFY_URL"
      />
    </main>

    <!-- Footer -->
    <footer class="bg-[#f5f0e6] border-t-2 border-[#e2d9c8] py-8 px-6 mt-12">
      <div class="max-w-6xl mx-auto text-center">
        <div class="bg-[#1a365d] text-white rounded-lg p-6 mb-6 inline-block">
          <p class="text-lg font-medium m-0 mb-3">
            🏢 Know a great coworking spot?
          </p>
          <p class="text-[#cbd5e0] text-sm m-0 mb-4">
            Help fellow remote workers find new places!
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a
              :href="NEW_ISSUE_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-2 bg-[#ed8936] text-white font-semibold rounded hover:bg-[#dd7826] transition-colors no-underline text-sm"
            >
              ✨ Suggest via GitHub
            </a>
            <a
              href="https://pezcuckow.com"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-2 bg-white text-[#1a365d] font-semibold rounded hover:bg-[#f5f0e6] transition-colors no-underline text-sm"
            >
              ✉️ Email me
            </a>
          </div>
        </div>
        <p class="text-sm text-[#718096] m-0">
          Made with ☕ in Leuven
        </p>
      </div>
    </footer>
  </div>
</template>
