<!-- Piano.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="rounded-lg shadow-xl p-6 w-fit">
      <PianoKeys :pressed-keys="pressedKeys" />

      <p class="mt-4 text-center text-gray-200">
        This virtual piano visualizes notes from a MIDI file input.
      </p>
      <div class="flex justify-between">
        <MIDIUpload @midiParsed="handleMIDIParsed" />
        <button @click="togglePlayPause" class="mt-4 bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-400 hover:outline-none hover:border-none transition-colors">
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import PianoKeys from "./PianoKeys.vue";
import MIDIUpload from "../MIDIUpload.vue";
import * as Tone from 'tone';
import {MidiEvent} from "../../types/types";

const samplerLoaded = ref(false);

const grandPianoSampler = new Tone.Sampler({
  urls: {
    'C4': 'C4.mp3',  // Tone.js will interpolate the rest of the notes
    'G4': 'G4.mp3',
    'C5': 'C5.mp3'
  },
  release: 1,
  baseUrl: "/samples/piano/",

  onload: () => {
    console.log("Sampler loaded successfully");
    samplerLoaded.value = true;
  }
}).toDestination();

const isPlaying = ref<boolean>(false);
const pressedKeys = ref<Set<string>>(new Set());
const midiEvents = ref<MidiEvent[]>([]);
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
      console.log(`Playing note: ${note}`);
    } catch (error) {
      console.error(`Error playing note ${note}:`, error);
    }
  }
};

const stopNote = (note: string): void => {
  if (samplerLoaded.value) {
    try {
      grandPianoSampler.triggerRelease(note);
      pressedKeys.value.delete(note);
      console.log(`Stopping note: ${note}`);
    } catch (error) {
      console.error(`Error stopping note ${note}:`, error);
    }
  }
};

const togglePlayPause = async (): Promise<void> => {
  if (!samplerLoaded.value) {
    console.warn('Sampler not loaded yet');
    return;
  }

  try {
    await Tone.start();

    Tone.getTransport().cancel();
    Tone.getTransport().stop();

    if (isPlaying.value) {
      // pause the transport if currently playing
      Tone.getTransport().pause();
      isPlaying.value = false;
    } else {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();

      if (midiPart) {
        midiPart.dispose();
        midiPart = null;
      }

      midiPart = new Tone.Part((time: number, event: MidiEvent) => {
        console.log(time);
        if (event.type === 'noteOn') {
          playNote(event.note);
        } else if (event.type === 'noteOff') {
          stopNote(event.note);
        }
      }, midiEvents.value).start(0);

      Tone.getTransport().bpm.value = 120;

      Tone.getTransport().start();
      isPlaying.value = true;
    }
  } catch (error) {
    console.error('Error playing MIDI:', error);
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


<style scoped>

</style>
