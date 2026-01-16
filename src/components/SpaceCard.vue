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
    class="overflow-hidden rounded-lg border-2 border-[#e2d9c8] bg-white transition-all duration-200 hover:border-[#ed8936] hover:shadow-lg"
    :class="{ 'opacity-70': !space.verified }"
  >
    <!-- Header with Summary -->
    <div class="border-b border-[#e2d9c8] p-5">
      <SpaceSummary :space="space">
        <template #title>
          <span :id="slugify(space.name)">{{ space.name }}</span>
        </template>
      </SpaceSummary>
    </div>

    <!-- Expandable Details -->
    <div class="px-5 py-3">
      <button
        class="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent py-1 text-sm font-medium text-[#1a365d]"
        @click="expanded = !expanded"
      >
        <span>{{ expanded ? 'Hide details' : 'Show details' }}</span>
        <span class="transform transition-transform" :class="{ 'rotate-180': expanded }"> ▼ </span>
      </button>

      <div v-show="expanded" class="mt-4 space-y-3 text-sm">
        <!-- Atmosphere -->
        <div v-if="space.atmosphereNotes">
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            Atmosphere
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.atmosphereNotes }}</p>
        </div>

        <!-- Seating -->
        <div v-if="space.seatingNotes">
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            Seating
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.seatingNotes }}</p>
        </div>

        <!-- WiFi Notes -->
        <div v-if="space.wifiNotes">
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            WiFi
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.wifiNotes }}</p>
        </div>

        <!-- Climate -->
        <div v-if="space.climateNotes">
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            Climate
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.climateNotes }}</p>
        </div>

        <!-- Outlets -->
        <div>
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            Outlets
          </h4>
          <p
            v-tippy="OUTLET_DESCRIPTIONS[space.hasOutlets]"
            class="m-0 inline-block cursor-help text-[#4a5568]"
          >
            {{ OUTLET_LABELS[space.hasOutlets] }}
          </p>
          <p v-if="space.outletNotes" class="m-0 mt-1 text-xs text-[#4a5568]">
            {{ space.outletNotes }}
          </p>
        </div>

        <!-- Drinks -->
        <div v-if="space.drinkNotes">
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            Drinks
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.drinkNotes }}</p>
        </div>

        <!-- Food -->
        <div v-if="space.foodNotes">
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            Food
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.foodNotes }}</p>
        </div>

        <!-- Opening Hours -->
        <div v-if="space.openingHours">
          <h4 class="m-0 mb-1 text-xs font-semibold tracking-wide text-[#718096] uppercase">
            Hours
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.openingHours }}</p>
        </div>

        <!-- Update link for verified spaces -->
        <div v-if="space.verified" class="mt-3 border-t border-[#e2d9c8] pt-3">
          <a
            :href="updateUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-[#718096] hover:text-[#ed8936] hover:underline"
          >
            Something wrong? Update this space →
          </a>
        </div>
      </div>
    </div>
  </article>
</template>
