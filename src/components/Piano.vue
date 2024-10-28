<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
      <h1 class="text-3xl font-bold text-center mb-6">MIDI Piano</h1>
      <div class="mb-4 flex justify-between items-center">
        <button @click="changeOctave(-1)" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Octave Down
        </button>
        <span class="text-xl font-semibold">Octave: {{ currentOctave }}</span>
        <button @click="changeOctave(1)" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          Octave Up
        </button>
      </div>
      <div class="relative h-64 bg-gray-200 rounded-lg overflow-hidden" @mouseup="stopNote" @mouseleave="stopNote">
        <div v-for="note in notes" :key="note.key"
             :class="['absolute', note.isSharp ? 'bg-gray-800 h-2/3 w-10 z-10' : 'bg-white h-full w-16',
                      'border border-gray-300 rounded-b-lg transition-colors duration-100',
                      pressedKeys.includes(note.key) ? (note.isSharp ? 'bg-gray-600' : 'bg-gray-200') : '']"
             :style="{ left: `${note.position}%` }"
             @mousedown="playNote(note.key)"
             @mouseenter="(e) => e.buttons === 1 && playNote(note.key)">
        </div>
      </div>
      <p class="mt-4 text-center text-gray-600">
        Use your mouse or keyboard (A-K and W-U) to play. Z and X to change octaves.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const notes = [
  { key: 'C', isSharp: false, position: 0 },
  { key: 'C#', isSharp: true, position: 7 },
  { key: 'D', isSharp: false, position: 14 },
  { key: 'D#', isSharp: true, position: 21 },
  { key: 'E', isSharp: false, position: 28 },
  { key: 'F', isSharp: false, position: 42 },
  { key: 'F#', isSharp: true, position: 49 },
  { key: 'G', isSharp: false, position: 56 },
  { key: 'G#', isSharp: true, position: 63 },
  { key: 'A', isSharp: false, position: 70 },
  { key: 'A#', isSharp: true, position: 77 },
  { key: 'B', isSharp: false, position: 84 }
];

const currentOctave = ref(4);
const pressedKeys = ref([]);

const keyToNote = {
  'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
  't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B', 'k': 'C'
};

const playNote = (note) => {
  const frequency = noteToFrequency(note, currentOctave.value);
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

  pressedKeys.value.push(note);
};

const stopNote = (note) => {
  if (note) {
    pressedKeys.value = pressedKeys.value.filter(key => key !== note);
  } else {
    pressedKeys.value = [];
  }
};

const noteToFrequency = (note, octave) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseFreq = 440; // A4 frequency
  const baseNote = notes.indexOf('A');
  const baseOctave = 4;

  const noteIndex = notes.indexOf(note);
  const semitones = (octave - baseOctave) * 12 + noteIndex - baseNote;

  return baseFreq * Math.pow(2, semitones / 12);
};

const changeOctave = (delta) => {
  currentOctave.value = Math.max(0, Math.min(8, currentOctave.value + delta));
};

const handleKeyDown = (event) => {
  if (event.repeat) return;
  if (event.key === 'z') changeOctave(-1);
  if (event.key === 'x') changeOctave(1);
  const note = keyToNote[event.key.toLowerCase()];
  if (note) playNote(note);
};

const handleKeyUp = (event) => {
  const note = keyToNote[event.key.toLowerCase()];
  if (note) stopNote(note);
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>