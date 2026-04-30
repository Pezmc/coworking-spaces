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
      'inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 border px-3.5 py-2 font-sans text-xs font-medium tracking-[0.04em] uppercase transition-colors motion-reduce:transition-none',
      'focus-visible:ring-rust focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      active
        ? 'border-navy bg-navy text-paper hover:bg-navy-hover'
        : 'border-navy text-ink hover:bg-paper-deep bg-white',
      loading && 'cursor-wait opacity-70',
    ]"
    @click="emit('toggle')"
  >
    <span aria-hidden="true">{{ emoji }}</span>
    <span>{{ label }}</span>
  </button>
</template>
