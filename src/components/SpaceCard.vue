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

// Deterministic gradient placeholder until imageUrl exists.
const photoGradient = computed(() => {
  const name = props.space.name
  let h = 5381
  for (let i = 0; i < name.length; i++) h = (h * 33) ^ name.charCodeAt(i)
  const variants = [
    'linear-gradient(135deg, #d4b88a, #8a6a3e)',
    'linear-gradient(135deg, #b8a99a, #5a4530)',
    'linear-gradient(135deg, #c8c1b0, #6e6855)',
    'linear-gradient(135deg, #d8b9a0, #7a4a2e)',
  ]
  return variants[Math.abs(h) % variants.length]
})
</script>

<template>
  <article
    class="entry border-rule-soft hover:bg-rust/[0.03] grid grid-cols-[64px_1fr] gap-3 border-b px-3 py-5 transition-colors motion-reduce:transition-none sm:grid-cols-[88px_1fr] sm:gap-5 sm:px-4"
    :class="{ 'opacity-70': !space.verified }"
  >
    <div
      class="entry-photo h-[64px] w-[64px] flex-shrink-0 sm:h-[88px] sm:w-[88px]"
      :style="{ background: photoGradient }"
      role="presentation"
    />

    <div class="min-w-0">
      <SpaceSummary :space="space">
        <template #title>
          <span :id="slugify(space.name)">{{ space.name }}</span>
        </template>
      </SpaceSummary>

      <button
        type="button"
        class="text-muted hover:text-rust focus-visible:ring-rust mt-3 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-sans text-xs font-medium tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        <span>{{ expanded ? 'Hide details' : 'More' }}</span>
        <span
          aria-hidden="true"
          class="inline-block transition-transform motion-reduce:transition-none"
          :class="{ 'rotate-180': expanded }"
        >
          ▾
        </span>
      </button>

      <div v-show="expanded" class="font-desc mt-3 space-y-3 text-[14px] leading-relaxed">
        <div v-if="space.atmosphereNotes">
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            Atmosphere
          </h4>
          <p class="text-ink m-0">{{ space.atmosphereNotes }}</p>
        </div>

        <div v-if="space.seatingNotes">
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            Seating
          </h4>
          <p class="text-ink m-0">{{ space.seatingNotes }}</p>
        </div>

        <div v-if="space.wifiNotes">
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            WiFi
          </h4>
          <p class="text-ink m-0">{{ space.wifiNotes }}</p>
        </div>

        <div v-if="space.climateNotes">
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            Climate
          </h4>
          <p class="text-ink m-0">{{ space.climateNotes }}</p>
        </div>

        <div>
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            Outlets
          </h4>
          <p
            v-tippy="OUTLET_DESCRIPTIONS[space.hasOutlets]"
            class="text-ink m-0 inline-block cursor-help"
          >
            {{ OUTLET_LABELS[space.hasOutlets] }}
          </p>
          <p v-if="space.outletNotes" class="text-ink m-0 mt-1 text-xs">
            {{ space.outletNotes }}
          </p>
        </div>

        <div v-if="space.drinkNotes">
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            Drinks
          </h4>
          <p class="text-ink m-0">{{ space.drinkNotes }}</p>
        </div>

        <div v-if="space.foodNotes">
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            Food
          </h4>
          <p class="text-ink m-0">{{ space.foodNotes }}</p>
        </div>

        <div v-if="space.openingHours">
          <h4
            class="text-faint m-0 mb-0.5 font-sans text-[10px] font-medium tracking-[0.14em] uppercase not-italic"
          >
            Hours
          </h4>
          <p class="text-ink m-0 font-mono text-xs not-italic">{{ space.openingHours }}</p>
        </div>

        <div v-if="space.verified" class="border-rule-soft mt-3 border-t pt-3">
          <a
            :href="updateUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted hover:text-rust focus-visible:ring-rust rounded font-sans text-xs not-italic hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Something wrong? Update this space →
          </a>
        </div>
      </div>
    </div>
  </article>
</template>
