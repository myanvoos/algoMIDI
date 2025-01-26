<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note";
import { computed } from "vue";
import { generateFullKeyboard } from "../../composables/useKeyboardGenerator";

const props = defineProps<{
	pressedKeys: Set<Note>;
}>();

const fullKeyboard = generateFullKeyboard();
const whiteKeys = computed(() =>
	fullKeyboard.filter((note) => !note.name.includes("#")),
);
const blackKeys = computed(() =>
	fullKeyboard.filter((note) => note.name.includes("#")),
);

const isNotePressed = (note: Note): boolean => {
	return Array.from(props.pressedKeys).some(
		(pressedNote) => pressedNote.name === note.name,
	);
};

const getPressedNote = (note: Note): Note | undefined => {
	return Array.from(props.pressedKeys).find(
		(pressedNote) => pressedNote.name === note.name,
	);
};

const getBlackKeyPosition = (index: number): number => {
	const blackKeyPattern = ["C#", "D#", "F#", "G#", "A#"];

	const totalWhiteKeys = whiteKeys.value.length;
	const whiteKeyWidth = 100 / totalWhiteKeys; // This is percentage width

	let blackKeyCount = 0;
	let position = 0;

	for (let i = 0; i < whiteKeys.value.length; i++) {
		position = i * whiteKeyWidth;
		const currentWhite = whiteKeys.value[i].name.slice(0, -1); // Remove octave number

		if (blackKeyPattern.includes(`${currentWhite}#`)) {
			if (blackKeyCount === index) {
				return position + whiteKeyWidth * 0.7;
			}
			blackKeyCount++;
		}
	}

	return 0;
};

const getKeyOpacity = (note: Note): number => {
	const pressedNote = getPressedNote(note);
	const velocity = pressedNote?.velocity ?? note.velocity;
	return velocity * 0.8 + 0.2;
};
</script>

<template>
  <div class="piano">
    <div
        v-for="(note, index) in whiteKeys"
        :key="note.name + index"
        :class="['white-key', isNotePressed(note) ? 'active' : '']"
        :style="{
          opacity: isNotePressed(note) ? getKeyOpacity(note) : 1
        }"
    ></div>

    <div
        v-for="(note, index) in blackKeys"
        :key="note.name + index"
        :class="['black-key', isNotePressed(note) ? 'active' : '']"
        :style="{
          left: `${getBlackKeyPosition(index)}%`,
          opacity: isNotePressed(note) ? getKeyOpacity(note) : 1
        }"
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
  transition: all 0.1s;
}

.white-key.active {
  background-color: lightskyblue;
  transition: background-color 0.1s ease-in-out, opacity 0.1s ease-in-out;
}

.black-key.active {
  background-color: lightblue;
  transition: background-color 0.1s ease-in-out, opacity 0.1s ease-in-out;
}

.black-key {
  position: absolute;
  width: 1.65%;
  height: 60%;
  background-color: #213547;
  border: 1px solid #213547;
  border-radius: 0 0 3px 3px;
  transition: all 0.1s;
  z-index: 2;
}
</style>