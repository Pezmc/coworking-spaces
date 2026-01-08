<script setup lang="ts">
import { ref } from 'vue'
import type { ICoworkingSpace, IFilterState, ISortState } from './types/space'
import FilterBar from './components/FilterBar.vue'
import SpaceList from './components/SpaceList.vue'
import spacesData from './data/spaces.json'

const spaces = spacesData as ICoworkingSpace[]

const filters = ref<IFilterState>({
  noiseLevel: 'all',
  wifiSpeed: 'all',
  hasAC: 'all',
  foodAvailability: 'all',
  seatingType: 'all',
  hasOutlets: 'all',
})

const sort = ref<ISortState>({
  field: 'name',
  direction: 'asc',
})

const GITHUB_REPO = 'pezcuckow/Coworking'
const NEW_ISSUE_URL = `https://github.com/${GITHUB_REPO}/issues/new?template=suggest-space.yml`
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

      <SpaceList
        :spaces="spaces"
        :filters="filters"
        :sort="sort"
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
