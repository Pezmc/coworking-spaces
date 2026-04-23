<script setup lang="ts">
import { ref, computed } from 'vue'
import { type ICoworkingSpace, OUTLET_LABELS, OUTLET_DESCRIPTIONS } from '../types/space'
import { slugify } from '../utils/slug'
import { buildUpdateSpaceUrl } from '../utils/issueUrl'
import SpaceSummary from './SpaceSummary.vue'

interface Props {
  space: ICoworkingSpace
}

const props = defineProps<Props>()

const expanded = ref(false)
const updateUrl = computed(() => buildUpdateSpaceUrl(props.space))
</script>

<template>
  <article
    class="border-warm hover:border-accent overflow-hidden rounded-lg border-2 bg-white transition-all duration-200 hover:shadow-lg motion-reduce:transition-none"
    :class="{ 'opacity-70': !space.verified }"
  >
    <!-- Header with Summary -->
    <div class="border-warm border-b p-5">
      <SpaceSummary :space="space">
        <template #title>
          <span :id="slugify(space.name)">{{ space.name }}</span>
        </template>
      </SpaceSummary>
    </div>

    <!-- Expandable Details -->
    <div class="px-5 py-3">
      <button
        class="text-primary focus-visible:ring-accent flex w-full cursor-pointer items-center justify-between rounded border-0 bg-transparent py-1 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        @click="expanded = !expanded"
      >
        <span>{{ expanded ? 'Hide details' : 'Show details' }}</span>
        <span
          class="transform transition-transform motion-reduce:transition-none"
          :class="{ 'rotate-180': expanded }"
        >
          ▼
        </span>
      </button>

      <div v-show="expanded" class="mt-4 space-y-3 text-sm">
        <!-- Atmosphere -->
        <div v-if="space.atmosphereNotes">
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">
            Atmosphere
          </h4>
          <p class="text-body m-0">{{ space.atmosphereNotes }}</p>
        </div>

        <!-- Seating -->
        <div v-if="space.seatingNotes">
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">Seating</h4>
          <p class="text-body m-0">{{ space.seatingNotes }}</p>
        </div>

        <!-- WiFi Notes -->
        <div v-if="space.wifiNotes">
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">WiFi</h4>
          <p class="text-body m-0">{{ space.wifiNotes }}</p>
        </div>

        <!-- Climate -->
        <div v-if="space.climateNotes">
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">Climate</h4>
          <p class="text-body m-0">{{ space.climateNotes }}</p>
        </div>

        <!-- Outlets -->
        <div>
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">Outlets</h4>
          <p
            v-tippy="OUTLET_DESCRIPTIONS[space.hasOutlets]"
            class="text-body m-0 inline-block cursor-help"
          >
            {{ OUTLET_LABELS[space.hasOutlets] }}
          </p>
          <p v-if="space.outletNotes" class="text-body m-0 mt-1 text-xs">
            {{ space.outletNotes }}
          </p>
        </div>

        <!-- Drinks -->
        <div v-if="space.drinkNotes">
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">Drinks</h4>
          <p class="text-body m-0">{{ space.drinkNotes }}</p>
        </div>

        <!-- Food -->
        <div v-if="space.foodNotes">
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">Food</h4>
          <p class="text-body m-0">{{ space.foodNotes }}</p>
        </div>

        <!-- Opening Hours -->
        <div v-if="space.openingHours">
          <h4 class="text-muted m-0 mb-1 text-xs font-semibold tracking-wide uppercase">Hours</h4>
          <p class="text-body m-0">{{ space.openingHours }}</p>
        </div>

        <!-- Update link for verified spaces -->
        <div v-if="space.verified" class="border-warm mt-3 border-t pt-3">
          <a
            :href="updateUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted hover:text-accent focus-visible:ring-accent rounded text-xs hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Something wrong? Update this space →
          </a>
        </div>
      </div>
    </div>
  </article>
</template>
