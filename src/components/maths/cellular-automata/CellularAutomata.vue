<script setup>
import p5 from "p5"

const sketch = (p5) => {
  let cellSize;
  let width = 500
  let height = 500

  let columnCount = 17
  let rowCount = 17
  let currentCells = []
  let nextCells = []

  p5.setup = () => {
    p5.createCanvas(width, height)
    p5.frameRate(10)
    p5.background("#233140")

    cellSize = Math.floor(width / columnCount )

    for (let column = 0; column < columnCount; column++) {
      currentCells[column] = []
    }
    for (let column = 0; column < columnCount; column++) {
      nextCells[column] = []
    }
    p5.noLoop()
    p5.describe("Grid of squares that switch between white and black, demonstrating a simulation of John Conway's Game of Life. When clicked, the simulation resets." )

  }
  p5.draw = () => {
    generate()
    for (let column = 0; column < columnCount; column++) {
      for (let row = 0; row < rowCount; row++) {

        let cell = currentCells[column][row]

        p5.fill((1 - cell) * 255)
        p5.stroke(0)
        p5.rect(column * cellSize, row * cellSize, cellSize, cellSize)
      }
    }
  }
  p5.mousePressed = () => {
    randomiseBoard()
    p5.loop()
  }
  function randomiseBoard() {
    for (let column = 0; column < columnCount; column++) {
      for (let row = 0; row < rowCount; row++) {
        currentCells[column][row] = Math.round(Math.random())
      }
    }
  }

  function generate() {
    for (let column = 0; column < columnCount; column++) {
      for (let row = 0; row < rowCount; row++) {
        // Column left of current cell
        // if column is at left edge, use modulus to wrap to right edge
        let left = (column - 1 + columnCount) % columnCount;

        // Column right of current cell
        // if column is at right edge, use modulus to wrap to left edge
        let right = (column + 1) % columnCount;

        // Row above current cell
        // if row is at top edge, use modulus to wrap to bottom edge
        let above = (row - 1 + rowCount) % rowCount;

        // Row below current cell
        // if row is at bottom edge, use modulus to wrap to top edge
        let below = (row + 1) % rowCount;

        // Count living neighbors surrounding current cell
        let neighbours =
            currentCells[left][above] +
            currentCells[column][above] +
            currentCells[right][above] +
            currentCells[left][row] +
            currentCells[right][row] +
            currentCells[left][below] +
            currentCells[column][below] +
            currentCells[right][below];

        // Rules of Life
        // 1. Any live cell with fewer than two live neighbours dies
        // 2. Any live cell with more than three live neighbours dies
        if (neighbours < 2 || neighbours > 3) {
          nextCells[column][row] = 0;
          // 4. Any dead cell with exactly three live neighbours will come to life.
        } else if (neighbours === 3) {
          nextCells[column][row] = 1;
          // 3. Any live cell with two or three live neighbours lives, unchanged, to the next generation.
        } else nextCells[column][row] = currentCells[column][row];
      }
    }

    // Swap the current and next arrays for next generation
    let temp = currentCells;
    currentCells = nextCells;
    nextCells = temp;
  }
}

</script>
<template>
  <P5 :sketch="sketch" />
</template>

<style scoped>

</style>