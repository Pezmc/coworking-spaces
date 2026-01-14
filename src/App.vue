<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ICoworkingSpace, IFilterState, ISortState } from './types/space'
import FilterBar from './components/FilterBar.vue'
import SpaceList from './components/SpaceList.vue'
import MapView from './components/MapView.vue'
import VisitProgress from './components/VisitProgress.vue'
import spacesData from './data/spaces.json'

const spaces = spacesData as ICoworkingSpace[]

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

import { NEW_SPACE_URL } from './utils/issueUrl'
</script>

<template>
  <div class="min-h-screen bg-[#fffaf0]">
    <!-- Header -->
    <header class="bg-[#1a365d] text-white py-6 px-4 sm:py-8 sm:px-6">
      <div class="max-w-6xl mx-auto flex items-center gap-4 sm:gap-6">
        <img
          src="/favicon.svg"
          alt="Leuven Coworking Cafes logo"
          class="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 flex-shrink-0 bg-white rounded-full p-1.5"
        />
        <div>
          <h1 class="font-display text-2xl sm:text-4xl md:text-5xl font-bold m-0 mb-1 sm:mb-2">
            Leuven Coworking Cafes
          </h1>
          <p class="text-[#cbd5e0] text-sm sm:text-lg m-0">
            Find your perfect spot to work in Leuven
          </p>
        </div>
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
      />

      <!-- Map View -->
      <MapView
        v-else
        :spaces="filteredSpaces"
        :all-spaces="spaces"
      />
    </main>

    <!-- Footer -->
    <footer class="bg-[#f5f0e6] border-t-2 border-[#e2d9c8] py-8 px-6 mt-12 pb-24">
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
              :href="NEW_SPACE_URL"
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
          Made with ☕ in Leuven ·
          <a
            href="https://github.com/Pezmc/coworking-spaces"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#718096] hover:text-[#ed8936] underline"
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
