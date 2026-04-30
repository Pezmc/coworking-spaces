<script setup lang="ts">
import AppIcon from './AppIcon.vue'

const GROUP_URL = 'https://labs.pez.io/leuven-social-groups/'
</script>

<template>
  <aside
    class="cw-callout border-rust bg-paper-deep relative mt-12 grid grid-cols-1 overflow-hidden border sm:grid-cols-[280px_1fr]"
    aria-label="Leuven coworking group invitation"
  >
    <span
      class="bg-rust text-paper font-sans absolute top-0 right-0 z-[2] px-2.5 py-1 text-[9.5px] font-medium tracking-[0.18em] uppercase"
    >
      A Note
    </span>
    <div class="cw-photo h-[140px] sm:h-full sm:min-h-[200px]" role="presentation" />
    <div class="flex flex-col justify-center gap-2 p-6 sm:px-8 sm:py-7">
      <span
        class="text-rust font-sans text-[10px] font-medium tracking-[0.18em] uppercase"
      >
        Leuven coworking group
      </span>
      <h3
        class="font-display text-navy m-0 text-2xl font-bold leading-[1.1] tracking-tight sm:text-[28px]"
      >
        Working from a café is good. <em class="font-normal italic">Working with people is better.</em>
      </h3>
      <p class="font-desc text-ink m-0 max-w-[460px] text-[15px] leading-relaxed">
        20+ freelancers, devs, and writers in Leuven meet up to co-work around the city. Free to
        join. No commitment, no Slack noise — just a calendar invite when someone picks a spot.
      </p>
      <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          :href="GROUP_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-rust text-paper hover:bg-rust-hover focus-visible:ring-rust border-rust hover:border-rust-hover font-sans inline-flex items-center gap-2 border px-4 py-2.5 text-[13.5px] font-medium tracking-[0.01em] no-underline transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          Join the group
          <AppIcon name="arrow-right" />
        </a>
        <span class="font-mono text-muted text-xs tracking-[0.04em]">
          labs.pez.io/leuven-social-groups
        </span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.cw-photo {
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.25)),
    radial-gradient(ellipse at 30% 40%, #d4b88a 0%, #8a6a3e 50%, #3a2510 100%);
  position: relative;
}
</style>
