<script setup lang="ts">
import p5 from "p5"
import { Cell } from "../../../types/types.js";
import {watch} from "vue";

const props = defineProps<{
  pressedKeys: Set<string>
}>()

const sketch = (p5: p5) => {
  let cellSize: number;
  let width: number = 700;
  let height: number = 400;

  const octaves = [1, 2, 3, 4, 5, 6, 7];
  const baseNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

  let columnCount: number = baseNotes.length;
  let rowCount: number = octaves.length;
  let currentCells: Cell[][] = [];
  let nextCells: Cell[][] = [];

  p5.setup = () => {
    p5.createCanvas(width, height);
    p5.frameRate(10);
    p5.background("#233140");

    cellSize = Math.floor(width / columnCount);

    currentCells = initialiseStandardGrid();
    nextCells = initialiseStandardGrid();

    randomizeBoard();

    p5.noLoop();
    p5.describe("Grid of squares that switch between white and black, demonstrating a simulation of John Conway's Game of Life. When clicked, the simulation resets.");
  };

  p5.draw = () => {
    // generate(); - off for now

    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        let cell = currentCells[row][column];

        // if (!cell.isOn) p5.fill(255);
        // else p5.fill("#213547");

        if (props.pressedKeys.has(cell.note.id)) p5.fill("#213547")
        else p5.fill(255)

        p5.stroke("slategray");
        p5.rect(column * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  };

  watch(() => props.pressedKeys, () => {
    p5.redraw()
  }, { deep: true })

  // p5.mousePressed = () => {
  //   // TODO: Choose cell functionality
  //   randomizeBoard();
  //   p5.loop();
  // };

  function randomizeBoard() {
    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        currentCells[row][column].isOn = Math.random() < 0.5;
      }
    }
  }

  function generate() {
    nextCells = initialiseStandardGrid();

    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {

        let left = (column - 1 + columnCount) % columnCount;
        let right = (column + 1) % columnCount;
        let above = (row - 1 + rowCount) % rowCount;
        let below = (row + 1) % rowCount;

        let neighbours =
            (currentCells[above][left].isOn ? 1 : 0) +
            (currentCells[above][column].isOn ? 1 : 0) +
            (currentCells[above][right].isOn ? 1 : 0) +
            (currentCells[row][left].isOn ? 1 : 0) +
            (currentCells[row][right].isOn ? 1 : 0) +
            (currentCells[below][left].isOn ? 1 : 0) +
            (currentCells[below][column].isOn ? 1 : 0) +
            (currentCells[below][right].isOn ? 1 : 0);

        // TODO: Custom cellular automata rules
        const cellIsOn = currentCells[row][column].isOn;
        if (cellIsOn && (neighbours < 2 || neighbours > 3)) {
          nextCells[row][column].isOn = false;
        } else if (!cellIsOn && neighbours === 3) {
          nextCells[row][column].isOn = true;
        } else {
          nextCells[row][column].isOn = cellIsOn;
        }
      }
    }

    // Swap the current and next arrays for the next generation
    let temp = currentCells;
    currentCells = nextCells;
    nextCells = temp;
  }

  function initialiseStandardGrid(): Cell[][] {
    const grid: Cell[][] = [];

    for (let i = 0; i < octaves.length; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < baseNotes.length; j++) {
        const note = baseNotes[j];
        const octave = octaves[i];
        const id = `${note}${octave}`;

        row.push({
          note: { id, baseNote: note, octave },
          isOn: false,
        });
      }
      grid.push(row);
    }

    return grid;
  }
};
</script>

<template>
  <P5 :sketch="sketch" />
</template>

<style scoped>

</style>
