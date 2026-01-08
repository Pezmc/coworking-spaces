<script setup lang="ts">
import { ref } from 'vue'
import {
  type ICoworkingSpace,
  OUTLET_LABELS,
  OUTLET_DESCRIPTIONS,
} from '../types/space'
import { slugify } from '../utils/slug'
import SpaceSummary from './SpaceSummary.vue'

interface Props {
  space: ICoworkingSpace
  verifyUrl: string
}

defineProps<Props>()

const expanded = ref(false)
</script>

<template>
  <article
    class="bg-white border-2 border-[#e2d9c8] rounded-lg overflow-hidden transition-all duration-200 hover:border-[#ed8936] hover:shadow-lg"
    :class="{ 'opacity-70': !space.verified }"
  >
    <!-- Header with Summary -->
    <div class="p-5 border-b border-[#e2d9c8]">
      <SpaceSummary :space="space" :verify-url="verifyUrl">
        <template #title>
          <span :id="slugify(space.name)">{{ space.name }}</span>
        </template>
      </SpaceSummary>
    </div>

    <!-- Expandable Details -->
    <div class="px-5 py-3">
      <button
        class="w-full flex items-center justify-between text-sm font-medium text-[#1a365d] bg-transparent border-0 cursor-pointer py-1"
        @click="expanded = !expanded"
      >
        <span>{{ expanded ? 'Hide details' : 'Show details' }}</span>
        <span class="transform transition-transform" :class="{ 'rotate-180': expanded }">
          ▼
        </span>
      </button>

      <div
        v-show="expanded"
        class="mt-4 space-y-3 text-sm"
      >
        <!-- Atmosphere -->
        <div v-if="space.atmosphereNotes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Atmosphere
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.atmosphereNotes }}</p>
        </div>

        <!-- Seating -->
        <div v-if="space.seatingNotes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Seating
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.seatingNotes }}</p>
        </div>

        <!-- WiFi Notes -->
        <div v-if="space.wifiNotes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            WiFi
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.wifiNotes }}</p>
        </div>

        <!-- Climate -->
        <div v-if="space.climateNotes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Climate
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.climateNotes }}</p>
        </div>

        <!-- Outlets -->
        <div>
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Outlets
          </h4>
          <p
            class="m-0 text-[#4a5568] cursor-help inline-block"
            :title="OUTLET_DESCRIPTIONS[space.hasOutlets]"
          >
            {{ OUTLET_LABELS[space.hasOutlets] }}
          </p>
          <p v-if="space.outletNotes" class="m-0 text-[#4a5568] text-xs mt-1">
            {{ space.outletNotes }}
          </p>
        </div>

        <!-- Drinks -->
        <div v-if="space.drinkNotes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Drinks
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.drinkNotes }}</p>
        </div>

        <!-- Food -->
        <div v-if="space.foodNotes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Food
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.foodNotes }}</p>
        </div>

        <!-- Opening Hours -->
        <div v-if="space.openingHours">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Hours
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.openingHours }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
