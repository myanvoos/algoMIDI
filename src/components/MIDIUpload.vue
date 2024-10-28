<!-- MIDIUpload.vue -->
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
import { Midi } from '@tonejs/midi';

interface MidiEvent {
  time: number;
  note: string;
  type: 'noteOn' | 'noteOff';
}


const emitEvent = defineEmits<{
  (e: 'midiParsed', events: MidiEvent[]): void;
}>();

function adjustNoteOctave(noteName: string, octaveShift: number): string {
  const regex = /^([A-G]#?)(-?\d+)$/;
  const match = noteName.match(regex);
  if (!match) {
    return noteName;
  }
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10) + octaveShift;
  return `${note}${octave}`;
}

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

        const midiEvents: MidiEvent[] = [];

        midi.tracks.forEach(track => {
          track.notes.forEach(note => {
            const adjustedNoteName = adjustNoteOctave(note.name, 0);

            midiEvents.push({
              time: note.time,
              note: adjustedNoteName,
              type: 'noteOn',
            });

            midiEvents.push({
              time: note.time + note.duration,
              note: adjustedNoteName,
              type: 'noteOff',
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
  };

  reader.readAsArrayBuffer(file);
};
</script>

<style scoped>
.midi-upload {
  margin-top: 1rem;
}
</style>
