<!-- Piano.vue -->
<template>
  <div class="flex items-center justify-center p-4">
    <div class="rounded-lg shadow-xl p-6 w-fit">
      <PianoKeys :pressed-keys="props.pressedKeys" />

      <p class="mt-4 text-center text-gray-200">
        This virtual piano visualizes notes from a MIDI file input.
      </p>
      <div class="flex justify-between">

        <!-- NOTE: MIDIUpload emits the MIDI parsed event, so we need an upwards data flow with @ not : -->
        <MIDIUpload v-if="!props.isManual" @midiParsed="props.handleMIDIParsed" />

        <button @click="props.togglePlayPause" class="mt-4 bg-slate-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition-colors">
          {{ props.isPlaying ? 'Pause' : 'Play' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PianoKeys from "./PianoKeys.vue";
import MIDIUpload from "../MIDIUpload.vue";
import { MidiEvent } from "../../types/types";

const props = defineProps<{
  pressedKeys: Set<string>;
  togglePlayPause: () => void;
  handleMIDIParsed: (events: MidiEvent[]) => void;
  isPlaying: boolean;
  isManual: boolean;
}>();
</script>

<style scoped>

</style>
