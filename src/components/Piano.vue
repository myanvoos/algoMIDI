<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">MIDI Piano</h1>

      <PianoKeys :pressed-keys="pressedKeys" />

      <p class="mt-4 text-center text-gray-600">
        This virtual piano visualizes notes from a MIDI file input.
      </p>
      <button @click="play">Play MIDI!</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PianoKeys from "./PianoKeys.vue";

const audioContext = new window.AudioContext();

const pressedKeys = ref<string[]>([]);

const noteToFrequency = (noteId: string): number => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseFreq = 440; // Frequency of A4
  const baseIndex = notes.indexOf('A');

  const regex = /^([A-G]#?)(\d+)$/; // extract note and octave
  const match = noteId.match(regex);
  if (!match) return baseFreq;

  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  const noteIndex = notes.indexOf(note);
  const semitones = (octave - 4) * 12 + noteIndex - baseIndex;

  return baseFreq * Math.pow(2, semitones / 12);
};

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
  oscillator.stop(audioContext.currentTime + 1);

  pressedKeys.value.push(noteId);

  setTimeout(() => {
    pressedKeys.value = pressedKeys.value.filter(key => key !== noteId);
  }, 1000); // 1 second
};


const simulateMidiInput = (): void => {
  const midiSequence: { noteId: string; delay: number }[] = [
    { noteId: 'C4', delay: 0 },
    { noteId: 'E4', delay: 500 },
    { noteId: 'G4', delay: 1000 },
    { noteId: 'C5', delay: 1500 },
    { noteId: 'E5', delay: 2000 },
    { noteId: 'G5', delay: 2500 },
  ];

  midiSequence.forEach(event => {
    setTimeout(() => {
      playNote(event.noteId);
    }, event.delay);
  });
};

const play = (): void => {
  simulateMidiInput();
}
</script>
