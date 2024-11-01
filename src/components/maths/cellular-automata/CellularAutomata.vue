<script setup lang="ts">
import p5 from "p5";
import {Cell} from "../../../types/types.js";
import {watch} from "vue";
import {createNoteGrid} from "./musicalModes.ts";

const props = defineProps<{
  pressedKeys: Set<string>;
  isManual: boolean;
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  (e: 'cellToggled', payload: { noteId: string; isOn: boolean}): void
  (e: 'gridUpdated', activeNotes: Set<string>): void
  (e: 'gridIsClear'): void
}>()

const sketch = (p5: p5) => {
  let cellSize: number;
  let width: number = 500;
  let height: number = 500;

  let currentCells: Cell[][] = [];
  let nextCells: Cell[][] = [];

  const gridSize = 11

  const matrix = createNoteGrid('minor', 'C', gridSize)
  const columnCount = gridSize
  const rowCount = gridSize

  p5.setup = () => {
    p5.createCanvas(width, height).mouseClicked(handleMouseClick);
    p5.frameRate(3);
    p5.background("#233140");

    cellSize = Math.floor(width / columnCount);

    currentCells = deepCloneCells(matrix)
    nextCells = deepCloneCells(matrix)

    p5.noLoop();
  };

  p5.draw = () => {
    if (props.isPlaying && props.isManual) {
      updateCellularAutomata()
    }
    p5.background('#233140');
    drawGrid();
  }

  const drawGrid = () => {

    p5.stroke("slategray");
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(cellSize / 3); // Adjust text size relative to cell size

    for (let row = 0; row < rowCount; row++) {

      for (let column = 0; column < columnCount; column++) {
        const cell = currentCells[row][column];
        const currentColumn = column % columnCount;

        if (cell.isOn) {
          if (cell.isRightmostChild) p5.fill("lightskyblue")
          else p5.fill("#213547");
        } else {
          p5.fill(255);
        }

        p5.square(currentColumn * cellSize, row * cellSize, cellSize);

        if (cell.isOn) {
          if (cell.isRightmostChild) p5.fill("#213547")
          else p5.fill(255);
          p5.text(`${cell.note.id}`, currentColumn * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
        }

      }
    }
  };

  watch(
      () => props.isManual,
      (newVal) => {
        if (newVal) {
          // In manual mode, the grid updates via cellular automata
          if (props.isPlaying) {
            p5.loop();
          }
        } else {
          // In MIDI mode, stop the p5.js loop to prevent grid updates
          p5.noLoop();
        }
      }
  );

  watch(
      () => props.pressedKeys,
      (newPressedKeys) => {
        if (!props.isManual) {
          for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {
              const cell = currentCells[row][column];
              cell.isOn = newPressedKeys.has(cell.note.id);
            }
          }
        p5.redraw();
        }
      },
      { deep: true }
  );

  watch(
      () => props.isPlaying,
      (newVal) => {
        if (newVal) {
          p5.loop();
        } else {
          p5.noLoop();
        }
      }
  );

  const handleMouseClick = (): void => {
    if (!props.isPlaying) {
      const row = Math.floor(p5.mouseY / cellSize);
      if (row < 0 || row >= rowCount) return;

      let adjustedMouseX = p5.mouseX;
      if (adjustedMouseX < 0) adjustedMouseX += columnCount * cellSize;

      const column = Math.floor(adjustedMouseX / cellSize) % columnCount;
      if (column < 0 || column >= columnCount) return;

      currentCells[row][column].isOn = !currentCells[row][column].isOn;
      emit('cellToggled', {
        noteId: currentCells[row][column].note.id,
        isOn: currentCells[row][column].isOn,
      });
      p5.redraw();
    }
  }

  const updateCellularAutomata = () => {
    nextCells = deepCloneCells(currentCells);

    // reset
    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        nextCells[row][column].isRightmostChild = false;
      }
    }

    const rightmostNewAliveNotes: Map<
        number,
        { column: number; noteId: string }
    > = new Map();

    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        const neighbours = countNeighbours(row, column);

        const cellIsOn = currentCells[row][column].isOn;
        let newCellState = cellIsOn;

        if (cellIsOn && (neighbours < 2 || neighbours > 3)) {
          newCellState = false;
        } else if (!cellIsOn && neighbours === 3) {
          newCellState = true;
        }

        nextCells[row][column].isOn = newCellState;

        if (!cellIsOn && newCellState) {
          // If this row doesn't have a rightmost cell yet or current column is further right
          if (
              !rightmostNewAliveNotes.has(row) ||
              column > rightmostNewAliveNotes.get(row)!.column
          ) {
            rightmostNewAliveNotes.set(row, {
              column,
              noteId: currentCells[row][column].note.id,
            });
          }
        }
      }
    }

    for (const [row, { column }] of rightmostNewAliveNotes.entries()) {
      nextCells[row][column].isRightmostChild = true;
    }

    const temp = currentCells;
    currentCells = nextCells;
    nextCells = temp;

    // - activeNotes: notes that will be played by Tone.js, emitted to Studio.vue
    // Can change this to all alive notes or just new rightmost alive notes
    const activeNotes: Set<string> = new Set();
    for (const { noteId } of rightmostNewAliveNotes.values()) {
      activeNotes.add(noteId);
    }
    if (activeNotes.size === 0) emit('gridIsClear')
    if (props.isManual) emit('gridUpdated', activeNotes);

    // TODO: Exit conditions check
    p5.redraw();
  };

  const deepCloneCells = (cells: Cell[][]): Cell[][] => {
    return cells.map(row =>
        row.map(cell => ({
          note: {
            id: cell.note.id,
            baseNote: {
              key: cell.note.baseNote.key,
              isSharp: cell.note.baseNote.isSharp,
            },
            octave: cell.note.octave,
          },
          isOn: cell.isOn,
          isRightmostChild: cell.isRightmostChild || false
        }))
    );
  };


  const countNeighbours = (row: number, column: number): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      const neighborRow = (row + i + rowCount) % rowCount;
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const neighborCol = (column + j + columnCount) % columnCount;
        if (currentCells[neighborRow][neighborCol].isOn) {
          count++;
        }
      }
    }
    return count;
  };

};
</script>

<template>
  <P5 :sketch="sketch" />
</template>

<style scoped>
</style>
