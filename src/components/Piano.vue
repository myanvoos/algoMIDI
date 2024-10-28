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
import {onMounted, ref} from 'vue';
import PianoKeys from "./PianoKeys.vue";
import MIDIUpload from "./MIDIUpload.vue";
import * as Tone from 'tone';
const samplerLoaded = ref(false);

interface MidiEvent {
  time: number;
  note: string;
  type: 'noteOn' | 'noteOff';
  trackName: string;
  channel: number;
}

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

const keyColors = ref<{ [key: string]: string }>({});

const pressedKeys = ref<Set<string>>(new Set());

const midiEvents = ref<MidiEvent[]>([]);

const handleMIDIParsed = (events: MidiEvent[]): void => {
  midiEvents.value = events;
  console.log("MIDI handled:", midiEvents.value);
};

const playNote = (note: string): void => {
  if (samplerLoaded.value) {
    try {
      grandPianoSampler.triggerAttack(note);
      pressedKeys.value.add(note);
      keyColors.value[note] = 'piano-active';
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
      delete keyColors.value[note];
      console.log(`Stopping note: ${note}`);
    } catch (error) {
      console.error(`Error stopping note ${note}:`, error);
    }
  }
};

const play = async (): Promise<void> => {
  if (!samplerLoaded.value) {
    console.warn('Sampler not loaded yet');
    return;
  }

  try {
    await Tone.start();

    Tone.getTransport().cancel();
    Tone.getTransport().stop();

    midiEvents.value.forEach((event) => {
      Tone.getTransport().schedule(() => {
        if (event.type === 'noteOn') {
          playNote(event.note);
        } else if (event.type === 'noteOff') {
          stopNote(event.note);
        }
      }, event.time);
    });

    Tone.getTransport().start();
  } catch (error) {
    console.error('Error playing MIDI:', error);
  }
};


// Clean up when component is unmounted
onMounted(() => {
  return () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    grandPianoSampler.dispose();
  };
});
</script>


<style scoped>

</style>
