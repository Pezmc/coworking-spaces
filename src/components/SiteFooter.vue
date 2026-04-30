<script setup lang="ts">
import { NEW_SPACE_URL } from '../utils/issueUrl'

interface Props {
  totalSpaces: number
}

defineProps<Props>()

const REPO_URL = 'https://github.com/Pezmc/coworking-spaces'

// Last-updated stamp uses build time for now; could be wired to git later.
const lastUpdated = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
</script>

<template>
  <footer
    class="border-rule mt-14 flex flex-col items-baseline justify-between gap-2 border-t pt-7 pb-32 sm:flex-row sm:gap-6 sm:pb-24"
  >
    <p class="font-sans text-muted m-0 text-sm leading-relaxed">
      Know a good spot that's missing?
      <a
        :href="NEW_SPACE_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="text-ink hover:text-rust focus-visible:ring-rust border-rust border-b pb-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Suggest a café
      </a>
      ·
      <a
        :href="REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="text-ink hover:text-rust focus-visible:ring-rust border-rust border-b pb-px focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Open source on GitHub
      </a>
    </p>
    <span class="font-mono text-faint text-[11px] tracking-[0.04em]">
      {{ totalSpaces }} cafés · last updated {{ lastUpdated.toLowerCase() }}
    </span>
  </footer>
</template>
