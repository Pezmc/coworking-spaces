<script setup lang="ts">
import { ref } from 'vue'
import {
  type ICoworkingSpace,
  NOISE_LEVEL_LABELS,
  WIFI_SPEED_LABELS,
  FOOD_LABELS,
  SEATING_LABELS,
  OUTLET_LABELS,
} from '../types/space'

interface Props {
  space: ICoworkingSpace
}

defineProps<Props>()

const expanded = ref(false)

function getWifiColor(speed: string): string {
  switch (speed) {
    case 'fast':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'slow':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300'
  }
}

function getNoiseColor(level: string): string {
  switch (level) {
    case 'quiet':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'loud':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300'
  }
}
</script>

<template>
  <article
    class="bg-white border-2 border-[#e2d9c8] rounded-lg overflow-hidden transition-all duration-200 hover:border-[#ed8936] hover:shadow-lg"
  >
    <!-- Header -->
    <div class="p-5 border-b border-[#e2d9c8]">
      <div class="flex justify-between items-start gap-4">
        <div>
          <h3 class="font-display text-xl font-bold text-[#1a365d] m-0 mb-1">
            {{ space.name }}
          </h3>
          <p class="text-sm text-[#718096] m-0">{{ space.address }}</p>
        </div>
        <a
          :href="space.googleMapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-[#1a365d] bg-[#f5f0e6] rounded border border-[#cbd5e0] hover:bg-[#ed8936] hover:text-white hover:border-[#ed8936] transition-colors no-underline"
        >
          📍 Map
        </a>
      </div>

      <!-- Quick Tags -->
      <div class="flex flex-wrap gap-2 mt-4">
        <span
          class="px-2 py-1 text-xs font-medium rounded border"
          :class="getWifiColor(space.wifiSpeed)"
        >
          📶 {{ WIFI_SPEED_LABELS[space.wifiSpeed] }}
        </span>
        <span
          class="px-2 py-1 text-xs font-medium rounded border"
          :class="getNoiseColor(space.noiseLevel)"
        >
          🔊 {{ NOISE_LEVEL_LABELS[space.noiseLevel] }}
        </span>
        <span
          class="px-2 py-1 text-xs font-medium rounded border bg-[#f5f0e6] text-[#1a365d] border-[#e2d9c8]"
        >
          🪑 {{ SEATING_LABELS[space.seatingType] }}
        </span>
        <span
          v-if="space.hasAC === 'yes'"
          class="px-2 py-1 text-xs font-medium rounded border bg-blue-100 text-blue-800 border-blue-300"
        >
          ❄️ AC
        </span>
        <span
          v-if="space.foodAvailability !== 'none'"
          class="px-2 py-1 text-xs font-medium rounded border bg-orange-100 text-orange-800 border-orange-300"
        >
          🍽️ {{ FOOD_LABELS[space.foodAvailability] }}
        </span>
      </div>
    </div>

    <!-- Atmosphere Preview -->
    <div v-if="space.atmosphere" class="px-5 py-3 bg-[#faf5eb]">
      <p class="text-sm text-[#4a5568] m-0 italic">
        "{{ space.atmosphere }}"
      </p>
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
        <!-- Space Description -->
        <div v-if="space.spaceDescription">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Space
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.spaceDescription }}</p>
        </div>

        <!-- WiFi Details -->
        <div v-if="space.wifiDetails">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            WiFi Details
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.wifiDetails }}</p>
        </div>

        <!-- Noise -->
        <div v-if="space.noiseNotes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Noise
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.noiseNotes }}</p>
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
          <p class="m-0 text-[#4a5568]">{{ OUTLET_LABELS[space.hasOutlets] }}</p>
        </div>

        <!-- Drinks -->
        <div v-if="space.drinks">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Drinks
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.drinks }}</p>
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

        <!-- Notes -->
        <div v-if="space.notes">
          <h4 class="text-xs font-semibold text-[#718096] uppercase tracking-wide m-0 mb-1">
            Notes
          </h4>
          <p class="m-0 text-[#4a5568]">{{ space.notes }}</p>
        </div>
      </div>
    </div>
  </article>
</template>

