<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type L from 'leaflet'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  type ICoworkingSpace,
  NOISE_LEVEL_LABELS,
  WIFI_SPEED_LABELS,
  FOOD_LABELS,
  SEATING_LABELS,
} from '../types/space'
import { slugify } from '../utils/slug'

interface Props {
  spaces: ICoworkingSpace[] // Filtered spaces to show as markers
  allSpaces: ICoworkingSpace[] // All spaces for calculating bounds
  verifyUrl: string
}

const props = defineProps<Props>()

const mapRef = ref<InstanceType<typeof LMap> | null>(null)
const hasFittedBounds = ref(false)

// Calculate map center from ALL spaces (not filtered)
const mapCenter = computed(() => {
  const validSpaces = props.allSpaces.filter(s => s.coordinates)
  if (validSpaces.length === 0) {
    return [50.8798, 4.7005] as [number, number] // Leuven center
  }
  
  const avgLat = validSpaces.reduce((sum, s) => sum + s.coordinates!.lat, 0) / validSpaces.length
  const avgLng = validSpaces.reduce((sum, s) => sum + s.coordinates!.lng, 0) / validSpaces.length
  return [avgLat, avgLng] as [number, number]
})

const zoom = ref(14)

// Fit bounds ONCE on mount based on ALL spaces
onMounted(() => {
  // Small delay to ensure map is ready
  setTimeout(() => {
    if (mapRef.value && !hasFittedBounds.value) {
      const validSpaces = props.allSpaces.filter(s => s.coordinates)
      if (validSpaces.length > 1) {
        const bounds: Array<[number, number]> = validSpaces.map(s => [s.coordinates!.lat, s.coordinates!.lng] as [number, number])
        const map = mapRef.value as unknown as { leafletObject?: { fitBounds: (b: Array<[number, number]>, o: object) => void } }
        map.leafletObject?.fitBounds(bounds, { padding: [50, 50] })
        hasFittedBounds.value = true
      }
    }
  }, 100)
})

function getWifiColor(speed: string): string {
  switch (speed) {
    case 'fast': return '#22c55e'
    case 'medium': return '#eab308'
    case 'slow': return '#ef4444'
    default: return '#9ca3af'
  }
}

function getNoiseColor(level: string): string {
  switch (level) {
    case 'quiet': return '#22c55e'
    case 'medium': return '#eab308'
    case 'loud': return '#ef4444'
    default: return '#9ca3af'
  }
}

// Create custom icons for verified/unverified markers
const verifiedIcon = ref<L.Icon | null>(null)
const unverifiedIcon = ref<L.Icon | null>(null)

// Fix Leaflet default icon issue and create custom icons
onMounted(async () => {
  const L = await import('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
  
  // Create verified (default) icon
  verifiedIcon.value = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
  
  // Unverified icon uses a grey marker (via filter)
  unverifiedIcon.value = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'unverified-marker',
  })
})

function getMarkerIcon(space: ICoworkingSpace) {
  return space.verified ? verifiedIcon.value : unverifiedIcon.value
}
</script>

<template>
  <div class="map-container rounded-lg overflow-hidden border-2 border-[#e2d9c8]" style="height: 600px;">
    <LMap
      ref="mapRef"
      :zoom="zoom"
      :center="mapCenter"
      :use-global-leaflet="false"
      style="height: 100%; width: 100%;"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        layer-type="base"
        name="OpenStreetMap"
      />
      
      <LMarker
        v-for="space in spaces.filter(s => s.coordinates)"
        :key="slugify(space.name)"
        :lat-lng="[space.coordinates!.lat, space.coordinates!.lng]"
        :options="getMarkerIcon(space) ? { icon: getMarkerIcon(space) } : {}"
      >
        <LPopup :options="{ maxWidth: 300, minWidth: 250 }">
          <div class="space-popup">
            <h3 class="font-bold text-lg text-[#1a365d] m-0 mb-1">
              {{ space.name }}
            </h3>
            <p class="text-sm text-[#718096] m-0 mb-3">
              {{ space.address }}
            </p>
            
            <!-- Quick tags -->
            <div class="flex flex-wrap gap-1.5 mb-3">
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :style="{ backgroundColor: getWifiColor(space.wifiSpeed) + '20', color: getWifiColor(space.wifiSpeed) }"
              >
                📶 {{ WIFI_SPEED_LABELS[space.wifiSpeed] }}
              </span>
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :style="{ backgroundColor: getNoiseColor(space.noiseLevel) + '20', color: getNoiseColor(space.noiseLevel) }"
              >
                🔊 {{ NOISE_LEVEL_LABELS[space.noiseLevel] }}
              </span>
              <span class="px-2 py-0.5 text-xs font-medium rounded bg-[#f5f0e6] text-[#1a365d]">
                🪑 {{ SEATING_LABELS[space.seatingType] }}
              </span>
              <span
                v-if="space.hasAC === 'yes'"
                class="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700"
              >
                ❄️ AC
              </span>
              <span
                v-if="space.foodAndDrinkAvailability !== 'none'"
                class="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-700"
              >
                🍽️ {{ FOOD_LABELS[space.foodAndDrinkAvailability] }}
              </span>
            </div>
            
            <!-- Description -->
            <p v-if="space.description" class="text-sm text-[#4a5568] m-0 mb-3 italic">
              "{{ space.description }}"
            </p>
            
            <!-- Unverified notice -->
            <div
              v-if="!space.verified"
              class="mb-3 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800"
            >
              ⚠️ Unverified
              <a
                :href="verifyUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-[#ed8936] hover:underline ml-1"
              >
                Help verify →
              </a>
            </div>
            
            <!-- Actions -->
            <a
              :href="space.googleMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block px-3 py-1.5 text-xs font-semibold text-white bg-[#1a365d] rounded hover:bg-[#2d4a7c] transition-colors no-underline"
            >
              📍 Open in Google Maps
            </a>
          </div>
        </LPopup>
      </LMarker>
    </LMap>
    
    <!-- No results message -->
    <div
      v-if="spaces.filter(s => s.coordinates).length === 0"
      class="absolute inset-0 flex items-center justify-center bg-[#f5f0e6]/90"
    >
      <p class="text-lg text-[#718096]">No spaces match your filters</p>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
}

/* Override Leaflet popup styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

:deep(.leaflet-popup-content) {
  margin: 12px 14px;
}

:deep(.leaflet-popup-close-button) {
  color: #718096;
  font-size: 20px;
  padding: 8px;
}

.space-popup {
  font-family: inherit;
}

/* Unverified marker styling - more transparent/faded */
:deep(.unverified-marker) {
  opacity: 0.5;
  filter: grayscale(50%);
}
</style>

