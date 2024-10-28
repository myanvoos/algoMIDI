<template>
  <div class="piano">
    <div
        v-for="note in whiteKeys"
        :key="note.id"
        :class="['white-key', pressedKeys.includes(note.id) ? 'active' : '']"
        :style="{ left: `${note.position}%`, width: `${note.baseNote.width}%` }"
    ></div>

    <div
        v-for="note in blackKeys"
        :key="note.id"
        :class="['black-key', pressedKeys.includes(note.id) ? 'active' : '']"
        :style="{ left: `${note.position}%`, width: `${note.baseNote.width}%` }"
    ></div>

  </div>
</template>

<script setup lang="ts">
import { fullKeyboard} from "../data/keyboardData.ts";
import {computed} from "vue";

defineProps<{
  pressedKeys: string[];
}>();

const whiteKeys = computed(() => fullKeyboard.filter(note => !note.baseNote.isSharp));
const blackKeys = computed(() => fullKeyboard.filter(note => note.baseNote.isSharp));
</script>

<style scoped>
.piano {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #fff;
}

.white-key {
  position: absolute;
  height: 100%;
  background-color: #fff;
  border: 1px solid #000;
  z-index: 1;
  box-sizing: border-box;
  transition: background-color 0.1s;
}

.black-key {
  position: absolute;
  height: 60%;
  background-color: #000;
  border: 1px solid #333;
  z-index: 2;
  box-sizing: border-box;
  margin-left: -2.5%;
  transition: background-color 0.1s;
}

.white-key.active {
  background-color: lightblue;
}

.black-key.active {
  background-color: #3b82f6;
}
</style>