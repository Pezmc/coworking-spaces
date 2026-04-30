<script setup lang="ts">
import AppIcon from './AppIcon.vue'

type ViewMode = 'list' | 'map'

interface Props {
  modelValue: ViewMode
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ViewMode): void
}>()

function setMode(mode: ViewMode) {
  emit('update:modelValue', mode)
}
</script>

<template>
  <div
    class="border-navy inline-flex w-full border bg-white sm:w-auto"
    role="tablist"
    aria-label="View mode"
  >
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'list'"
      :class="[
        'focus-visible:ring-rust inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-0 px-4 py-2 font-sans text-xs font-medium tracking-[0.04em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none sm:flex-none',
        modelValue === 'list'
          ? 'bg-navy text-paper hover:bg-navy-hover'
          : 'text-ink hover:bg-paper-deep bg-transparent',
      ]"
      @click="setMode('list')"
    >
      <AppIcon name="list" size="sm" />
      List
    </button>
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'map'"
      :class="[
        'border-navy focus-visible:ring-rust inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-0 border-l px-4 py-2 font-sans text-xs font-medium tracking-[0.04em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-reduce:transition-none sm:flex-none',
        modelValue === 'map'
          ? 'bg-navy text-paper hover:bg-navy-hover'
          : 'text-ink hover:bg-paper-deep bg-transparent',
      ]"
      @click="setMode('map')"
    >
      <AppIcon name="map-pin" size="sm" />
      Map
    </button>
  </div>
</template>
