<template>
  <div class="midi-upload">
    <input
        type="file"
        accept=".mid,.midi"
        @change="handleFileUpload"
        class="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
    />
  </div>
</template>

<script setup lang="ts">
import { Midi } from '@tonejs/midi'

const emitEvent = defineEmits<{
  (e: 'midiParsed', events: { time: number; note: string; type: 'noteOn' | 'noteOff' }[]): void;
}>();

const handleFileUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  console.log("File uploaded:", file);
  const reader = new FileReader();

  reader.onload = async (e) => {
    const arrayBuffer = e.target?.result;
    if (arrayBuffer && typeof arrayBuffer !== 'string') {
      try {
        const midi = new Midi(arrayBuffer as ArrayBuffer);
        console.log("Parsed MIDI:", midi);

        const midiEvents: { time: number; note: string; type: 'noteOn' | 'noteOff' }[] = [];

        midi.tracks.forEach(track => {
          track.notes.forEach(note => {
            midiEvents.push({
              time: note.time * 1000, // convert to ms
              note: note.name,
              type: note.velocity > 0 ? 'noteOn' : 'noteOff',
            });
          });
        });

        midiEvents.sort((a, b) => a.time - b.time); // sort by time

        // emit parsed MIDI events
        emitEvent('midiParsed', midiEvents);
      } catch (error) {
        console.error('Error parsing MIDI file:', error);
        alert('Failed to parse MIDI file. Please ensure it is a valid MIDI file.');
      }
    }
  };

  reader.readAsArrayBuffer(file);
};
</script>

<style scoped>
.midi-upload {
  margin-top: 1rem;
}
</style>
