<script setup lang="ts">
import { computed } from 'vue'
import type { ICoworkingSpace, IFilterState, ISortState } from '../types/space'
import SpaceCard from './SpaceCard.vue'
import { slugify } from '../utils/slug'
import { matchesFilters, formatMinutes, hasActiveFilters } from '../utils/filters'

interface Props {
  spaces: ICoworkingSpace[]
  filters: IFilterState
  sort: ISortState
}

const props = defineProps<Props>()

const WIFI_SPEED_ORDER = { unknown: 0, slow: 1, medium: 2, fast: 3 }
const NOISE_LEVEL_ORDER = { quiet: 0, medium: 1, loud: 2 }

// True when no "More filters" panel selection is active (a time filter may still
// be on). Reuses the central predicate so this can't drift if a panel filter is added.
const noPanelFiltersActive = computed(() => !hasActiveFilters(props.filters))

const openAtLabel = computed(() =>
  props.filters.openAt !== null ? formatMinutes(props.filters.openAt) : null,
)

const filteredAndSortedSpaces = computed(() => {
  const now = new Date()
  const result = props.spaces.filter((s) => matchesFilters(s, props.filters, now))

  // Apply sorting
  const direction = props.sort.direction === 'asc' ? 1 : -1

  result.sort((a, b) => {
    switch (props.sort.field) {
      case 'name':
        return direction * a.name.localeCompare(b.name)
      case 'wifiSpeed': {
        const bucket = WIFI_SPEED_ORDER[a.wifiSpeed] - WIFI_SPEED_ORDER[b.wifiSpeed]
        if (bucket !== 0) return direction * bucket
        // Same bucket → finer order by measured download speed (unmeasured last).
        const ad = a.wifiSpeedMbps?.down ?? -1
        const bd = b.wifiSpeedMbps?.down ?? -1
        return direction * (ad - bd)
      }
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
      <template v-if="openAtLabel && noPanelFiltersActive">
        <p class="font-display text-navy m-0 mb-2 text-xl italic">
          Nothing's open at
          <span class="font-mono text-[0.95em] not-italic">{{ openAtLabel }}</span
          >.
        </p>
        <p class="text-muted m-0 font-sans text-sm">
          Leuven's café hours are all over the place. Try an earlier time, or clear it.
        </p>
      </template>
      <template v-else-if="openAtLabel">
        <p class="font-display text-navy m-0 mb-2 text-xl italic">
          No spots open at
          <span class="font-mono text-[0.95em] not-italic">{{ openAtLabel }}</span> match.
        </p>
        <p class="text-muted m-0 font-sans text-sm">Loosen a filter or pick another time.</p>
      </template>
      <template v-else-if="props.filters.openNow && noPanelFiltersActive">
        <p class="font-display text-navy m-0 mb-2 text-xl italic">Nothing's open right now.</p>
        <p class="text-muted m-0 font-sans text-sm">
          Leuven keeps odd café hours. Try again after lunch, or clear the filter.
        </p>
      </template>
      <template v-else-if="props.filters.openNow">
        <p class="font-display text-navy m-0 mb-2 text-xl italic">No open spots match.</p>
        <p class="text-muted m-0 font-sans text-sm">
          Try clearing <strong class="font-medium">Open now</strong> or loosening another filter.
        </p>
      </template>
      <template v-else>
        <p class="font-display text-navy m-0 mb-2 text-xl italic">Nothing matches.</p>
        <p class="text-muted m-0 font-sans text-sm">Try clearing a filter.</p>
      </template>
    </div>

    <!-- Two-column grid on md+; hairline rules between rows on each card -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
      <SpaceCard
        v-for="space in filteredAndSortedSpaces"
        :key="slugify(space.name)"
        :space="space"
      />
    </div>
  </div>
</template>
