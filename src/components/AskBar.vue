<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import type { IFilterState } from '../types/space'
import { parseAsk, type IAskMatch } from '../utils/askParser'

const emit = defineEmits<{
  (e: 'apply', patch: Partial<IFilterState>): void
}>()

const rawInput = ref('')
const matches = ref<IAskMatch[]>([])

const EXAMPLES = [
  'Somewhere quiet with strong wifi…',
  "I need AC, it's boiling today…",
  'Open now, a bit hungry…',
  'Buzzy vibe with snacks and plugs…',
  'Fast wifi for a zoom call…',
  'Deep-work spot with plenty of outlets…',
]
const placeholderIdx = ref(0)
const placeholderText = computed(() => EXAMPLES[placeholderIdx.value])
let placeholderTimer: number | undefined

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (reduceMotion) return
  placeholderTimer = window.setInterval(() => {
    if (rawInput.value) return
    placeholderIdx.value = (placeholderIdx.value + 1) % EXAMPLES.length
  }, 4000)
})

let debounceTimer: number | undefined
let lastAppliedKeys = new Set<keyof IFilterState>()

function defaultFor(key: keyof IFilterState): IFilterState[keyof IFilterState] {
  if (key === 'openNow') return false
  return 'all'
}

function runParse(val: string) {
  const parsed = parseAsk(val)
  const newKeys = new Set(Object.keys(parsed.filterPatch) as (keyof IFilterState)[])
  const patch: Partial<IFilterState> = { ...parsed.filterPatch }
  for (const key of lastAppliedKeys) {
    if (!newKeys.has(key)) {
      ;(patch as Record<string, unknown>)[key] = defaultFor(key)
    }
  }
  lastAppliedKeys = newKeys
  matches.value = parsed.matches
  emit('apply', patch)
}

watch(rawInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    if (lastAppliedKeys.size > 0) {
      runParse('')
    } else {
      matches.value = []
    }
    return
  }
  debounceTimer = window.setTimeout(() => {
    runParse(val)
  }, 250)
})

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function removeChip(match: IAskMatch) {
  const re = new RegExp(`\\b${escapeRegex(match.phrase)}\\b`, 'ig')
  rawInput.value = rawInput.value
    .replace(re, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (placeholderTimer) clearInterval(placeholderTimer)
})
</script>

<template>
  <div class="ask-bar mt-4 mb-2">
    <label
      for="askInput"
      class="text-faint mb-1 block font-mono text-[10px] tracking-[0.08em] uppercase"
    >
      or describe what you want
    </label>
    <input
      id="askInput"
      v-model="rawInput"
      type="text"
      :placeholder="placeholderText"
      class="font-desc border-rule focus:border-rust w-full border-0 border-b-[1.5px] bg-transparent py-2 pr-2 text-base text-[var(--color-ink)] transition-colors outline-none placeholder:text-[var(--color-faint)] placeholder:italic motion-reduce:transition-none"
      aria-label="Describe what you're looking for — smart filter"
    />

    <div
      v-if="matches.length > 0"
      class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2"
      aria-label="Matched filters — click to remove"
    >
      <span class="text-faint font-mono text-[10px] tracking-[0.16em] uppercase">Matched</span>
      <button
        v-for="m in matches"
        :key="m.filter"
        type="button"
        class="text-ink hover:text-rust focus-visible:ring-rust border-rust inline-flex items-baseline gap-1.5 border-0 border-b-2 bg-transparent px-0 pb-0.5 font-sans text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        :aria-label="`Remove ${m.label} filter`"
        @click="removeChip(m)"
      >
        <span>{{ m.label }}</span>
        <span aria-hidden="true" class="text-muted text-xs">×</span>
      </button>
    </div>
  </div>
</template>
