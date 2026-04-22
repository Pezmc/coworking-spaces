<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IFeaturedPick } from '../utils/featuredSpaces'
import { NOISE_LEVEL_LABELS, WIFI_SPEED_LABELS, FOOD_LABELS } from '../types/space'

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

const pills = computed(() => {
  const s = props.pick.space
  const out: string[] = []
  out.push(NOISE_LEVEL_LABELS[s.noiseLevel])
  out.push(`${WIFI_SPEED_LABELS[s.wifiSpeed]} WiFi`)
  if (s.foodAndDrinkAvailability !== 'none') {
    out.push(FOOD_LABELS[s.foodAndDrinkAvailability])
  }
  return out
})

function toggle() {
  flipped.value = !flipped.value
}
</script>

<template>
  <button
    type="button"
    class="group relative block h-64 w-full cursor-pointer rounded-lg text-left [perspective:1000px] focus-visible:ring-2 focus-visible:ring-[#ed8936] focus-visible:outline-none"
    :aria-pressed="flipped"
    :aria-label="`${pick.label}: ${pick.space.name} — click to ${flipped ? 'hide' : 'show'} details`"
    @click="toggle"
  >
    <div
      class="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
      :class="flipped ? '[transform:rotateY(180deg)]' : ''"
    >
      <!-- Front -->
      <div
        class="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-lg border-2 border-[#e2d9c8] bg-white p-5 [backface-visibility:hidden] group-hover:border-[#ed8936]"
        :aria-hidden="flipped"
      >
        <div>
          <p class="m-0 mb-2 text-xs font-semibold tracking-wide text-[#ed8936] uppercase">
            {{ pick.label }}
          </p>
          <h3 class="font-display m-0 mb-1 text-xl font-bold text-[#1a365d]">
            {{ pick.space.name }}
          </h3>
          <p class="m-0 text-xs text-[#718096] italic">{{ pick.hook }}</p>
        </div>

        <div>
          <p class="m-0 mb-3 line-clamp-3 text-sm text-[#4a5568]">
            {{ firstSentence }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="pill in pills"
              :key="pill"
              class="rounded-full bg-[#f5f0e6] px-2 py-0.5 text-xs font-medium text-[#1a365d]"
            >
              {{ pill }}
            </span>
          </div>
        </div>

        <span aria-hidden="true" class="absolute right-3 bottom-3 text-xs text-[#a0aec0]">
          tap to flip ↻
        </span>
      </div>

      <!-- Back -->
      <div
        class="absolute inset-0 [transform:rotateY(180deg)] overflow-y-auto rounded-lg border-2 border-[#ed8936] bg-[#fffaf0] p-5 [backface-visibility:hidden]"
        :aria-hidden="!flipped"
      >
        <h3 class="font-display m-0 mb-2 text-lg font-bold text-[#1a365d]">
          {{ pick.space.name }}
        </h3>
        <p class="m-0 mb-3 text-sm text-[#4a5568]">{{ pick.space.description }}</p>

        <div v-if="pick.space.atmosphereNotes" class="mb-2">
          <p class="m-0 text-xs font-semibold tracking-wide text-[#718096] uppercase">Atmosphere</p>
          <p class="m-0 text-xs text-[#4a5568]">{{ pick.space.atmosphereNotes }}</p>
        </div>

        <div v-if="pick.space.seatingNotes">
          <p class="m-0 text-xs font-semibold tracking-wide text-[#718096] uppercase">Seating</p>
          <p class="m-0 text-xs text-[#4a5568]">{{ pick.space.seatingNotes }}</p>
        </div>

        <span aria-hidden="true" class="absolute right-3 bottom-3 text-xs text-[#a0aec0]">
          tap to flip back ↺
        </span>
      </div>
    </div>
  </button>
</template>
