<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVisitedSpaces } from '../composables/useVisitedSpaces'
import AppIcon from './AppIcon.vue'

interface Props {
  totalSpaces: number
}

const props = defineProps<Props>()
const { visitedCount, getShareableUrl } = useVisitedSpaces()

const percentage = computed(() => {
  if (props.totalSpaces === 0) return 0
  return Math.round((visitedCount.value / props.totalSpaces) * 100)
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
    const url = getShareableUrl()
    prompt('Copy this link to save your progress:', url)
  }
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="visitedCount > 0"
      class="bg-paper border-rule fixed right-0 bottom-0 left-0 z-50 border-t"
    >
      <div class="mx-auto max-w-6xl px-5 py-3 sm:px-6">
        <div class="text-ink flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[13px]">
          <span class="text-rust flex-shrink-0" aria-hidden="true">
            <AppIcon name="check" />
          </span>
          <p class="m-0 flex flex-shrink-0 items-baseline gap-1.5 font-medium">
            <span class="font-display text-navy text-base font-semibold italic">
              {{ visitedCount }}
            </span>
            <span class="text-muted text-xs font-normal">of {{ totalSpaces }}</span>
            visited
          </p>
          <div
            class="bg-rule-soft order-5 h-[3px] w-full min-w-0 flex-1 sm:order-3"
            role="progressbar"
            :aria-valuenow="percentage"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="bg-rust h-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
              :style="{ width: `${percentage}%` }"
            />
          </div>
          <span class="text-muted order-3 flex-shrink-0 font-mono text-xs sm:order-4">
            {{ percentage }}%
          </span>
          <button
            type="button"
            class="text-ink hover:text-rust focus-visible:ring-rust border-rust order-4 flex-shrink-0 cursor-pointer border-0 border-b bg-transparent p-0 pb-px text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none sm:order-5"
            v-tippy="'Bookmark this link to restore your progress on another device'"
            @click="copyShareLink"
          >
            {{ copyStatus === 'copied' ? 'copied' : 'copy progress link' }}
          </button>
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

@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: opacity 0.1s ease;
  }
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: none;
  }
}
</style>
