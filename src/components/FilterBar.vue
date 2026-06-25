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
import { hasActiveFilters as anyPanelFilterActive } from '../utils/filters'

const VERIFIED_LABELS: Record<VerifiedFilter, string> = {
  all: 'All spaces',
  verified: 'Verified only',
  unverified: 'Unverified only',
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
  // "Clear filters" resets the panel selects only — the toolbar When? cluster
  // (openNow / openAt) is preserved, same as openNow always was.
  emit('update:filters', {
    noiseLevel: 'all',
    wifiSpeed: 'all',
    hasAC: 'all',
    foodAvailability: 'all',
    seatingType: 'all',
    hasOutlets: 'all',
    verified: 'all',
    openNow: props.filters.openNow,
    openAt: props.filters.openAt,
  })
}

const hasActiveFilters = computed(() => anyPanelFilterActive(props.filters))

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'wifiSpeed', label: 'Wifi' },
  { field: 'noiseLevel', label: 'Noise' },
]
</script>

<template>
  <div class="border-rule mt-3 mb-6 border-t border-b py-5">
    <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="text-faint m-0 font-mono text-[10px] tracking-[0.16em] uppercase">More filters</h3>
      <button
        v-if="hasActiveFilters"
        class="text-ink hover:text-rust focus-visible:ring-rust border-rust cursor-pointer border-0 border-b bg-transparent p-0 pb-px font-sans text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        @click="resetFilters"
      >
        Clear filters
      </button>
    </div>

    <div class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
      <label class="flex flex-col gap-1">
        <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Noise</span>
        <select
          :value="filters.noiseLevel"
          class="filter-select"
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
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Wifi</span>
        <select
          :value="filters.wifiSpeed"
          class="filter-select"
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
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Climate</span>
        <select
          :value="filters.hasAC"
          class="filter-select"
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
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Food</span>
        <select
          :value="filters.foodAvailability"
          class="filter-select"
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
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Seating</span>
        <select
          :value="filters.seatingType"
          class="filter-select"
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
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Outlets</span>
        <select
          :value="filters.hasOutlets"
          class="filter-select"
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
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Status</span>
        <select
          :value="filters.verified"
          class="filter-select"
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
      </label>
    </div>

    <div class="border-rule-soft mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t pt-4">
      <span class="text-faint font-sans text-[10px] tracking-[0.12em] uppercase">Sort by</span>
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <button
          v-for="option in sortOptions"
          :key="option.field"
          class="text-muted hover:text-ink focus-visible:ring-rust cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-0.5 pb-0.5 font-sans text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          :class="sort.field === option.field ? 'text-ink !border-rust' : ''"
          @click="updateSort(option.field)"
        >
          {{ option.label }}
          <span v-if="sort.field === option.field" aria-hidden="true" class="ml-0.5 text-xs">
            {{ sort.direction === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-select {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 13px;
  color: var(--color-ink);
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--color-rule);
  padding: 4px 0;
  cursor: pointer;
  transition: border-color 120ms;
}
.filter-select:hover {
  border-bottom-color: var(--color-rust);
}
.filter-select:focus-visible {
  outline: none;
  border-bottom-color: var(--color-rust);
  box-shadow: 0 1px 0 0 var(--color-rust);
}
@media (prefers-reduced-motion: reduce) {
  .filter-select {
    transition: none;
  }
}
</style>
