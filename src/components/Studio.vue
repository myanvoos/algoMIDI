<script setup lang="ts">
import Piano from "./piano/Piano.vue";
import MathsCanvas from "./maths/MathsCanvas.vue";
import {onUnmounted, ref} from 'vue';
import * as Tone from 'tone';
import {MidiEvent} from "../types/types";

import MIDIBrowser from "./MIDIBrowser.vue";

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
const isManual = ref<boolean>(false);
let midiUrl = ref<string>("");
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

  if (isManual.value) {
    await Tone.start();
    if (isPlaying.value) {
      Tone.getTransport().pause();
      isPlaying.value = false;
    } else {
      Tone.getTransport().start();
      isPlaying.value = true;
    }
  } else {
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
  }
};

const handleCellToggled = (payload: { noteId: string, isOn: boolean }) => {
  const { noteId, isOn } = payload;
  if (isOn) pressedKeys.value.add(noteId);
  else pressedKeys.value.delete(noteId);
  pressedKeys.value = new Set(pressedKeys.value);
  isManual.value = pressedKeys.value.size > 0;
};

const handleGridUpdated = (activeNotes: Set<string>) => {
  if (!samplerLoaded.value) return
  activeNotes.forEach((note) => grandPianoSampler.triggerAttackRelease(note, '1m'))
}

onUnmounted(() => {
  return () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    if (midiPart) {
      midiPart.dispose();
      midiPart = null;
    }
    midiUrl.value = '';
  };
});
</script>

<template>
  <MathsCanvas
    :pressedKeys="pressedKeys"
    @cellToggled="handleCellToggled"
    @gridUpdated="handleGridUpdated"
    :isPlaying="isPlaying"
    :isManual="isManual"
  />
  <Piano
      :pressed-keys="pressedKeys"
      @togglePlayPause="togglePlayPause"
      @midiParsed="handleMIDIParsed"
      :is-playing="isPlaying"
      :is-manual="isManual"
  />
  <MIDIBrowser :midi-url="midiUrl" @midiParsed="handleMIDIParsed" />
</template>

<style scoped>

</style>