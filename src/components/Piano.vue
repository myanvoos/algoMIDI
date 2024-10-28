<!-- Piano.vue -->
<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">MIDI Piano</h1>

      <MIDIUpload @midiParsed="handleMIDIParsed" />

      <PianoKeys :pressed-keys="pressedKeys" :key-colors="keyColors" />

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
import {grandPianoSampler} from "../data/instrumentMapping.ts";

interface MidiEvent {
  time: number;
  note: string;
  type: 'noteOn' | 'noteOff';
  trackName: string;
  channel: number;
}

const keyColors = ref<{ [key: string]: string }>({});

const pressedKeys = ref<Set<string>>(new Set());

const midiEvents = ref<MidiEvent[]>([]);

const synths: { [key: string]: Tone.PolySynth } = {};

function getSynthForEvent(event: MidiEvent): Tone.PolySynth {
  const { trackName, channel } = event;

  if (!synths[trackName]) {
    let synth;
    if (channel === 9) {
      // Drum Kit
      synth = new Tone.PolySynth(Tone.MembraneSynth).toDestination();
    } else {
      // Grand Piano or other instruments
      synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }

    synth.set({
      oscillator: {
        type: channel === 9 ? 'square' : 'sine',
      },
      envelope: {
        attack: 0.0005,
        decay: 0.01,
        sustain: 0.35,
        release: 0.1,
      },
    });

    const masterGain = new Tone.Gain(0.8).toDestination();
    synth.connect(masterGain);

    synths[trackName] = synth;
  }

  return synths[trackName];
}

const playNote = (note: string, event: MidiEvent): void => {
  // const synth = getSynthForEvent(event);
  // synth.triggerAttack(note);

  Tone.loaded().then(() => {
    grandPianoSampler.triggerAttackRelease(note, 4);
  });

  pressedKeys.value.add(note);

  let colorClass = '';
  if (event.channel === 9) {
    colorClass = 'drum-active';
  } else {
    colorClass = 'piano-active';
  }
  keyColors.value[note] = colorClass;
};

const stopNote = (note: string, event: MidiEvent): void => {
  const synth = getSynthForEvent(event);
  synth.triggerRelease(note);

  pressedKeys.value.delete(note);
  delete keyColors.value[note];
};

const handleMIDIParsed = (events: MidiEvent[]): void => {
  midiEvents.value = events;
};

const play = async (): Promise<void> => {
  await Tone.start();

  Tone.getTransport().cancel();
  Tone.getTransport().stop();

  midiEvents.value.forEach((event) => {
    if (event.type === 'noteOn') {
      Tone.getTransport().scheduleOnce(() => {
        playNote(event.note, event);
      }, event.time);
    } else if (event.type === 'noteOff') {
      Tone.getTransport().scheduleOnce(() => {
        stopNote(event.note, event);
      }, event.time);
    }
  });

  Tone.getTransport().start();
};
</script>


<style scoped>

</style>
