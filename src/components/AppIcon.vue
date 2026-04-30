<script setup lang="ts">
interface Props {
  name: string
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), { size: 'md' })
</script>

<template>
  <svg class="icon" :class="{ 'icon-sm': size === 'sm' }" aria-hidden="true" focusable="false">
    <use :href="'#i-' + name" />
  </svg>
</template>

<style>
.icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: -2px;
  stroke-width: 1.6;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}
.icon-sm {
  width: 12px;
  height: 12px;
  vertical-align: -1.5px;
}
</style>
