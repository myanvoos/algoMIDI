<!-- Piano.vue -->
<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">MIDI Piano</h1>

      <MIDIUpload @midiParsed="handleMIDIParsed" />

      <PianoKeys :pressed-keys="pressedKeys" />

      <p class="mt-4 text-center text-gray-600">
        This virtual piano visualizes notes from a MIDI file input.
      </p>

      <button @click="play" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        Play MIDI!
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PianoKeys from "./PianoKeys.vue";
import MIDIUpload from "./MIDIUpload.vue";
import * as Tone from 'tone';

const pressedKeys = ref<string[]>([]);

const midiEvents = ref<{ time: number; note: string; type: 'noteOn' | 'noteOff' }[]>([]);

const synth = new Tone.PolySynth(Tone.Synth).toDestination();
synth.set({
  oscillator: {
    type: 'sine', //  change to 'triangle', 'sawtooth', etc.
  },
  envelope: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.7,
    release: 0.1,
  },
});
const masterGain = new Tone.Gain(0.8).toDestination();
synth.connect(masterGain);

const playNote = (note: string): void => {
  console.log(`Playing note: ${note}`);
  synth.triggerAttack(note);

  if (!pressedKeys.value.includes(note)) {
    pressedKeys.value = [...pressedKeys.value, note];
  }
};

const stopNote = (noteId: string): void => {
  console.log(`Stopping note: ${noteId}`);
  synth.triggerRelease(noteId);

  pressedKeys.value = pressedKeys.value.filter(key => key !== noteId);
};

const handleMIDIParsed = (events: { time: number; note: string; type: 'noteOn' | 'noteOff' }[]): void => {
  midiEvents.value = events;
  console.log("MIDI handled:", midiEvents.value);
}

const play = async (): Promise<void> => {
  await Tone.start();

  Tone.getTransport().cancel();
  Tone.getTransport().stop();

  midiEvents.value.forEach(event => {
    if (event.type === 'noteOn') {
      Tone.getTransport().scheduleOnce(() => {
        playNote(event.note);
      }, event.time);
    } else if (event.type === 'noteOff') {
      Tone.getTransport().scheduleOnce(() => {
        stopNote(event.note);
      }, event.time);
    }
  });

  Tone.getTransport().start();
}
</script>

<style scoped>

</style>
