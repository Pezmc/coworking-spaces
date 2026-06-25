<script setup lang="ts">
// "Open at <time>" toolbar chip — sits in the When? cluster beside OpenNowChip.
// The reveal is a WAI-ARIA listbox (a single-select value picker is a listbox,
// NOT a menu): full keyboard model + focus return, so it matches what a native
// <select> gives, while staying on the cream/navy/sharp design system when open.
//
//   [chip: Open at 17:00 ▾]   ── click / ↓ / Enter ──►   ┌─────────────┐
//                                                        │ Any time    │  role=listbox
//                                                        │ 06:00       │  aria-activedescendant
//                                                        │ …           │  ↑↓ Home End Enter Esc
//                                                        │ 23:00       │
//                                                        └─────────────┘
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'
import { formatMinutes } from '../utils/filters'

interface Props {
  minutes: number | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ select: [value: number | null] }>()

interface Option {
  value: number | null
  label: string
}

// "Any time" + hourly 06:00–23:00. NL parsing / URL can carry any minute; the
// picker offers hours, which is the granularity "open at 5pm" implies.
const OPTIONS: Option[] = [
  { value: null, label: 'Any time' },
  ...Array.from({ length: 18 }, (_, i) => {
    const m = 360 + i * 60
    return { value: m, label: formatMinutes(m) }
  }),
]

const open = ref(false)
const activeIndex = ref(0)
const rootRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLUListElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)

const optionId = (i: number) => `openat-opt-${i}`
const activeDescendant = computed(() => (open.value ? optionId(activeIndex.value) : undefined))
const ariaLabel = computed(() =>
  props.minutes === null ? 'Open at a time' : `Open at ${formatMinutes(props.minutes)}`,
)

function currentIndex(): number {
  const i = OPTIONS.findIndex((o) => o.value === props.minutes)
  return i === -1 ? 0 : i
}

function scrollActiveIntoView() {
  nextTick(() => {
    const el = listRef.value?.children[activeIndex.value]
    if (el instanceof Element) el.scrollIntoView({ block: 'nearest' })
  })
}

function openMenu() {
  if (open.value) return
  activeIndex.value = currentIndex()
  open.value = true
  document.addEventListener('mousedown', onDocMouseDown)
  nextTick(() => {
    listRef.value?.focus()
    scrollActiveIntoView()
  })
}

function closeMenu(returnFocus = true) {
  if (!open.value) return
  open.value = false
  document.removeEventListener('mousedown', onDocMouseDown)
  if (returnFocus) nextTick(() => buttonRef.value?.focus())
}

function toggleMenu() {
  if (open.value) closeMenu()
  else openMenu()
}

function selectIndex(i: number) {
  const opt = OPTIONS[i]
  if (opt) emit('select', opt.value)
  closeMenu(true)
}

function onDocMouseDown(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) closeMenu(false)
}

function onRootFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (open.value && (!next || (rootRef.value && !rootRef.value.contains(next)))) closeMenu(false)
}

function onButtonKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openMenu()
  }
}

function onListKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, OPTIONS.length - 1)
      scrollActiveIntoView()
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      scrollActiveIntoView()
      break
    case 'Home':
      e.preventDefault()
      activeIndex.value = 0
      scrollActiveIntoView()
      break
    case 'End':
      e.preventDefault()
      activeIndex.value = OPTIONS.length - 1
      scrollActiveIntoView()
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      selectIndex(activeIndex.value)
      break
    case 'Escape':
      e.preventDefault()
      closeMenu(true)
      break
    case 'Tab':
      closeMenu(false)
      break
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown)
})
</script>

<template>
  <div ref="rootRef" class="relative inline-block" @focusout="onRootFocusOut">
    <button
      ref="buttonRef"
      type="button"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="ariaLabel"
      :class="[
        'inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 border px-3.5 py-2 font-sans text-xs font-medium tracking-[0.04em] uppercase transition-colors motion-reduce:transition-none',
        'focus-visible:ring-rust focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        props.minutes !== null
          ? 'border-navy bg-navy text-paper hover:bg-navy-hover'
          : 'border-navy text-ink hover:bg-paper-deep bg-white',
      ]"
      @click="toggleMenu"
      @keydown="onButtonKeydown"
    >
      <AppIcon name="clock" />
      <span>Open at</span>
      <span v-if="props.minutes !== null" class="font-mono normal-case">{{
        formatMinutes(props.minutes)
      }}</span>
      <span v-else aria-hidden="true">…</span>
    </button>

    <ul
      v-if="open"
      ref="listRef"
      role="listbox"
      tabindex="-1"
      aria-label="Open at"
      :aria-activedescendant="activeDescendant"
      class="border-navy bg-paper absolute top-full left-0 z-20 mt-1 max-h-72 min-w-[9rem] overflow-y-auto border py-1 shadow-md focus:outline-none"
      @keydown="onListKeydown"
    >
      <li
        v-for="(opt, i) in OPTIONS"
        :id="optionId(i)"
        :key="opt.label"
        role="option"
        :aria-selected="opt.value === props.minutes"
        :class="[
          'flex min-h-[44px] cursor-pointer items-center px-3.5 text-sm',
          i === activeIndex ? 'bg-navy text-paper' : 'text-ink',
          opt.value !== null ? 'font-mono' : 'font-sans',
          opt.value === props.minutes ? 'font-semibold' : '',
        ]"
        @mousedown.prevent
        @mousemove="activeIndex = i"
        @click="selectIndex(i)"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>
