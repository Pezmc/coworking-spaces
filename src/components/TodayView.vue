<script setup lang="ts">
import { computed } from 'vue'
import type { ICoworkingSpace } from '../types/space'
import { getFeaturedSpaces } from '../utils/featuredSpaces'
import FeaturedCard from './FeaturedCard.vue'

interface Props {
  spaces: ICoworkingSpace[]
}

const props = defineProps<Props>()

const picks = computed(() => getFeaturedSpaces(props.spaces))
</script>

<template>
  <section
    v-if="picks.length > 0"
    class="mt-6 mb-2 sm:mb-4"
    aria-label="Today's featured coworking spaces"
  >
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <h2 class="font-display text-navy m-0 text-base font-semibold italic sm:text-lg">
        Today's picks
      </h2>
      <span
        class="font-mono text-muted text-[10px] tracking-[0.06em] uppercase"
        aria-hidden="true"
      >
        {{ picks.length }} of {{ spaces.length }} · rotates daily
      </span>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <FeaturedCard v-for="pick in picks" :key="pick.slot" :pick="pick" />
    </div>
  </section>
</template>
