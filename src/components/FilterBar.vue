<script setup lang="ts">
import { computed } from 'vue'
import {
  NOISE_LEVELS,
  WIFI_SPEEDS,
  AC_OPTIONS,
  FOOD_AND_DRINK_OPTIONS,
  SEATING_TYPES,
  OUTLET_OPTIONS,
  VERIFIED_OPTIONS,
  NOISE_LEVEL_LABELS,
  WIFI_SPEED_LABELS,
  AC_LABELS,
  FOOD_LABELS,
  SEATING_LABELS,
  OUTLET_LABELS,
  type IFilterState,
  type ISortState,
  type SortField,
  type VerifiedFilter,
} from '../types/space'

const VERIFIED_LABELS: Record<VerifiedFilter, string> = {
  all: 'All Spaces',
  verified: 'Verified Only',
  unverified: 'Unverified Only',
}

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
    verified: 'all',
    openNow: props.filters.openNow,
  })
}

const hasActiveFilters = computed(() => {
  const { openNow: _ignored, ...rest } = props.filters
  return Object.values(rest).some((v) => v !== 'all')
})

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'wifiSpeed', label: 'WiFi Speed' },
  { field: 'noiseLevel', label: 'Noise Level' },
]
</script>

<template>
  <div class="border-primary bg-cream-panel mb-8 rounded-lg border-2 p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h2 class="font-display text-primary m-0 text-xl font-bold">Filter Spaces</h2>
      <button
        v-if="hasActiveFilters"
        class="text-accent hover:text-accent-hover focus-visible:ring-accent cursor-pointer rounded border-0 bg-transparent text-sm underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        @click="resetFilters"
      >
        Clear all filters
      </button>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
      <!-- Noise Level -->
      <div class="flex flex-col gap-1">
        <label class="text-muted text-xs font-semibold tracking-wide uppercase"> Noise </label>
        <select
          :value="filters.noiseLevel"
          class="border-cool text-ink hover:border-accent focus-visible:ring-accent cursor-pointer rounded border-2 bg-white px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          @change="
            updateFilter(
              'noiseLevel',
              ($event.target as HTMLSelectElement).value as IFilterState['noiseLevel'],
            )
          "
        >
          <option value="all">Any</option>
          <option v-for="level in NOISE_LEVELS" :key="level" :value="level">
            {{ NOISE_LEVEL_LABELS[level] }}
          </option>
        </select>
      </div>

      <!-- WiFi Speed -->
      <div class="flex flex-col gap-1">
        <label class="text-muted text-xs font-semibold tracking-wide uppercase"> WiFi </label>
        <select
          :value="filters.wifiSpeed"
          class="border-cool text-ink hover:border-accent focus-visible:ring-accent cursor-pointer rounded border-2 bg-white px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          @change="
            updateFilter(
              'wifiSpeed',
              ($event.target as HTMLSelectElement).value as IFilterState['wifiSpeed'],
            )
          "
        >
          <option value="all">Any</option>
          <option v-for="speed in WIFI_SPEEDS" :key="speed" :value="speed">
            {{ WIFI_SPEED_LABELS[speed] }}
          </option>
        </select>
      </div>

      <!-- AC -->
      <div class="flex flex-col gap-1">
        <label class="text-muted text-xs font-semibold tracking-wide uppercase"> Climate </label>
        <select
          :value="filters.hasAC"
          class="border-cool text-ink hover:border-accent focus-visible:ring-accent cursor-pointer rounded border-2 bg-white px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          @change="
            updateFilter(
              'hasAC',
              ($event.target as HTMLSelectElement).value as IFilterState['hasAC'],
            )
          "
        >
          <option value="all">Any</option>
          <option v-for="opt in AC_OPTIONS" :key="opt" :value="opt">
            {{ AC_LABELS[opt] }}
          </option>
        </select>
      </div>

      <!-- Food -->
      <div class="flex flex-col gap-1">
        <label class="text-muted text-xs font-semibold tracking-wide uppercase"> Food </label>
        <select
          :value="filters.foodAvailability"
          class="border-cool text-ink hover:border-accent focus-visible:ring-accent cursor-pointer rounded border-2 bg-white px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          @change="
            updateFilter(
              'foodAvailability',
              ($event.target as HTMLSelectElement).value as IFilterState['foodAvailability'],
            )
          "
        >
          <option value="all">Any</option>
          <option v-for="opt in FOOD_AND_DRINK_OPTIONS" :key="opt" :value="opt">
            {{ FOOD_LABELS[opt] }}
          </option>
        </select>
      </div>

      <!-- Seating -->
      <div class="flex flex-col gap-1">
        <label class="text-muted text-xs font-semibold tracking-wide uppercase"> Seating </label>
        <select
          :value="filters.seatingType"
          class="border-cool text-ink hover:border-accent focus-visible:ring-accent cursor-pointer rounded border-2 bg-white px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          @change="
            updateFilter(
              'seatingType',
              ($event.target as HTMLSelectElement).value as IFilterState['seatingType'],
            )
          "
        >
          <option value="all">Any</option>
          <option v-for="opt in SEATING_TYPES" :key="opt" :value="opt">
            {{ SEATING_LABELS[opt] }}
          </option>
        </select>
      </div>

      <!-- Outlets -->
      <div class="flex flex-col gap-1">
        <label class="text-muted text-xs font-semibold tracking-wide uppercase"> Outlets </label>
        <select
          :value="filters.hasOutlets"
          class="border-cool text-ink hover:border-accent focus-visible:ring-accent cursor-pointer rounded border-2 bg-white px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          @change="
            updateFilter(
              'hasOutlets',
              ($event.target as HTMLSelectElement).value as IFilterState['hasOutlets'],
            )
          "
        >
          <option value="all">Any</option>
          <option v-for="opt in OUTLET_OPTIONS" :key="opt" :value="opt">
            {{ OUTLET_LABELS[opt] }}
          </option>
        </select>
      </div>

      <!-- Verified -->
      <div class="flex flex-col gap-1">
        <label class="text-muted text-xs font-semibold tracking-wide uppercase"> Status </label>
        <select
          :value="filters.verified"
          class="border-cool text-ink hover:border-accent focus-visible:ring-accent cursor-pointer rounded border-2 bg-white px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          @change="
            updateFilter(
              'verified',
              ($event.target as HTMLSelectElement).value as IFilterState['verified'],
            )
          "
        >
          <option v-for="opt in VERIFIED_OPTIONS" :key="opt" :value="opt">
            {{ VERIFIED_LABELS[opt] }}
          </option>
        </select>
      </div>
    </div>

    <!-- Sort -->
    <div class="border-cool flex items-center gap-3 border-t pt-4">
      <span class="text-muted text-xs font-semibold tracking-wide uppercase"> Sort by: </span>
      <div class="flex gap-2">
        <button
          v-for="option in sortOptions"
          :key="option.field"
          class="focus-visible:ring-accent cursor-pointer rounded border-2 px-3 py-1.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          :class="
            sort.field === option.field
              ? 'border-primary bg-primary text-white'
              : 'border-cool text-primary hover:border-primary bg-white'
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
