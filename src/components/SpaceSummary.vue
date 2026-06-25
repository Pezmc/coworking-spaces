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
import AppIcon from './AppIcon.vue'

interface Props {
  space: ICoworkingSpace
  compact?: boolean
}

const props = defineProps<Props>()

const verifyUrl = computed(() => buildUpdateSpaceUrl(props.space, 'verify'))
const neighbourhood = computed(() => props.space.address.split(',')[0]?.trim() ?? '')

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

function noiseIcon(level: string): string {
  if (level === 'quiet') return 'volume-quiet'
  if (level === 'loud') return 'volume-loud'
  return 'volume-mid'
}

function wifiIcon(speed: string): string {
  return speed === 'unknown' ? 'wifi-off' : 'wifi'
}
</script>

<template>
  <div :class="compact ? 'compact-summary' : 'entry-summary'">
    <!-- Title row: name + neighbourhood + verified dot + visited button -->
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span
            v-if="space.verified"
            v-tippy="VERIFIED_DESCRIPTIONS.verified"
            class="bg-moss inline-block h-[7px] w-[7px] flex-shrink-0 cursor-help rounded-full"
            aria-label="Verified"
          />
          <h3
            :class="[
              'font-display text-navy m-0 font-semibold tracking-tight',
              compact ? 'text-lg leading-tight' : 'text-xl leading-tight sm:text-[22px]',
              visited && 'decoration-rust/40 line-through decoration-[1.5px]',
            ]"
          >
            <slot name="title">{{ space.name }}</slot>
          </h3>
          <a
            v-if="neighbourhood"
            :href="space.googleMapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted hover:text-rust focus-visible:ring-rust font-sans text-xs hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span class="text-faint">·</span> {{ neighbourhood }}
          </a>
        </div>
      </div>

      <!-- Visited toggle -->
      <button
        v-if="!compact"
        type="button"
        @click="handleToggleVisited"
        v-tippy="visited ? 'Click to unmark' : 'Mark as visited'"
        class="focus-visible:ring-rust flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        :class="
          visited
            ? 'bg-rust border-rust text-paper'
            : 'border-rule hover:border-rust hover:text-rust bg-transparent text-transparent'
        "
        :aria-pressed="visited"
        :aria-label="visited ? 'Marked visited' : 'Mark visited'"
      >
        <AppIcon
          name="check"
          size="sm"
          class="transition-transform duration-150 motion-reduce:transition-none"
          :class="{ 'scale-110': justChecked }"
        />
      </button>
    </div>

    <!-- Unverified caption (only if !verified) -->
    <p v-if="!space.verified" class="text-muted mt-1 font-sans text-xs">
      Not verified yet.
      <a
        :href="verifyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-ink hover:text-rust focus-visible:ring-rust border-rust border-b pb-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Help verify it
      </a>
    </p>

    <!-- Description -->
    <p
      v-if="space.description"
      :class="[
        'font-desc text-ink m-0',
        compact ? 'mt-2 text-sm' : 'mt-2 text-[15px] leading-relaxed',
      ]"
    >
      {{ space.description }}
    </p>

    <!-- Meta strip: icon-pill metadata, separated by · -->
    <div
      :class="[
        'text-muted flex flex-wrap items-center font-sans text-[11px] font-medium tracking-[0.06em] uppercase',
        compact ? 'mt-2 gap-x-2 gap-y-1' : 'mt-3 gap-x-2.5 gap-y-1.5',
      ]"
    >
      <span
        v-tippy="WIFI_SPEED_DESCRIPTIONS[space.wifiSpeed]"
        class="inline-flex cursor-help items-center gap-1"
      >
        <AppIcon :name="wifiIcon(space.wifiSpeed)" size="sm" />
        {{ WIFI_SPEED_LABELS[space.wifiSpeed] }} wifi
      </span>
      <span class="text-rule">·</span>
      <span
        v-tippy="NOISE_LEVEL_DESCRIPTIONS[space.noiseLevel]"
        class="inline-flex cursor-help items-center gap-1"
      >
        <AppIcon :name="noiseIcon(space.noiseLevel)" size="sm" />
        {{ NOISE_LEVEL_LABELS[space.noiseLevel] }}
      </span>
      <span class="text-rule">·</span>
      <span
        v-tippy="SEATING_DESCRIPTIONS[space.seatingType]"
        class="inline-flex cursor-help items-center gap-1"
      >
        <AppIcon name="armchair" size="sm" />
        {{ SEATING_LABELS[space.seatingType] }}
      </span>
      <template v-if="space.hasAC === 'yes'">
        <span class="text-rule">·</span>
        <span
          v-tippy="AC_DESCRIPTIONS[space.hasAC]"
          class="inline-flex cursor-help items-center gap-1"
        >
          <AppIcon name="snowflake" size="sm" />
          AC
        </span>
      </template>
      <template v-if="space.foodAndDrinkAvailability !== 'none'">
        <span class="text-rule">·</span>
        <span
          v-tippy="FOOD_DESCRIPTIONS[space.foodAndDrinkAvailability]"
          class="inline-flex cursor-help items-center gap-1"
        >
          <AppIcon name="utensils" size="sm" />
          {{ FOOD_LABELS[space.foodAndDrinkAvailability] }}
        </span>
      </template>
    </div>
  </div>
</template>
