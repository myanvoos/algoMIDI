<!-- Piano.vue -->
<template>
  <div class="flex items-center justify-center">
    <div class="rounded-lg shadow-xl p-6 w-fit">
      <PianoKeys :pressed-keys="props.pressedKeys" />

      <div class="flex justify-between">
        <!-- NOTE: MIDIUpload emits the MIDI parsed event, so we need an upwards data flow with @ not : -->
        <MIDIUpload v-if="!props.isManual" @midiParsed="handleMIDIParsed"/>

        <button @click="$emit('togglePlayPause')" class="mt-4 bg-slate-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition-colors">
          {{ props.isPlaying ? 'Pause' : 'Play' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PianoKeys from "./PianoKeys.vue";
import MIDIUpload from "../MIDIUpload.vue";
import {MidiEvent} from "../../types/types";

const props = defineProps<{
  pressedKeys: Set<string>;
  isPlaying: boolean;
  isManual: boolean;
}>();

const emit = defineEmits<{
  (e: 'togglePlayPause'): void;
  (e: 'midiParsed', events: MidiEvent[]): void;
}>()

const handleMIDIParsed = (events: MidiEvent[]) => {
  emit("midiParsed", events);
}
</script>

<style scoped>

</style>
