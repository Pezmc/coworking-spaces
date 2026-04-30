<script setup lang="ts">
import { computed } from 'vue'
import type { ICoworkingSpace, IFilterState, ISortState } from '../types/space'
import SpaceCard from './SpaceCard.vue'
import { slugify } from '../utils/slug'
import { parseOpeningHours, isOpen } from '../utils/hoursBasic'

interface Props {
  spaces: ICoworkingSpace[]
  filters: IFilterState
  sort: ISortState
}

const props = defineProps<Props>()

const WIFI_SPEED_ORDER = { unknown: 0, slow: 1, medium: 2, fast: 3 }
const NOISE_LEVEL_ORDER = { quiet: 0, medium: 1, loud: 2 }

const isOnlyOpenNowActive = computed(() => {
  const f = props.filters
  if (!f.openNow) return false
  return (
    f.noiseLevel === 'all' &&
    f.wifiSpeed === 'all' &&
    f.hasAC === 'all' &&
    f.foodAvailability === 'all' &&
    f.seatingType === 'all' &&
    f.hasOutlets === 'all' &&
    f.verified === 'all'
  )
})

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
  if (props.filters.openNow) {
    const now = new Date()
    result = result.filter((s) => isOpen(parseOpeningHours(s.openingHours), now) === true)
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
    <!-- Empty state -->
    <div
      v-if="filteredAndSortedSpaces.length === 0"
      class="border-rule border-y px-2 py-10 text-center"
    >
      <template v-if="isOnlyOpenNowActive">
        <p class="font-display text-navy m-0 mb-2 text-xl italic">Nothing's open right now.</p>
        <p class="text-muted font-sans m-0 text-sm">
          Leuven keeps odd café hours. Try again after lunch, or clear the filter.
        </p>
      </template>
      <template v-else-if="props.filters.openNow">
        <p class="font-display text-navy m-0 mb-2 text-xl italic">No open spots match.</p>
        <p class="text-muted font-sans m-0 text-sm">
          Try clearing <strong class="font-medium">Open now</strong> or loosening another filter.
        </p>
      </template>
      <template v-else>
        <p class="font-display text-navy m-0 mb-2 text-xl italic">Nothing matches.</p>
        <p class="text-muted font-sans m-0 text-sm">Try clearing a filter.</p>
      </template>
    </div>

    <!-- Single-column list with hairline rules between rows -->
    <div v-else>
      <SpaceCard
        v-for="space in filteredAndSortedSpaces"
        :key="slugify(space.name)"
        :space="space"
      />
    </div>
  </div>
</template>
