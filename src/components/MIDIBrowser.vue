<!-- MIDIBrowser.vue -->
<template>

</template>

<script setup lang="ts">
import { Midi } from '@tonejs/midi';
import {MidiEvent} from "../types/types";
import {watch} from "vue";

const emitEvent = defineEmits<{
  (e: 'midiParsed', events: MidiEvent[]): void;
}>();

console.log("here")

const props = defineProps<{
  midiUrl: string
}>();

watch(() => props.midiUrl, () => handleURLChange(props.midiUrl) );

const handleURLChange = async (url: string): Promise<void> => {
  try {
    const midi = await Midi.fromUrl(url)

    console.log("Extracted MIDI from URL:", midi)

    const midiEvents: MidiEvent[] = [];

    midi.tracks.forEach(track => {
      const trackName = track.name || `Track ${midi.tracks.indexOf(track)}`;
      const channel = track.channel;

      track.notes.forEach(note => {

        midiEvents.push({
          time: note.time,
          note: note.name,
          type: 'noteOn',
          trackName,
          channel
        });

        midiEvents.push({
          time: note.time + note.duration,
          note: note.name,
          type: 'noteOff',
          trackName,
          channel
        });
      });
    });

    midiEvents.sort((a, b) => a.time - b.time);

    console.log("Emitting MIDI events:", midiEvents);
    emitEvent('midiParsed', midiEvents);
  } catch (error) {
    console.error('Error parsing MIDI file:', error);
    alert('Failed to parse MIDI file. Please ensure it is a valid MIDI file.');
  }

}

</script>

<style scoped>

</style>
