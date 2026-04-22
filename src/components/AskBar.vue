<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import type { IFilterState } from '../types/space'
import { parseAsk, type IAskMatch } from '../utils/askParser'

const emit = defineEmits<{
  (e: 'apply', patch: Partial<IFilterState>): void
}>()

const rawInput = ref('')
const thinking = ref(false)
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

onMounted(() => {
  placeholderTimer = window.setInterval(() => {
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
    thinking.value = false
    if (lastAppliedKeys.size > 0) {
      runParse('')
    } else {
      matches.value = []
    }
    return
  }
  thinking.value = true
  const delay = 550 + Math.floor(Math.random() * 300)
  debounceTimer = window.setTimeout(() => {
    runParse(val)
    thinking.value = false
  }, delay)
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

function clearAll() {
  rawInput.value = ''
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (placeholderTimer) clearInterval(placeholderTimer)
})
</script>

<template>
  <div class="mb-5">
    <div class="relative">
      <span
        class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-[#ed8936]"
        aria-hidden="true"
      >
        ✨
      </span>
      <input
        v-model="rawInput"
        type="text"
        :placeholder="placeholderText"
        class="w-full rounded-lg border-2 border-[#e2d9c8] bg-white py-3 pr-24 pl-11 text-sm text-[#1a365d] placeholder:text-[#a0aec0] focus:border-[#ed8936] focus:outline-none"
        aria-label="Describe what you need — smart search"
      />
      <div
        v-if="thinking"
        class="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-1.5 text-xs text-[#718096]"
        aria-live="polite"
      >
        <span>Thinking</span>
        <span class="flex gap-0.5">
          <span
            class="inline-block h-1 w-1 animate-bounce rounded-full bg-[#ed8936] [animation-delay:0ms] motion-reduce:animate-none"
          ></span>
          <span
            class="inline-block h-1 w-1 animate-bounce rounded-full bg-[#ed8936] [animation-delay:150ms] motion-reduce:animate-none"
          ></span>
          <span
            class="inline-block h-1 w-1 animate-bounce rounded-full bg-[#ed8936] [animation-delay:300ms] motion-reduce:animate-none"
          ></span>
        </span>
      </div>
      <button
        v-else-if="rawInput"
        type="button"
        class="absolute top-1/2 right-2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-[#718096] transition-colors hover:text-[#1a365d] focus-visible:ring-2 focus-visible:ring-[#ed8936] focus-visible:outline-none"
        @click="clearAll"
      >
        Clear
      </button>
    </div>

    <div
      v-if="matches.length > 0"
      class="mt-2 flex flex-wrap items-center gap-2"
      aria-label="Matched filters — click to remove"
    >
      <span class="text-xs text-[#718096]">Matched:</span>
      <button
        v-for="m in matches"
        :key="m.filter"
        type="button"
        class="group inline-flex items-center gap-1.5 rounded-full bg-[#ed8936] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#dd7826] focus-visible:ring-2 focus-visible:ring-[#1a365d] focus-visible:outline-none"
        :aria-label="`Remove ${m.label} filter`"
        @click="removeChip(m)"
      >
        <span>{{ m.label }}</span>
        <span aria-hidden="true" class="opacity-70 transition-opacity group-hover:opacity-100">
          ×
        </span>
      </button>
    </div>

    <p v-else-if="rawInput && !thinking" class="mt-2 text-xs text-[#a0aec0]" aria-live="polite">
      Try "quiet", "fast wifi", or "AC"
    </p>
  </div>
</template>
