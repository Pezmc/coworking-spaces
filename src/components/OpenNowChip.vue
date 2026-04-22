<script setup lang="ts">
import { computed } from 'vue'
import { useWeather } from '../utils/weather'
import { weatherEmoji } from '../utils/weatherEmoji'

interface Props {
  active: boolean
}

defineProps<Props>()
const emit = defineEmits<{ toggle: [] }>()

const { weather, loading, failed } = useWeather()

const emoji = computed(() => weatherEmoji(weather.value, loading.value))

const label = computed(() => {
  if (loading.value) return 'Open now'
  if (failed.value || !weather.value) return 'Open now'
  return `Open now · ${weather.value.tempC}°C`
})

const ariaLabel = computed(() => {
  if (loading.value) return 'Open now, weather loading'
  if (failed.value || !weather.value) return 'Open now'
  return `Open now, currently ${weather.value.tempC} degrees ${weather.value.condition}`
})

const title = computed(() =>
  failed.value
    ? 'Show only spaces open based on today’s hours.'
    : 'Show only spaces open based on today’s hours. Weather-aware label.',
)
</script>

<template>
  <button
    type="button"
    :aria-pressed="active"
    :aria-label="ariaLabel"
    :title="title"
    :class="[
      'inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors',
      'focus-visible:ring-2 focus-visible:ring-[#ed8936] focus-visible:ring-offset-2 focus-visible:outline-none',
      active
        ? 'border-[#1a365d] bg-[#1a365d] text-white hover:bg-[#15284a]'
        : 'border-[#1a365d] bg-white text-[#1a365d] hover:bg-[#f5f0e6]',
      loading && 'cursor-wait opacity-70',
    ]"
    @click="emit('toggle')"
  >
    <span aria-hidden="true">{{ emoji }}</span>
    <span>{{ label }}</span>
  </button>
</template>
