<script setup lang="ts">
import Piano from "./piano/Piano.vue"
import MathsCanvas from "./maths/MathsCanvas.vue"
import TrackView from "./tracks/TrackView.vue"
import {onMounted, ref, watch} from 'vue'
import { Track as ToneTrack } from "@tonejs/midi"
import { useMIDIStore } from "../stores/midiStore"
import { useTrackControl } from "../composables/useTrackControl"
import { useTransport } from "../composables/useTransport"
import { usePianoSampler } from "../composables/usePianoSampler"

interface Track {
  id: string;
  track: ToneTrack;
}

const { addTrack } = useMIDIStore()
const { sampler, samplerError, samplerLoaded } = usePianoSampler()
const { pressedKeys, playbackTempo, handleCellToggled, handleGridUpdated, handleGridIsClear, updatePlaybackTempo } = useTrackControl({ sampler })
const { isPlaying, transportError, togglePlayPause, initialiseTransport } = useTransport({ playbackTempo: playbackTempo.value })

const tracks = ref<Track[]>([])

watch(tracks, async (newTracks) => {
  console.log("Adding track to store:", newTracks)
  await addTrack(newTracks[0].track)
})

onMounted(() => {
  initialiseTransport()
})

</script>

<template>
  <div class="studio-container">
    <div v-if="samplerError || transportError" class="error-banner">
      Error: {{ samplerError?.message || transportError?.message }}
    </div>
    <div v-if="!samplerLoaded"  class="loading-banner">
      Loading sound samples...
    </div>
    <div class="studio-layout">
      <div class="track-view-container">
        <TrackView />
      </div>
      <div class="piano-section">
        <MathsCanvas
          :pressed-keys="pressedKeys"
          @cellToggled="handleCellToggled"
          @gridUpdated="handleGridUpdated"
          @gridIsClear="handleGridIsClear"
          :is-playing="isPlaying"
          :playback-tempo="playbackTempo"
          @update:playback-tempo="updatePlaybackTempo"
        />
        <Piano
          :pressed-keys="pressedKeys"
          :is-playing="isPlaying"
          @toggle-play-pause="togglePlayPause"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.studio-container {
  @apply min-w-[1200px] flex flex-col w-full h-full;
}

.studio-layout {
  @apply flex w-full h-full gap-3;
}

.track-view-container {
  @apply w-1/3 min-w-[400px] h-full;
}

.piano-section {
  @apply flex-1 flex flex-col items-center justify-center;
}

.error-banner {
  @apply w-full bg-slate-500 text-slate-100 p-4 text-center rounded;
}

.loading-banner {
  @apply w-full bg-blue-100 text-blue-700 p-4 text-center rounded mb-3;
}
</style>