<script setup lang="ts">
import Piano from "./piano/Piano.vue";
import MathsCanvas from "./maths/MathsCanvas.vue";
import {onMounted, ref} from 'vue';
import * as Tone from 'tone';
import {MidiEvent} from "../types/types";

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

// Use Set instead of Array for storing pressed keys, for O(1) lookup time.
// Certain conditions are satisfied:
// - The keys are unique values without duplication
// - The order of pressed keys is not important. Multiple pressed keys form a chord.
const pressedKeys = ref<Set<string>>(new Set());

const midiEvents = ref<MidiEvent[]>([]);
const isPlaying = ref<boolean>(false);
let midiPart: Tone.Part | null = null;

const handleMIDIParsed = (events: MidiEvent[]): void => {
  midiEvents.value = events;
  console.log("MIDI handled:", midiEvents.value);
};

const playNote = (note: string): void => {
  if (samplerLoaded.value) {
    try {
      grandPianoSampler.triggerAttack(note);
      pressedKeys.value.add(note);
      // console.log(`isPlaying note: ${note}`);
    } catch (error) {
      console.error(`Error isPlaying note ${note}:`, error);
    }
  }
};

const stopNote = (note: string): void => {
  if (samplerLoaded.value) {
    try {
      grandPianoSampler.triggerRelease(note);
      pressedKeys.value.delete(note);
      // console.log(`Stopping note: ${note}`);
    } catch (error) {
      console.error(`Error stopping note ${note}:`, error);
    }
  }
};

const stopAllNotes = (): void => {
  pressedKeys.value.forEach(note => stopNote(note));
  pressedKeys.value.clear();
};

const togglePlayPause = async (): Promise<void> => {
  if (!samplerLoaded.value) return;

  console.log("Toggling play/pause");

  try {
    await Tone.start();

    if (isPlaying.value) {
      Tone.getTransport().pause();
      isPlaying.value = false;
    } else {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();

      if (midiPart) {
        midiPart.dispose();
        midiPart = null;
      }

      midiPart = new Tone.Part((time, event: MidiEvent) => {
        if (event.type === 'noteOn') {
          playNote(event.note);
        } else if (event.type === 'noteOff') {
          stopNote(event.note);
        }
      }, midiEvents.value).start(0);

      Tone.getTransport().bpm.value = 120;

      const endTime = Math.max(...midiEvents.value.map(event => event.time));

      Tone.getTransport().scheduleOnce(() => {
        stopAllNotes();
        isPlaying.value = false;
      }, endTime);

      Tone.getTransport().start();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error('Error toggling play/pause:', error);
  }
};

onMounted(() => {
  return () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    if (midiPart) {
      midiPart.dispose();
      midiPart = null;
    }
  };
});
</script>

<template>
  <MathsCanvas
    :pressedKeys="pressedKeys"
  />
  <Piano
      :handle-m-i-d-i-parsed="handleMIDIParsed"
      :pressed-keys="pressedKeys"
      :toggle-play-pause="togglePlayPause"
      :is-playing="isPlaying"
  />
</template>

<style scoped>

</style>