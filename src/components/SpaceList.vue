<script setup lang="ts">
import { computed } from 'vue'
import type { ICoworkingSpace, IFilterState, ISortState } from '../types/space'
import SpaceCard from './SpaceCard.vue'
import { slugify } from '../utils/slug'

interface Props {
  spaces: ICoworkingSpace[]
  filters: IFilterState
  sort: ISortState
  verifyUrl: string
}

const props = defineProps<Props>()

const WIFI_SPEED_ORDER = { unknown: 0, slow: 1, medium: 2, fast: 3 }
const NOISE_LEVEL_ORDER = { quiet: 0, medium: 1, loud: 2 }

const filteredAndSortedSpaces = computed(() => {
  let result = [...props.spaces]

  // Apply filters
  if (props.filters.noiseLevel !== 'all') {
    result = result.filter((s) => s.noiseLevel === props.filters.noiseLevel)
  }
  if (props.filters.wifiSpeed !== 'all') {
    result = result.filter((s) => s.wifiSpeed === props.filters.wifiSpeed)
  }
  if (props.filters.hasAC !== 'all') {
    result = result.filter((s) => s.hasAC === props.filters.hasAC)
  }
  if (props.filters.foodAvailability !== 'all') {
    result = result.filter((s) => s.foodAndDrinkAvailability === props.filters.foodAvailability)
  }
  if (props.filters.seatingType !== 'all') {
    result = result.filter((s) => s.seatingType === props.filters.seatingType)
  }
  if (props.filters.hasOutlets !== 'all') {
    result = result.filter((s) => s.hasOutlets === props.filters.hasOutlets)
  }
  if (props.filters.verified === 'verified') {
    result = result.filter((s) => s.verified)
  }
  if (props.filters.verified === 'unverified') {
    result = result.filter((s) => !s.verified)
  }

  // Apply sorting
  const direction = props.sort.direction === 'asc' ? 1 : -1

  result.sort((a, b) => {
    switch (props.sort.field) {
      case 'name':
        return direction * a.name.localeCompare(b.name)
      case 'wifiSpeed':
        return direction * (WIFI_SPEED_ORDER[a.wifiSpeed] - WIFI_SPEED_ORDER[b.wifiSpeed])
      case 'noiseLevel':
        return direction * (NOISE_LEVEL_ORDER[a.noiseLevel] - NOISE_LEVEL_ORDER[b.noiseLevel])
      default:
        return 0
    }
  })

  return result
})
</script>

<template>
  <div>
    <!-- Results count -->
    <p class="text-sm text-[#718096] mb-4">
      Showing {{ filteredAndSortedSpaces.length }} of {{ spaces.length }} spaces
    </p>

    <!-- Empty state -->
    <div
      v-if="filteredAndSortedSpaces.length === 0"
      class="text-center py-12 px-6 bg-[#f5f0e6] rounded-lg border-2 border-dashed border-[#cbd5e0]"
    >
      <p class="text-lg text-[#718096] m-0 mb-2">No spaces match your filters</p>
      <p class="text-sm text-[#a0aec0] m-0">
        Try adjusting your filter criteria
      </p>
    </div>

    <!-- Space grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      <SpaceCard
        v-for="space in filteredAndSortedSpaces"
        :key="slugify(space.name)"
        :space="space"
        :verify-url="verifyUrl"
      />
    </div>
  </div>
</template>

