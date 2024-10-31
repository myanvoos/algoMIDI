<script setup lang="ts">
import p5 from "p5";
import {Cell} from "../../../types/types.js";
import {watch} from "vue";

const props = defineProps<{
  pressedKeys: Set<string>;
  isManual: boolean;
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  (e: 'cellToggled', payload: { noteId: string; isOn: boolean}): void
  (e: 'gridUpdated', activeNotes: Set<string>): void
}>()

const sketch = (p5: p5) => {
  let cellSize: number;
  let width: number = 700;
  let height: number = 400;

  const offsetShift = 3; // Dynamic variable to control the shift amount

  const octaves = [1, 2, 3, 4, 5, 6, 7];
  const baseNotes = ["A#", "A", "B#", "B", "C", "D#", "D", "E#", "E", "F", "G#", "G"];
  const columnCount: number = baseNotes.length;
  const rowCount: number = octaves.length;
  
  let prevCells: Cell[][] = [];
  let currentCells: Cell[][] = [];
  let nextCells: Cell[][] = [];

  p5.setup = () => {
    p5.createCanvas(width, height).mouseClicked(handleMouseClick);
    p5.frameRate(1);
    p5.background("#233140");

    cellSize = Math.floor(width / columnCount);

    currentCells = initialiseGrid();
    nextCells = initialiseGrid();
    prevCells = initialiseGrid();

    p5.noLoop();
  };

  p5.draw = () => {
    if (props.isPlaying && props.isManual) {
      updateCellularAutomata();
    }
    p5.background('#233140');
    drawGrid();
  }

  const drawGrid = () => {

    p5.stroke("slategray");
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(cellSize / 3); // Adjust text size relative to cell size

    for (let row = 0; row < rowCount; row++) {
      const rowOffset = (row * offsetShift) % columnCount;

      for (let column = 0; column < columnCount; column++) {
        const cell = currentCells[row][column];
        const prevCell = prevCells[row][column]
        const shiftedColumn = (column + rowOffset) % columnCount;

        if (cell.isOn) {
          p5.fill("#213547");
        } else if (prevCell.isOn) {
          prevCell.note.baseNote.isSharp ? p5.fill("lightblue") : p5.fill("lightskyblue")
        } else {
          p5.fill(255);
        }

        p5.square(shiftedColumn * cellSize, row * cellSize, cellSize);

        if (cell.isOn) {
          p5.fill(255);
          p5.text(`${cell.note.id}`, shiftedColumn * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
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
      () => {
        if (props.isPlaying) {
          prevCells = copyGrid(currentCells);

          for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {
              const cell = currentCells[row][column];
              cell.isOn = props.pressedKeys.has(cell.note.id);
            }
          }
        }
        p5.redraw();
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

  function handleMouseClick(): void {
    const row = Math.floor(p5.mouseY / cellSize);
    if (row < 0 || row >= rowCount) return;

    const rowOffset = (row * offsetShift) % columnCount;
    let adjustedMouseX = p5.mouseX - (rowOffset * cellSize);
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

  function initialiseGrid(): Cell[][] {
    const grid: Cell[][] = [];

    for (let i = 0; i < octaves.length; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < baseNotes.length; j++) {
        const note = baseNotes[j];
        const octave = octaves[i];
        const id = `${note}${octave}`;

        row.push({
          note: { id, baseNote: { key: note, isSharp: note.includes("#") }, octave },
          isOn: false,
        });
      }
      grid.push(row);
    }

    return grid;
  }
  function copyGrid(grid: Cell[][]): Cell[][] {
    return grid.map(row => row.map(cell => ({...cell, note: {...cell.note } })))
  }

  const updateCellularAutomata = () => {
    nextCells = initialiseGrid();
    const activeNotes: Set<string> = new Set<string>()
    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        const neighbours = countNeighbours(row, column)

        // TODO: Custom cellular automata rules
        const cellIsOn = currentCells[row][column].isOn;
        if (cellIsOn && (neighbours < 2 || neighbours > 3)) {
          nextCells[row][column].isOn = false;
        } else if (!cellIsOn && neighbours === 3) {
          nextCells[row][column].isOn = true;
        } else {
          nextCells[row][column].isOn = cellIsOn;
        }
        if (nextCells[row][column].isOn) activeNotes.add(nextCells[row][column].note.id)
      }
    }

    let temp = currentCells;
    currentCells = nextCells;
    nextCells = temp;
    if (props.isManual) emit('gridUpdated', activeNotes);
    p5.redraw();
  }

  const countNeighbours = (row: number, column: number): number => {
    let left = (column - 1 + columnCount) % columnCount;
    let right = (column + 1) % columnCount;
    let above = (row - 1 + rowCount) % rowCount;
    let below = (row + 1) % rowCount;

    return (currentCells[above][left].isOn ? 1 : 0) +
        (currentCells[above][column].isOn ? 1 : 0) +
        (currentCells[above][right].isOn ? 1 : 0) +
        (currentCells[row][left].isOn ? 1 : 0) +
        (currentCells[row][right].isOn ? 1 : 0) +
        (currentCells[below][left].isOn ? 1 : 0) +
        (currentCells[below][column].isOn ? 1 : 0) +
        (currentCells[below][right].isOn ? 1 : 0)
  }
};
</script>

<template>
  <P5 :sketch="sketch" />
</template>

<style scoped>
</style>
