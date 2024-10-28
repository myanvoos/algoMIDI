<template>
  <div class="piano">
    <div v-for="node in fullKeyboard" :key="node.key">
    </div>
  </div>
</template>


<script setup lang="ts">
interface Note {
  key: string;
  isSharp: boolean;
  position: number;
}

export const fullKeyboard: Note[] = [
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
</script>

