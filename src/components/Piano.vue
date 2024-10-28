<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">MIDI Piano</h1>
      <div class="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
        <div
            v-for="note in fullKeyboard"
            :id="note.id"
            :class="['absolute',
                      note.baseNote.isSharp ? 'bg-gray-800 h-2/3 w-10 z-10' : 'bg-white h-full w-16',
                      'border border-gray-300 rounded-b-lg transition-colors duration-100',
                      pressedKeys.includes(note.baseNote.key) ? (note.baseNote.isSharp ? 'bg-gray-600' : 'bg-blue-100') : '']"
            :style="{ left: `${note.baseNote.position}%` }">
        </div>
      </div>
      <p class="mt-4 text-center text-gray-600">
        This virtual piano visualizes notes from a MIDI file input.
      </p>
      <button @click="play">Play MIDI!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fullKeyboard } from '../data/keyboardData.js';

const audioContext = new window.AudioContext();

const pressedKeys = ref<string[]>([]);

const playNote = (note: string): void => {
  const frequency = noteToFrequency(note);
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);

  pressedKeys.value = [...pressedKeys.value, note];
  setTimeout(() => stopNote(note), 500); // Auto-clear key after half a second
};

const stopNote = (note: string): void => {
    pressedKeys.value = pressedKeys.value.filter(key => key !== note);

};

const noteToFrequency = (note: string): number => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseFreq = 440; // A4 frequency
  const baseNote = notes.indexOf('A');

  const octave = 5 // DEBUG
  const baseOctave = 4;

  const noteIndex = notes.indexOf(note);
  const semitones = (octave - baseOctave) * 12 + noteIndex - baseNote;

  return baseFreq * Math.pow(2, semitones / 12);
};

const simulateMidiInput = (): void => {
  const midiSequence = ['C', 'D', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // DEBUG
  midiSequence.forEach((note, index) => {
    setTimeout(() => playNote(note), index * 600);
  })
}

const play = (): void => {
  simulateMidiInput();
}
</script>
