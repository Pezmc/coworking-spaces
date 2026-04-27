<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { useVisitedSpaces } from '../composables/useVisitedSpaces'
import { buildUpdateSpaceUrl } from '../utils/issueUrl'

interface Props {
  space: ICoworkingSpace
  compact?: boolean // For map popup (smaller styling)
}

const props = defineProps<Props>()

const verifyUrl = computed(() => buildUpdateSpaceUrl(props.space, 'verify'))

const { isVisited, toggleVisited } = useVisitedSpaces()
const visited = computed(() => isVisited(props.space.name))
const justChecked = ref(false)

function handleToggleVisited() {
  const nowVisited = toggleVisited(props.space.name)
  if (nowVisited) {
    justChecked.value = true
    setTimeout(() => {
      justChecked.value = false
    }, 600)
  }
}

function getWifiColorHex(speed: string): string {
  switch (speed) {
    case 'fast':
      return '#22c55e'
    case 'medium':
      return '#eab308'
    case 'slow':
      return '#ef4444'
    default:
      return '#9ca3af'
  }
}

function getNoiseColorHex(level: string): string {
  switch (level) {
    case 'quiet':
      return '#22c55e'
    case 'medium':
      return '#eab308'
    case 'loud':
      return '#ef4444'
    default:
      return '#9ca3af'
  }
}

function getWifiClasses(speed: string): string {
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

function getNoiseClasses(level: string): string {
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
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3
          :class="[
            compact
              ? 'text-primary m-0 mb-1 text-lg font-bold'
              : 'font-display text-primary m-0 mb-1 text-xl font-bold',
            visited && 'line-through opacity-70',
          ]"
        >
          <slot name="title">{{ space.name }}</slot>
        </h3>

        <a
          :href="space.googleMapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted hover:text-accent focus-visible:ring-accent m-0 rounded text-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {{ space.address.split(',')[0] }}</a
        >
      </div>
      <div class="flex flex-shrink-0 flex-col items-end gap-2">
        <!-- Visited checkbox -->
        <button
          @click="handleToggleVisited"
          v-tippy="visited ? 'Click to unmark' : 'Check off once you\'ve visited!'"
          class="focus-visible:ring-accent flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          :class="
            visited
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-cool hover:border-accent hover:text-accent bg-white text-transparent'
          "
        >
          <span
            class="text-sm transition-transform duration-200 motion-reduce:transition-none"
            :class="{ 'scale-125': justChecked }"
          >
            {{ visited ? '✓' : '○' }}
          </span>
        </button>

        <span
          v-if="!space.verified"
          v-tippy="VERIFIED_DESCRIPTIONS.unverified"
          class="text-accent cursor-help text-xs font-medium"
        >
          ⚠️ Unverified
        </span>
        <span
          v-else-if="!compact"
          v-tippy="VERIFIED_DESCRIPTIONS.verified"
          class="cursor-help text-xs font-medium text-green-600"
        >
          ✓ Verified
        </span>
      </div>
    </div>

    <!-- Unverified banner -->
    <div
      v-if="!space.verified && !compact"
      class="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
    >
      <span>📋 Not verified yet. </span>
      <a
        :href="verifyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-accent focus-visible:ring-accent rounded font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Help verify it →
      </a>
    </div>

    <!-- Quick Tags -->
    <div :class="compact ? 'mt-3 mb-3 flex flex-wrap gap-1.5' : 'mt-4 flex flex-wrap gap-2'">
      <span
        v-tippy="WIFI_SPEED_DESCRIPTIONS[space.wifiSpeed]"
        :class="[
          'cursor-help rounded px-2 text-xs font-medium',
          compact ? 'py-0.5' : 'border py-1',
          !compact && getWifiClasses(space.wifiSpeed),
        ]"
        :style="getWifiStyle(space.wifiSpeed)"
      >
        📶 {{ WIFI_SPEED_LABELS[space.wifiSpeed] }}
      </span>
      <span
        v-tippy="NOISE_LEVEL_DESCRIPTIONS[space.noiseLevel]"
        :class="[
          'cursor-help rounded px-2 text-xs font-medium',
          compact ? 'py-0.5' : 'border py-1',
          !compact && getNoiseClasses(space.noiseLevel),
        ]"
        :style="getNoiseStyle(space.noiseLevel)"
      >
        🔊 {{ NOISE_LEVEL_LABELS[space.noiseLevel] }}
      </span>
      <span
        v-tippy="SEATING_DESCRIPTIONS[space.seatingType]"
        :class="[
          'bg-cream-panel text-primary cursor-help rounded px-2 text-xs font-medium',
          compact ? 'py-0.5' : 'border-warm border py-1',
        ]"
      >
        🪑 {{ SEATING_LABELS[space.seatingType] }}
      </span>
      <span
        v-if="space.hasAC === 'yes'"
        v-tippy="AC_DESCRIPTIONS[space.hasAC]"
        :class="[
          'cursor-help rounded px-2 text-xs font-medium',
          compact
            ? 'bg-blue-100 py-0.5 text-blue-700'
            : 'border border-blue-300 bg-blue-100 py-1 text-blue-800',
        ]"
      >
        ❄️ AC
      </span>
      <span
        v-if="space.foodAndDrinkAvailability !== 'none'"
        v-tippy="FOOD_DESCRIPTIONS[space.foodAndDrinkAvailability]"
        :class="[
          'cursor-help rounded px-2 text-xs font-medium',
          compact
            ? 'bg-orange-100 py-0.5 text-orange-700'
            : 'border border-orange-300 bg-orange-100 py-1 text-orange-800',
        ]"
      >
        🍽️ {{ FOOD_LABELS[space.foodAndDrinkAvailability] }}
      </span>
    </div>

    <!-- Description -->
    <div v-if="space.description" class="bg-cream-deep mt-3 rounded px-3 py-2">
      <p class="text-body m-0 text-sm italic">"{{ space.description }}"</p>
    </div>

    <!-- Unverified notice -->
    <div
      v-if="!space.verified && compact"
      v-tippy="VERIFIED_DESCRIPTIONS.unverified"
      class="mb-3 cursor-help rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800"
    >
      ⚠️ Unverified
      <a
        :href="verifyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-accent focus-visible:ring-accent ml-1 rounded font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Help verify →
      </a>
    </div>
  </div>
</template>
