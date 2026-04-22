<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ICoworkingSpace } from '../types/space'
import { getFeaturedSpaces } from '../utils/featuredSpaces'
import FeaturedCard from './FeaturedCard.vue'

interface Props {
  spaces: ICoworkingSpace[]
}

const props = defineProps<Props>()

const STORAGE_KEY = 'todayView.collapsed'
const collapsed = ref(false)

try {
  collapsed.value = localStorage.getItem(STORAGE_KEY) === '1'
} catch {
  collapsed.value = false
}

watch(collapsed, (val) => {
  try {
    if (val) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
})

const picks = computed(() => getFeaturedSpaces(props.spaces))
</script>

<template>
  <section v-if="picks.length > 0" class="mb-6" aria-label="Today's featured coworking spaces">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="font-display m-0 text-lg font-bold text-[#1a365d] sm:text-xl">Today's picks</h2>
      <button
        type="button"
        class="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#718096] transition-colors hover:text-[#1a365d] focus-visible:ring-2 focus-visible:ring-[#ed8936] focus-visible:outline-none"
        :aria-expanded="!collapsed"
        :aria-label="collapsed ? 'Show today\'s picks' : 'Hide today\'s picks'"
        @click="collapsed = !collapsed"
      >
        <span>{{ collapsed ? 'Show' : 'Hide' }}</span>
        <span
          aria-hidden="true"
          class="inline-block transition-transform"
          :class="{ 'rotate-180': !collapsed }"
        >
          ▼
        </span>
      </button>
    </div>

    <div v-show="!collapsed" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <FeaturedCard v-for="pick in picks" :key="pick.slot" :pick="pick" />
    </div>
  </section>
</template>
