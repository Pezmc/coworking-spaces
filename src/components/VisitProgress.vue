<script setup lang="ts">
import { computed } from 'vue'
import { useVisitedSpaces } from '../composables/useVisitedSpaces'

interface Props {
  totalSpaces: number
}

const props = defineProps<Props>()
const { visitedCount } = useVisitedSpaces()

const percentage = computed(() => {
  if (props.totalSpaces === 0) return 0
  return Math.round((visitedCount.value / props.totalSpaces) * 100)
})

const message = computed(() => {
  if (visitedCount.value === 0) return ''
  if (visitedCount.value === 1) return "You've started your Leuven coworking journey! ☕"
  if (percentage.value === 100) return "🎉 You've visited every spot! True coworking champion!"
  if (percentage.value >= 75) return "Almost there! You're a Leuven coworking pro! 🌟"
  if (percentage.value >= 50) return "Halfway through! Keep exploring! 🚀"
  if (percentage.value >= 25) return "Great progress! So many spots to discover! 📍"
  return "Keep exploring Leuven's coworking scene! 🗺️"
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="visitedCount > 0"
      class="fixed bottom-0 left-0 right-0 bg-[#1a365d] text-white shadow-lg z-50"
    >
      <div class="max-w-6xl mx-auto px-6 py-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-2xl">{{ percentage === 100 ? '🏆' : '✅' }}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium m-0 truncate">
                {{ message }}
              </p>
              <p class="text-xs text-[#cbd5e0] m-0">
                {{ visitedCount }} of {{ totalSpaces }} spaces visited
              </p>
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="flex-shrink-0 w-32 md:w-48">
            <div class="h-2 bg-[#2d4a7c] rounded-full overflow-hidden">
              <div
                class="h-full bg-[#ed8936] rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${percentage}%` }"
              />
            </div>
            <p class="text-xs text-[#cbd5e0] text-right mt-1 m-0">{{ percentage }}%</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>

