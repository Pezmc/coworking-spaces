<script setup lang="ts">
import { computed } from 'vue'
import {
  NOISE_LEVELS,
  WIFI_SPEEDS,
  AC_OPTIONS,
  FOOD_AND_DRINK_OPTIONS,
  SEATING_TYPES,
  OUTLET_OPTIONS,
  NOISE_LEVEL_LABELS,
  WIFI_SPEED_LABELS,
  AC_LABELS,
  FOOD_LABELS,
  SEATING_LABELS,
  OUTLET_LABELS,
  type IFilterState,
  type ISortState,
  type SortField,
} from '../types/space'

interface Props {
  filters: IFilterState
  sort: ISortState
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filters': [filters: IFilterState]
  'update:sort': [sort: ISortState]
}>()

function updateFilter<K extends keyof IFilterState>(key: K, value: IFilterState[K]) {
  emit('update:filters', { ...props.filters, [key]: value })
}

function updateSort(field: SortField) {
  if (props.sort.field === field) {
    emit('update:sort', {
      field,
      direction: props.sort.direction === 'asc' ? 'desc' : 'asc',
    })
  } else {
    emit('update:sort', { field, direction: 'asc' })
  }
}

function resetFilters() {
  emit('update:filters', {
    noiseLevel: 'all',
    wifiSpeed: 'all',
    hasAC: 'all',
    foodAvailability: 'all',
    seatingType: 'all',
    hasOutlets: 'all',
  })
}

const hasActiveFilters = computed(() => {
  return Object.values(props.filters).some((v) => v !== 'all')
})

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'wifiSpeed', label: 'WiFi Speed' },
  { field: 'noiseLevel', label: 'Noise Level' },
]
</script>

<template>
  <div class="bg-[#f5f0e6] border-2 border-[#1a365d] rounded-lg p-5 mb-8">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
      <h2 class="font-display text-xl font-bold text-[#1a365d] m-0">
        Filter Spaces
      </h2>
      <button
        v-if="hasActiveFilters"
        class="text-sm text-[#ed8936] hover:text-[#dd7826] underline cursor-pointer bg-transparent border-0"
        @click="resetFilters"
      >
        Clear all filters
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <!-- Noise Level -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-[#718096] uppercase tracking-wide">
          Noise
        </label>
        <select
          :value="filters.noiseLevel"
          class="px-3 py-2 border-2 border-[#cbd5e0] rounded bg-white text-[#1a202c] text-sm cursor-pointer transition-colors hover:border-[#ed8936] focus:border-[#ed8936] focus:outline-none"
          @change="updateFilter('noiseLevel', ($event.target as HTMLSelectElement).value as IFilterState['noiseLevel'])"
        >
          <option value="all">Any</option>
          <option v-for="level in NOISE_LEVELS" :key="level" :value="level">
            {{ NOISE_LEVEL_LABELS[level] }}
          </option>
        </select>
      </div>

      <!-- WiFi Speed -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-[#718096] uppercase tracking-wide">
          WiFi
        </label>
        <select
          :value="filters.wifiSpeed"
          class="px-3 py-2 border-2 border-[#cbd5e0] rounded bg-white text-[#1a202c] text-sm cursor-pointer transition-colors hover:border-[#ed8936] focus:border-[#ed8936] focus:outline-none"
          @change="updateFilter('wifiSpeed', ($event.target as HTMLSelectElement).value as IFilterState['wifiSpeed'])"
        >
          <option value="all">Any</option>
          <option v-for="speed in WIFI_SPEEDS" :key="speed" :value="speed">
            {{ WIFI_SPEED_LABELS[speed] }}
          </option>
        </select>
      </div>

      <!-- AC -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-[#718096] uppercase tracking-wide">
          Climate
        </label>
        <select
          :value="filters.hasAC"
          class="px-3 py-2 border-2 border-[#cbd5e0] rounded bg-white text-[#1a202c] text-sm cursor-pointer transition-colors hover:border-[#ed8936] focus:border-[#ed8936] focus:outline-none"
          @change="updateFilter('hasAC', ($event.target as HTMLSelectElement).value as IFilterState['hasAC'])"
        >
          <option value="all">Any</option>
          <option v-for="opt in AC_OPTIONS" :key="opt" :value="opt">
            {{ AC_LABELS[opt] }}
          </option>
        </select>
      </div>

      <!-- Food -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-[#718096] uppercase tracking-wide">
          Food
        </label>
        <select
          :value="filters.foodAvailability"
          class="px-3 py-2 border-2 border-[#cbd5e0] rounded bg-white text-[#1a202c] text-sm cursor-pointer transition-colors hover:border-[#ed8936] focus:border-[#ed8936] focus:outline-none"
          @change="updateFilter('foodAvailability', ($event.target as HTMLSelectElement).value as IFilterState['foodAvailability'])"
        >
          <option value="all">Any</option>
          <option v-for="opt in FOOD_AND_DRINK_OPTIONS" :key="opt" :value="opt">
            {{ FOOD_LABELS[opt] }}
          </option>
        </select>
      </div>

      <!-- Seating -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-[#718096] uppercase tracking-wide">
          Seating
        </label>
        <select
          :value="filters.seatingType"
          class="px-3 py-2 border-2 border-[#cbd5e0] rounded bg-white text-[#1a202c] text-sm cursor-pointer transition-colors hover:border-[#ed8936] focus:border-[#ed8936] focus:outline-none"
          @change="updateFilter('seatingType', ($event.target as HTMLSelectElement).value as IFilterState['seatingType'])"
        >
          <option value="all">Any</option>
          <option v-for="opt in SEATING_TYPES" :key="opt" :value="opt">
            {{ SEATING_LABELS[opt] }}
          </option>
        </select>
      </div>

      <!-- Outlets -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-[#718096] uppercase tracking-wide">
          Outlets
        </label>
        <select
          :value="filters.hasOutlets"
          class="px-3 py-2 border-2 border-[#cbd5e0] rounded bg-white text-[#1a202c] text-sm cursor-pointer transition-colors hover:border-[#ed8936] focus:border-[#ed8936] focus:outline-none"
          @change="updateFilter('hasOutlets', ($event.target as HTMLSelectElement).value as IFilterState['hasOutlets'])"
        >
          <option value="all">Any</option>
          <option v-for="opt in OUTLET_OPTIONS" :key="opt" :value="opt">
            {{ OUTLET_LABELS[opt] }}
          </option>
        </select>
      </div>
    </div>

    <!-- Sort -->
    <div class="flex items-center gap-3 pt-4 border-t border-[#cbd5e0]">
      <span class="text-xs font-semibold text-[#718096] uppercase tracking-wide">
        Sort by:
      </span>
      <div class="flex gap-2">
        <button
          v-for="option in sortOptions"
          :key="option.field"
          class="px-3 py-1.5 text-sm rounded border-2 cursor-pointer transition-all"
          :class="
            sort.field === option.field
              ? 'bg-[#1a365d] text-white border-[#1a365d]'
              : 'bg-white text-[#1a365d] border-[#cbd5e0] hover:border-[#1a365d]'
          "
          @click="updateSort(option.field)"
        >
          {{ option.label }}
          <span v-if="sort.field === option.field" class="ml-1">
            {{ sort.direction === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

