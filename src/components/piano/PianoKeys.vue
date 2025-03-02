<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note"
import { computed } from "vue"
import { generateFullKeyboard } from "../../composables/useKeyboardGenerator"

const props = defineProps<{
	pressedKeys: { ca: Set<Note>; graph: Set<Note> }
}>()

const aggregatedPressedKeys = computed(() => {
	return new Set([...props.pressedKeys.ca, ...props.pressedKeys.graph])
})

const fullKeyboard = generateFullKeyboard()
const whiteKeys = computed(() =>
	fullKeyboard.filter((note) => !note.name.includes("#")),
)
const blackKeys = computed(() =>
	fullKeyboard.filter((note) => note.name.includes("#")),
)

const isNotePressed = (note: Note): boolean => {
	return Array.from(aggregatedPressedKeys.value).some(
		(pressedNote) => pressedNote.name === note.name,
	)
}

const getPressedNote = (note: Note): Note | undefined => {
	return Array.from(aggregatedPressedKeys.value).find(
		(pressedNote) => pressedNote.name === note.name,
	)
}

const getBlackKeyPosition = (index: number): number => {
	const blackKeyPattern = ["C#", "D#", "F#", "G#", "A#"]

	const totalWhiteKeys = whiteKeys.value.length
	const whiteKeyWidth = 100 / totalWhiteKeys // This is percentage width

	let blackKeyCount = 0
	let position = 0

	for (let i = 0; i < whiteKeys.value.length; i++) {
		position = i * whiteKeyWidth
		const currentWhite = whiteKeys.value[i].name.slice(0, -1) // Remove octave number

		if (blackKeyPattern.includes(`${currentWhite}#`)) {
			if (blackKeyCount === index) {
				return position + whiteKeyWidth * 0.7
			}
			blackKeyCount++
		}
	}

	return 0
}

const getKeyOpacity = (note: Note): number => {
	const pressedNote = getPressedNote(note)
	const velocity = pressedNote?.velocity ?? note.velocity
	return velocity * 0.8 + 0.2
}

const isNotePressedByCa = (note: Note): boolean => {
	return Array.from(props.pressedKeys.ca).some(
		(pressedNote) => pressedNote.name === note.name,
	)
}

const isNotePressedByGraph = (note: Note): boolean => {
	return Array.from(props.pressedKeys.graph).some(
		(pressedNote) => pressedNote.name === note.name,
	)
}
</script>

<template>
  <div class="piano">
    <div
        v-for="(note, index) in whiteKeys"
        :key="note.name + index"
        :class="[
          'white-key',
          {
            'active-ca': isNotePressedByCa(note),
            'active-graph': isNotePressedByGraph(note)
          }
        ]"
        :style="{
          opacity: isNotePressed(note) ? getKeyOpacity(note) : 1
        }"
    ></div>

    <div
        v-for="(note, index) in blackKeys"
        :key="note.name + index"
        :class="[
          'black-key',
          {
            'active-ca': isNotePressedByCa(note),
            'active-graph': isNotePressedByGraph(note)
          }
        ]"
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
  width: 100%;
  min-width: 320px;
  height: 120px;
  background-color: #fff;
  border: 1px solid #213547;
  box-sizing: border-box;
  
  @media (min-width: 768px) {
    width: 1100px;
    height: 200px;
  }
}

.white-key {
  flex: 1;
  border: 1px solid slategray;
  background-color: #fff;
  position: relative;
  box-sizing: border-box;
  transition: all 0.1s;
}

.white-key.active-ca {
  background-color: lightskyblue;
  transition: background-color 0.1s ease-in-out, opacity 0.1s ease-in-out;
}

.white-key.active-graph {
  background-color: lightpink;
  transition: background-color 0.1s ease-in-out, opacity 0.1s ease-in-out;
}

.black-key {
  position: absolute;
  width: 2.5%;
  height: 60%;
  background-color: #213547;
  border: 1px solid #213547;
  border-radius: 0 0 3px 3px;
  transition: all 0.1s;
  z-index: 2;

  @media (min-width: 768px) {
    width: 1.65%;
  }
}

.black-key.active-ca {
  background-color: lightblue;
  transition: background-color 0.1s ease-in-out, opacity 0.1s ease-in-out;
}

.black-key.active-graph {
  background-color: pink;
  transition: background-color 0.1s ease-in-out, opacity 0.1s ease-in-out;
}
</style>