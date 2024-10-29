<script setup lang="ts">
import p5 from "p5";
import { Cell } from "../../../types/types.js";
import { watch } from "vue";

const props = defineProps<{
  pressedKeys: Set<string>;
}>();

const offsetShift = 3; // Dynamic variable to control the shift amount

const sketch = (p5: p5) => {
  let cellSize: number;
  let width: number = 700;
  let height: number = 400;

  const octaves = [1, 2, 3, 4, 5, 6, 7];
  const baseNotes = ["A#", "A", "B#", "B", "C", "D#", "D", "E#", "E", "F", "G#", "G"];
  const columnCount: number = baseNotes.length;
  const rowCount: number = octaves.length;
  let prevCells: Cell[][] = [];
  let currentCells: Cell[][] = [];
  let nextCells: Cell[][] = [];

  p5.setup = () => {
    p5.createCanvas(width, height);
    p5.frameRate(10);
    p5.background("#233140");

    cellSize = Math.floor(width / columnCount);

    currentCells = initialiseStandardGrid();
    nextCells = initialiseStandardGrid();
    prevCells = initialiseStandardGrid();

    p5.noLoop();
    p5.describe("Grid with each row shifted to the right by offsetShift cells.");
  };

  p5.draw = () => {
    p5.background("#233140");

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

        p5.rect(shiftedColumn * cellSize, row * cellSize, cellSize, cellSize);

        if (cell.isOn) {
          p5.fill(255);
          p5.text(`${cell.note.id}`, shiftedColumn * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
        }

      }
    }
  };


  watch(
      () => props.pressedKeys,
      () => {
        prevCells = copyGrid(currentCells);

        for (let row = 0; row < rowCount; row++) {
          for (let column = 0; column < columnCount; column++) {
            const cell = currentCells[row][column];
            cell.isOn = props.pressedKeys.has(cell.note.id);
          }
        }

        p5.redraw();
      },
      { deep: true }
  );

  function initialiseStandardGrid(): Cell[][] {
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
};
</script>

<template>
  <P5 :sketch="sketch" />
</template>

<style scoped>
</style>
