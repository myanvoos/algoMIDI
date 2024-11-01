<script setup lang="ts">
import {fullKeyboard} from "../../data/keyboardData.ts";
import {computed} from "vue";

const props = defineProps<{
  pressedKeys: Set<string>;
}>();

const whiteKeys = computed(() => fullKeyboard.filter(note => !note.baseNote.isSharp));
const blackKeys = computed(() => fullKeyboard.filter(note => note.baseNote.isSharp));

const getBlackKeyPosition = (index: number): number => {
  const blackKeyPattern = ['C#', 'D#', 'F#', 'G#', 'A#'];

  const totalWhiteKeys = whiteKeys.value.length;
  const whiteKeyWidth = 100 / totalWhiteKeys; // This is percentage width

  let blackKeyCount = 0;
  let position = 0;

  for (let i = 0; i < whiteKeys.value.length; i++) {
    position = i * whiteKeyWidth;
    const currentWhite = whiteKeys.value[i].baseNote.key;

    if (blackKeyPattern.includes(`${currentWhite}#`)) {
      if (blackKeyCount === index) {
        return position + (whiteKeyWidth * 0.7);
      }
      blackKeyCount++;
    }
  }

  return 0;
}

</script>

<template>
  <div class="piano">
    <div
        v-for="(note, index) in whiteKeys"
        :key="index"
        :class="['white-key', props.pressedKeys.has(note.id) ? 'active' : '']"
    ></div>

    <div
        v-for="(note, index) in blackKeys"
        :key="index"
        :class="['black-key', props.pressedKeys.has(note.id) ? 'active' : '']"
        :style="{ left: `${getBlackKeyPosition(index)}%` }"
    ></div>

  </div>
</template>

<style scoped>
.piano {
  position: relative;
  display: flex;
  width: 1100px;
  height: 200px;
  background-color: #fff;
  border: 1px solid #213547;
  box-sizing: border-box;
}

.white-key {
  flex: 1;
  border: 1px solid slategray;
  background-color: #fff;
  position: relative;
  box-sizing: border-box;
  transition: background-color 0.1s;
}

.white-key.active {
  background-color: lightskyblue;
}

.black-key.active {
  background-color: lightblue;
}

.black-key {
  position: absolute;
  width: 1.65%; /* adjust */
  height: 60%;
  background-color: #213547;
  border: 1px solid #213547;
  border-radius: 0 0 3px 3px;
  transition: background-color 0.1s;
  z-index: 2;
}
</style>