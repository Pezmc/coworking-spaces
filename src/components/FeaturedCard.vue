<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IFeaturedPick } from '../utils/featuredSpaces'
import { NOISE_LEVEL_LABELS, WIFI_SPEED_LABELS, FOOD_LABELS } from '../types/space'
import AppIcon from './AppIcon.vue'

interface Props {
  pick: IFeaturedPick
}

const props = defineProps<Props>()
const flipped = ref(false)

const firstSentence = computed(() => {
  const d = props.pick.space.description.trim()
  const match = d.match(/^[^.!?]+[.!?]/)
  return (match ? match[0] : d).trim()
})

interface Pill {
  icon: string
  label: string
}

const pills = computed<Pill[]>(() => {
  const s = props.pick.space
  const out: Pill[] = []
  out.push({
    icon:
      s.noiseLevel === 'quiet'
        ? 'volume-quiet'
        : s.noiseLevel === 'loud'
          ? 'volume-loud'
          : 'volume-mid',
    label: NOISE_LEVEL_LABELS[s.noiseLevel],
  })
  out.push({
    icon: s.wifiSpeed === 'unknown' ? 'wifi-off' : 'wifi',
    label: `${WIFI_SPEED_LABELS[s.wifiSpeed]} wifi`,
  })
  if (s.foodAndDrinkAvailability !== 'none') {
    out.push({ icon: 'utensils', label: FOOD_LABELS[s.foodAndDrinkAvailability] })
  }
  return out
})

const photoGradient = computed(() => {
  const name = props.pick.space.name
  let h = 5381
  for (let i = 0; i < name.length; i++) h = (h * 33) ^ name.charCodeAt(i)
  const variants = [
    'radial-gradient(ellipse at 30% 35%, #e9c485 0%, #c39256 35%, #6e4322 80%)',
    'radial-gradient(ellipse at 60% 30%, #d4b88a 0%, #a07b4a 40%, #5a3a1a 90%)',
    'radial-gradient(ellipse at 40% 50%, #e0c8a8 0%, #b39060 45%, #6e4f2c 90%)',
  ]
  return variants[Math.abs(h) % variants.length]
})

function toggle() {
  flipped.value = !flipped.value
}
</script>

<template>
  <button
    type="button"
    class="group focus-visible:ring-rust relative block h-32 w-full cursor-pointer text-left [perspective:1000px] focus-visible:ring-2 focus-visible:outline-none sm:h-72"
    :aria-pressed="flipped"
    :aria-label="`${pick.label}: ${pick.space.name} — click to ${flipped ? 'hide' : 'show'} details`"
    @click="toggle"
  >
    <div
      class="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
      :class="flipped ? '[transform:rotateY(180deg)]' : ''"
    >
      <!-- Front: photo-on-left compact on mobile, photo-on-top on sm+ -->
      <div
        class="border-rule group-hover:border-rust absolute inset-0 flex flex-row overflow-hidden border bg-white transition-colors [backface-visibility:hidden] motion-reduce:transition-none sm:flex-col"
        :aria-hidden="flipped"
      >
        <div
          class="relative h-full w-[110px] flex-shrink-0 overflow-hidden sm:h-[120px] sm:w-full"
          :style="pick.space.imageUrl ? undefined : { background: photoGradient }"
          role="presentation"
        >
          <img
            v-if="pick.space.imageUrl"
            :src="pick.space.imageUrl"
            :alt="pick.space.name"
            loading="lazy"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="flex flex-1 flex-col gap-1 p-3 sm:gap-2 sm:p-5">
          <span
            class="text-rust font-sans text-[9.5px] font-medium tracking-[0.14em] uppercase sm:text-[10px] sm:tracking-[0.16em]"
          >
            {{ pick.label }}
          </span>
          <h3
            class="font-display text-navy m-0 text-base leading-tight font-semibold tracking-tight sm:text-[22px]"
          >
            {{ pick.space.name }}
          </h3>
          <p class="font-desc text-muted m-0 hidden text-[12.5px] sm:block">{{ pick.hook }}</p>
          <p
            class="font-desc text-ink m-0 line-clamp-2 hidden text-[13.5px] leading-relaxed sm:block"
          >
            {{ firstSentence }}
          </p>

          <div
            class="border-rule-soft mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5 text-[9.5px] sm:gap-x-2.5 sm:border-t sm:pt-2 sm:text-[10px]"
          >
            <template v-for="(pill, i) in pills" :key="pill.label">
              <span
                class="text-muted inline-flex items-center gap-1 font-sans font-medium tracking-[0.1em] uppercase"
              >
                <AppIcon :name="pill.icon" size="sm" />
                {{ pill.label }}
              </span>
              <span v-if="i < pills.length - 1" class="text-rule">·</span>
            </template>
            <span
              aria-hidden="true"
              class="text-faint ml-auto hidden pl-2 font-mono text-[9px] tracking-wide sm:inline"
            >
              tap to flip ↻
            </span>
          </div>
        </div>
      </div>

      <!-- Back -->
      <div
        class="border-rust bg-paper-deep absolute inset-0 [transform:rotateY(180deg)] overflow-y-auto border p-4 [backface-visibility:hidden] sm:p-5"
        :aria-hidden="!flipped"
      >
        <h3 class="font-display text-navy m-0 mb-2 text-lg leading-tight font-semibold">
          {{ pick.space.name }}
        </h3>
        <p class="font-desc text-ink m-0 mb-3 text-[14px] leading-relaxed">
          {{ pick.space.description }}
        </p>

        <div v-if="pick.space.atmosphereNotes" class="mb-2">
          <p class="text-faint m-0 font-sans text-[10px] font-medium tracking-[0.14em] uppercase">
            Atmosphere
          </p>
          <p class="font-desc text-ink m-0 text-[12.5px]">
            {{ pick.space.atmosphereNotes }}
          </p>
        </div>

        <div v-if="pick.space.seatingNotes">
          <p class="text-faint m-0 font-sans text-[10px] font-medium tracking-[0.14em] uppercase">
            Seating
          </p>
          <p class="font-desc text-ink m-0 text-[12.5px]">{{ pick.space.seatingNotes }}</p>
        </div>

        <span
          aria-hidden="true"
          class="text-faint absolute right-3 bottom-3 font-mono text-[9px] tracking-wide"
        >
          tap to flip back ↺
        </span>
      </div>
    </div>
  </button>
</template>
