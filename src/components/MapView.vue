<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import L from 'leaflet'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import { type ICoworkingSpace } from '../types/space'
import { slugify } from '../utils/slug'
import SpaceSummary from './SpaceSummary.vue'

// Build the custom rust pin icons synchronously so they're available
// on first marker render. divIcon HTML is styled via the global CSS
// in this component's <style> block.
const verifiedIcon = L.divIcon({
  className: 'cw-pin cw-pin--verified',
  html: '<span class="cw-pin-dot" aria-hidden="true"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
})

const unverifiedIcon = L.divIcon({
  className: 'cw-pin cw-pin--unverified',
  html: '<span class="cw-pin-dot" aria-hidden="true"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

interface Props {
  spaces: ICoworkingSpace[]
  allSpaces: ICoworkingSpace[]
}

const props = defineProps<Props>()

const mapRef = ref<InstanceType<typeof LMap> | null>(null)
const hasFittedBounds = ref(false)

const mapCenter = computed(() => {
  const validSpaces = props.allSpaces.filter((s) => s.coordinates)
  if (validSpaces.length === 0) {
    return [50.8798, 4.7005] as [number, number]
  }

  const avgLat = validSpaces.reduce((sum, s) => sum + s.coordinates!.lat, 0) / validSpaces.length
  const avgLng = validSpaces.reduce((sum, s) => sum + s.coordinates!.lng, 0) / validSpaces.length
  return [avgLat, avgLng] as [number, number]
})

const zoom = ref(14)

onMounted(() => {
  setTimeout(() => {
    if (mapRef.value && !hasFittedBounds.value) {
      const validSpaces = props.allSpaces.filter((s) => s.coordinates)
      if (validSpaces.length > 1) {
        const bounds: Array<[number, number]> = validSpaces.map(
          (s) => [s.coordinates!.lat, s.coordinates!.lng] as [number, number],
        )
        const map = mapRef.value as unknown as {
          leafletObject?: { fitBounds: (b: Array<[number, number]>, o: object) => void }
        }
        map.leafletObject?.fitBounds(bounds, { padding: [40, 40] })
        hasFittedBounds.value = true
      }
    }
  }, 100)
})

function getMarkerIcon(space: ICoworkingSpace) {
  return space.verified ? verifiedIcon : unverifiedIcon
}
</script>

<template>
  <div class="border-rule relative mt-3 h-[60vh] min-h-[500px] overflow-hidden border sm:h-[600px]">
    <LMap
      ref="mapRef"
      :zoom="zoom"
      :center="mapCenter"
      :use-global-leaflet="false"
      style="height: 100%; width: 100%"
    >
      <LTileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank" rel="noopener noreferrer">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        layer-type="base"
        name="Stamen Toner Lite"
      />

      <LMarker
        v-for="space in spaces.filter((s) => s.coordinates)"
        :key="slugify(space.name)"
        :lat-lng="[space.coordinates!.lat, space.coordinates!.lng]"
        :options="{ icon: getMarkerIcon(space) }"
      >
        <LPopup :options="{ maxWidth: 280, minWidth: 240, closeButton: true }">
          <div class="space-popup">
            <SpaceSummary :space="space" compact />
          </div>
        </LPopup>
      </LMarker>
    </LMap>

    <!-- Centrum stamp top-left -->
    <div
      class="bg-paper/90 border-rule text-muted absolute top-3 left-3 z-[400] border px-2 py-1 font-mono text-[10px] tracking-[0.06em] uppercase"
      aria-hidden="true"
    >
      Leuven
    </div>

    <div
      v-if="spaces.filter((s) => s.coordinates).length === 0"
      class="bg-paper/90 absolute inset-0 z-[500] flex items-center justify-center"
    >
      <p class="font-display text-navy text-xl italic">No spaces match.</p>
    </div>
  </div>
</template>

<style>
/* Custom Lucide-shaped Leaflet markers — global so they can target divIcon descendants */
.cw-pin {
  background: var(--color-rust);
  border: 2px solid var(--color-paper);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 120ms;
}
.cw-pin:hover {
  transform: scale(1.15);
}
.cw-pin--unverified {
  background: var(--color-paper);
  border-color: var(--color-rust);
  opacity: 0.85;
}
.cw-pin-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--color-paper);
  border-radius: 50%;
}
.cw-pin--unverified .cw-pin-dot {
  background: var(--color-rust);
  width: 5px;
  height: 5px;
}
@media (prefers-reduced-motion: reduce) {
  .cw-pin {
    transition: none;
  }
}

/* Popup chrome */
.leaflet-popup-content-wrapper {
  background: var(--color-paper);
  color: var(--color-ink);
  border: 1px solid var(--color-navy);
  border-radius: 0 !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
}
.leaflet-popup-content {
  margin: 14px 16px !important;
  font-family: inherit;
}
.leaflet-popup-tip {
  background: var(--color-paper);
  border: 1px solid var(--color-navy);
}
.leaflet-popup-close-button {
  color: var(--color-muted) !important;
  font-size: 18px !important;
  padding: 6px 8px !important;
}
.leaflet-popup-close-button:hover {
  color: var(--color-rust) !important;
}
.space-popup {
  font-family: inherit;
}
</style>
