<script setup lang="ts">
import Piano from "./piano/Piano.vue";
import MathsCanvas from "./maths/MathsCanvas.vue";
import {computed, onUnmounted, ref} from 'vue';
import * as Tone from 'tone';

const samplerLoaded = ref(false);

const grandPianoSampler = new Tone.Sampler({
  urls: {
    'C4': 'C4.mp3',  // Tone.js will interpolate the rest of the notes
    'G4': 'G4.mp3',
    'C5': 'C5.mp3'
  },
  release: 1,
  baseUrl: "/samples/piano/", // Using base grand piano sampler for now
  onload: () => {
    console.log("Sampler loaded successfully");
    samplerLoaded.value = true;
  }
}).toDestination();

// NOTE:
// Use Set instead of Array for storing pressed keys, for O(1) lookup time.
// Certain conditions are satisfied:
// - The keys are unique values without duplication
// - The order of pressed keys is not important. Multiple pressed keys form a chord.

const pressedKeys = ref<Set<string>>(new Set());
const isPlaying = ref<boolean>(false);

const togglePlayPause = async (): Promise<void> => {
  if (!samplerLoaded.value) return;
  console.log("Toggling play/pause");

  if (isPlaying.value) {
    Tone.getTransport().pause()
    isPlaying.value = false
  } else {
    await Tone.start();
    Tone.getTransport().start();
    isPlaying.value = true;
  }
};

const handleCellToggled = (payload: { noteId: string, isOn: boolean }) => {
  const { noteId, isOn } = payload;
  if (isOn) pressedKeys.value.add(noteId);
  else pressedKeys.value.delete(noteId);
  pressedKeys.value = new Set(pressedKeys.value);
};

const handleGridUpdated = (activeNotes: Set<string>) => {
  if (!samplerLoaded.value) return
  activeNotes.forEach((note) => grandPianoSampler.triggerAttackRelease(note, '1m'))
  pressedKeys.value = activeNotes
}

const handleGridIsClear = () => {
  isPlaying.value = false;
  pressedKeys.value.clear();
}

onUnmounted(() => {
  return () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  };
});
</script>

<template>
  <MathsCanvas
    :pressedKeys="pressedKeys"
    @cellToggled="handleCellToggled"
    @gridUpdated="handleGridUpdated"
    @gridIsClear="handleGridIsClear"
    :isPlaying="isPlaying"
  />
  <Piano
      :pressed-keys="pressedKeys"
      @togglePlayPause="togglePlayPause"
      :is-playing="isPlaying"
  />
</template>

<style scoped>

</style>