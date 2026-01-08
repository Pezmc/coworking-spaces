<script setup lang="ts">
import {
  type ICoworkingSpace,
  NOISE_LEVEL_LABELS,
  WIFI_SPEED_LABELS,
  FOOD_LABELS,
  SEATING_LABELS,
  NOISE_LEVEL_DESCRIPTIONS,
  WIFI_SPEED_DESCRIPTIONS,
  FOOD_DESCRIPTIONS,
  SEATING_DESCRIPTIONS,
  AC_DESCRIPTIONS,
  VERIFIED_DESCRIPTIONS,
} from '../types/space'

interface Props {
  space: ICoworkingSpace
  verifyUrl: string
  compact?: boolean // For map popup (smaller styling)
}

const props = defineProps<Props>()

// Color utilities - return hex colors for use in both Tailwind and inline styles
function getWifiColorHex(speed: string): string {
  switch (speed) {
    case 'fast': return '#22c55e'
    case 'medium': return '#eab308'
    case 'slow': return '#ef4444'
    default: return '#9ca3af'
  }
}

function getNoiseColorHex(level: string): string {
  switch (level) {
    case 'quiet': return '#22c55e'
    case 'medium': return '#eab308'
    case 'loud': return '#ef4444'
    default: return '#9ca3af'
  }
}

function getWifiClasses(speed: string): string {
  switch (speed) {
    case 'fast': return 'bg-green-100 text-green-800 border-green-300'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'slow': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-600 border-gray-300'
  }
}

function getNoiseClasses(level: string): string {
  switch (level) {
    case 'quiet': return 'bg-green-100 text-green-800 border-green-300'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'loud': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-600 border-gray-300'
  }
}

// For compact mode, we use inline styles; for full mode, we use Tailwind classes
function getWifiStyle(speed: string) {
  if (!props.compact) return undefined
  const color = getWifiColorHex(speed)
  return { backgroundColor: color + '20', color }
}

function getNoiseStyle(level: string) {
  if (!props.compact) return undefined
  const color = getNoiseColorHex(level)
  return { backgroundColor: color + '20', color }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-start gap-3">
      <div class="min-w-0 flex-1">
        <h3 
          :class="compact 
            ? 'font-bold text-lg text-[#1a365d] m-0 mb-1' 
            : 'font-display text-xl font-bold text-[#1a365d] m-0 mb-1'"
        >
          <slot name="title">{{ space.name }}</slot>
        </h3>
        
        <a :href="space.googleMapsUrl"
          target="_blank"
          rel="noopener noreferrer" class="text-sm text-[#718096] m-0 hover:text-[#ed8936] hover:underline">
          {{ space.address.split(',')[0] }}</a>
      </div>
      <div class="flex flex-col gap-2 items-end flex-shrink-0">
        <span
          v-if="!space.verified"
          class="text-xs text-[#ed8936] font-medium cursor-help"
          :title="VERIFIED_DESCRIPTIONS.unverified"
        >
          ⚠️ Unverified
        </span>
        <span
          v-else-if="!compact"
          class="text-xs text-green-600 font-medium cursor-help"
          :title="VERIFIED_DESCRIPTIONS.verified"
        >
          ✓ Verified
        </span>
      </div>
    </div>

    <!-- Unverified banner -->
    <div
      v-if="!space.verified && !compact"
      class="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800"
    >
      <span>📋 This space hasn't been verified yet. </span>
      <a
        :href="verifyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold text-[#ed8936] hover:underline"
      >
        Help verify it →
      </a>
    </div>

    <!-- Quick Tags -->
    <div :class="compact ? 'flex flex-wrap gap-1.5 mt-3 mb-3' : 'flex flex-wrap gap-2 mt-4'">
      <span
        :class="[
          'px-2 text-xs font-medium rounded cursor-help',
          compact ? 'py-0.5' : 'py-1 border',
          !compact && getWifiClasses(space.wifiSpeed)
        ]"
        :style="getWifiStyle(space.wifiSpeed)"
        :title="WIFI_SPEED_DESCRIPTIONS[space.wifiSpeed]"
      >
        📶 {{ WIFI_SPEED_LABELS[space.wifiSpeed] }}
      </span>
      <span
        :class="[
          'px-2 text-xs font-medium rounded cursor-help',
          compact ? 'py-0.5' : 'py-1 border',
          !compact && getNoiseClasses(space.noiseLevel)
        ]"
        :style="getNoiseStyle(space.noiseLevel)"
        :title="NOISE_LEVEL_DESCRIPTIONS[space.noiseLevel]"
      >
        🔊 {{ NOISE_LEVEL_LABELS[space.noiseLevel] }}
      </span>
      <span
        :class="[
          'px-2 text-xs font-medium rounded bg-[#f5f0e6] text-[#1a365d] cursor-help',
          compact ? 'py-0.5' : 'py-1 border border-[#e2d9c8]'
        ]"
        :title="SEATING_DESCRIPTIONS[space.seatingType]"
      >
        🪑 {{ SEATING_LABELS[space.seatingType] }}
      </span>
      <span
        v-if="space.hasAC === 'yes'"
        :class="[
          'px-2 text-xs font-medium rounded cursor-help',
          compact ? 'py-0.5 bg-blue-100 text-blue-700' : 'py-1 border bg-blue-100 text-blue-800 border-blue-300'
        ]"
        :title="AC_DESCRIPTIONS[space.hasAC]"
      >
        ❄️ AC
      </span>
      <span
        v-if="space.foodAndDrinkAvailability !== 'none'"
        :class="[
          'px-2 text-xs font-medium rounded cursor-help',
          compact ? 'py-0.5 bg-orange-100 text-orange-700' : 'py-1 border bg-orange-100 text-orange-800 border-orange-300'
        ]"
        :title="FOOD_DESCRIPTIONS[space.foodAndDrinkAvailability]"
      >
        🍽️ {{ FOOD_LABELS[space.foodAndDrinkAvailability] }}
      </span>
    </div>

    <!-- Description -->
    <div v-if="space.description" class="mt-3 px-3 py-2 bg-[#faf5eb] rounded">
      <p class="text-sm text-[#4a5568] m-0 italic">
        "{{ space.description }}"
      </p>
    </div>

    <!-- Unverified notice -->
    <div
      v-if="!space.verified && compact"
      class="mb-3 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 cursor-help"
      :title="VERIFIED_DESCRIPTIONS.unverified"
    >
      ⚠️ Unverified
      <a
        :href="verifyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold text-[#ed8936] hover:underline ml-1"
      >
        Help verify →
      </a>
    </div>
  </div>
</template>
