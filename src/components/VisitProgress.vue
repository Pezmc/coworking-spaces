<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVisitedSpaces } from '../composables/useVisitedSpaces'

interface Props {
  totalSpaces: number
}

const props = defineProps<Props>()
const { visitedCount, getShareableUrl } = useVisitedSpaces()

const percentage = computed(() => {
  if (props.totalSpaces === 0) return 0
  return Math.round((visitedCount.value / props.totalSpaces) * 100)
})

const message = computed(() => {
  if (visitedCount.value === 0) return ''
  if (visitedCount.value === 1) return "You've started your Leuven coworking journey! ☕"
  if (percentage.value === 100) return "🎉 You've visited every spot! True coworking champion!"
  if (percentage.value >= 75) return "Almost there! You're a Leuven coworking pro! 🌟"
  if (percentage.value >= 50) return 'Halfway through! Keep exploring! 🚀'
  if (percentage.value >= 25) return 'Great progress! So many spots to discover! 📍'
  return "Keep exploring Leuven's coworking scene! 🗺️"
})

const copyStatus = ref<'idle' | 'copied'>('idle')

async function copyShareLink() {
  try {
    const url = getShareableUrl()
    await navigator.clipboard.writeText(url)
    copyStatus.value = 'copied'
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  } catch {
    // Fallback for browsers without clipboard API
    const url = getShareableUrl()
    prompt('Copy this link to save your progress:', url)
  }
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="visitedCount > 0"
      class="bg-navy fixed right-0 bottom-0 left-0 z-50 text-white shadow-lg"
    >
      <div class="mx-auto max-w-6xl px-6 py-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex flex-shrink-0 items-center gap-3">
            <span class="text-2xl">{{ percentage === 100 ? '🏆' : '✅' }}</span>
            <div class="min-w-[280px] sm:min-w-[340px]">
              <p class="m-0 text-sm font-medium">
                {{ message }}
              </p>
              <p class="text-faint m-0 text-xs">
                {{ visitedCount }} of {{ totalSpaces }} spaces visited ·
                <button
                  v-tippy="'Bookmark this link to restore your progress'"
                  class="text-faint focus-visible:ring-rust cursor-pointer rounded border-0 bg-transparent p-0 underline transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
                  :class="{ 'text-green-400 hover:text-green-400': copyStatus === 'copied' }"
                  @click="copyShareLink"
                >
                  {{
                    copyStatus === 'copied' ? 'copied link to clipboard!' : 'copy my progress link'
                  }}
                </button>
              </p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div class="bg-navy-track h-3 flex-1 overflow-hidden rounded-full">
              <div
                class="bg-rust h-full rounded-full transition-all duration-500 ease-out motion-reduce:transition-none"
                :style="{ width: `${percentage}%` }"
              />
            </div>
            <span class="text-faint flex-shrink-0 text-xs">{{ percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
