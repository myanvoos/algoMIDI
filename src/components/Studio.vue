<script setup lang="ts">
import Piano from "./piano/Piano.vue"
import MathsCanvas from "./maths/MathsCanvas.vue"
import {onUnmounted, ref} from 'vue'
import {usePianoSampler} from "../composables/usePianoSampler.ts"
import {useTransport} from "../composables/useTransport.ts";

const { sampler, samplerLoaded, samplerError } = usePianoSampler()
const { isPlaying, transportError, togglePlayPause, cleanup } = useTransport()

// NOTE:
// Use Set instead of Array for storing pressed keys, for O(1) lookup time.
// Certain conditions are satisfied:
// - The keys are unique values without duplication
// - The order of pressed keys is not important. Multiple pressed keys form a chord.

const pressedKeys = ref<Set<string>>(new Set())

const handleCellToggled = (payload: { noteId: string, isOn: boolean }) => {
  if (payload.isOn) pressedKeys.value.add(payload.noteId)
  else pressedKeys.value.delete(payload.noteId)
  pressedKeys.value = new Set(pressedKeys.value)
};

const handleGridUpdated = (activeNotes: Set<string>) => {
  if (!samplerLoaded.value) return
  try {
    activeNotes.forEach((note) => sampler.triggerAttackRelease(note, '1m'))
    pressedKeys.value = activeNotes
  } catch (err) {
    console.error("Error playing notes:", err)
  }
}

const handleGridIsClear = () => {
  isPlaying.value = false
  pressedKeys.value.clear()
}

onUnmounted(cleanup)
</script>

<template>
  <div class="studio-container">
    <div v-if="samplerError || transportError" class="error-banner">
      Error: {{ samplerError?.message || transportError?.message }}
    </div>
    <div v-if="!samplerLoaded"  class="loading-banner">
      Loading sound samples...
    </div>
  </div>

  <MathsCanvas
    :pressedKeys="pressedKeys"
    @cellToggled="handleCellToggled"
    @gridUpdated="handleGridUpdated"
    @gridIsClear="handleGridIsClear"
    :isPlaying="isPlaying"
  />
  <Piano
      :pressed-keys="pressedKeys"
      :is-playing="isPlaying"
      @toggle-play-pause="togglePlayPause"
  />
</template>

<style scoped>
.studio-container {
  @apply min-w-[1200px] flex flex-col items-center gap-3
}
.error-banner {
  @apply w-full bg-slate-500 text-slate-100 p-4 text-center rounded
}
.loading-banner {
  @apply w-full bg-blue-100 text-blue-700 p-4 text-center rounded mb-3
}
</style>