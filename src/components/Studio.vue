<script setup lang="ts">
import Piano from "./piano/Piano.vue"
import MathsCanvas from "./maths/MathsCanvas.vue"
import TrackView from "./tracks/TrackView.vue"
import {onUnmounted, ref, watch} from 'vue'
import {usePianoSampler} from "../composables/usePianoSampler"
import {useTransport} from "../composables/useTransport";
import { Track } from "../types/types"
import * as Tone from "tone"


const { sampler, samplerLoaded, samplerError } = usePianoSampler()
const { isPlaying, transportError, togglePlayPause, cleanup } = useTransport()

// NOTE:
// Use Set instead of Array for storing pressed keys, for O(1) lookup time.
// Certain conditions are satisfied:
// - The keys are unique values without duplication
// - The order of pressed keys is not important. Multiple pressed keys form a chord.

const track = ref<Track>({
  id: new Date().getTime().toString(),
  name: "Untitled Track",
  cells: [new Set<string>()],
  volume: 1
})

const tracks = ref<Track[]>([])

const pressedKeys = ref<Set<string>>(new Set())

const playbackTempo = ref(180)

watch(pressedKeys, (newPresssedKeys) => {
  if (isPlaying.value || track.value.cells.length === 0) {
    const newSet = new Set(newPresssedKeys)
    track.value.cells.push(newSet)
    console.log("Updated track:", track.value)
  }
})

const handleCellToggled = (payload: { noteId: string, isOn: boolean }) => {
  if (payload.isOn) pressedKeys.value.add(payload.noteId)
  else pressedKeys.value.delete(payload.noteId)
  pressedKeys.value = new Set(pressedKeys.value)
};

const handleGridUpdated = (activeNotes: Set<string>) => {
  if (!samplerLoaded.value) return
  try {
    activeNotes.forEach((note) => sampler.triggerAttackRelease(note, '4n'))
    pressedKeys.value = activeNotes
  } catch (err) {
    console.error("Error playing notes:", err)
  }
}

const handleGridIsClear = () => {
  isPlaying.value = false
  pressedKeys.value.clear()
  tracks.value.push(track.value)
}

const updatePlaybackTempo = (value: number) => {
  playbackTempo.value = value
  togglePlayPause()
  initialiseTransport()
  togglePlayPause()
  console.log("Updated playback tempo:", playbackTempo.value)
}

const initialiseTransport = () => {
  Tone.getTransport().stop()
  Tone.getTransport().bpm.value = playbackTempo.value
  Tone.getTransport().start()
}

onUnmounted(cleanup)

initialiseTransport()
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
        <TrackView 
          :tracks="tracks" 
          :playback-tempo="playbackTempo"
        />
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