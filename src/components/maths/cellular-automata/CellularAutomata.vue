<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import p5 from 'p5'
import { useP5Canvas } from '../../../composables/useP5Canvas'
import { useCellularAutomata } from '../../../composables/useCellularAutomata'
import {AutomataConfig, P5CanvasConfig} from "../../../types/types"

const props = defineProps<{
  pressedKeys: Set<string>
  isPlaying: boolean
}>()

const emit = defineEmits<{
  (e: 'cellToggled', payload: { noteId: string; isOn: boolean }): void
  (e: 'gridUpdated', activeNotes: Set<string>): void
  (e: 'gridIsClear'): void
}>()

const automataConfig: AutomataConfig = ref<AutomataConfig>({
  gridSize: 11,
  scale: 'minor',
  rootNote: 'C',
})

const {
  currentCells,
  rowCount,
  columnCount,
  updateAutomata,
} = useCellularAutomata(automataConfig.value)

const cellSize = ref(0)
const canvasConfig: P5CanvasConfig = ref<P5CanvasConfig>({
  width: 500,
  height: 500,
  frameRate: 3,
  backgroundColour: '#233140'
})
const canvasContainer = ref<HTMLElement | null>(null)

const onCellToggled = (payload: { noteId: string; isOn: boolean }) => emit('cellToggled', payload)

const sketch = (p5: p5) => {
  p5.setup = () => {
    p5.createCanvas(canvasConfig.value.width, canvasConfig.value.height)
        .parent(canvasContainer.value!)
        .mouseClicked(handleMouseClick)
    p5.frameRate(canvasConfig.value.frameRate)
    p5.background(canvasConfig.value.backgroundColour)
    cellSize.value = Math.floor(canvasConfig.value.width / columnCount.value)
    p5.noLoop()
  }
  p5.draw = () => {
    p5.background(canvasConfig.value.backgroundColour)
    if (props.isPlaying) {
      const activeNotes = updateAutomata()
      if (activeNotes.size === 0) emit('gridIsClear')
      emit('gridUpdated', activeNotes)
    }
    drawGrid()
  }
  const drawGrid = () => {
    p5.stroke('slategray')
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.textSize(cellSize.value / 3)

    currentCells.value.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const currentColumn = colIndex % columnCount.value

        if (cell.isOn) p5.fill(cell.isRightmostChild ? 'lightskyblue' : '#213547')
        else p5.fill(255)

        p5.square(
            currentColumn * cellSize.value,
            rowIndex * cellSize.value,
            cellSize.value
        )

        if (cell.isOn) {
          p5.fill(cell.isRightmostChild ? '#213547' : 255)
          p5.text(
              `${cell.note.id}`,
              currentColumn * cellSize.value + cellSize.value / 2,
              rowIndex * cellSize.value + cellSize.value / 2
          )
        }
      })
    })
  }
  
  const handleMouseClick = () => {
    if (!props.isPlaying) {
      const row = Math.floor(p5.mouseY / cellSize.value)
      if (row < 0 || row >= rowCount.value) return
      
      let adjustedMouseX = p5.mouseX
      if (adjustedMouseX < 0)
        adjustedMouseX += columnCount.value * cellSize.value
      const column =
          Math.floor(adjustedMouseX / cellSize.value) % columnCount.value
      
      if (column < 0 || column >= columnCount.value) return
      const cell = currentCells.value[row][column]
      cell.isOn = !cell.isOn
      onCellToggled({
        noteId: cell.note.id,
        isOn: cell.isOn,
      })
      p5.redraw()
    }
  }
}
const { p5Instance, initCanvas } = useP5Canvas()

onMounted(() => initCanvas(sketch, canvasContainer.value))

watch(() => props.isPlaying,
    (newVal) => {
      if (p5Instance.value) {
        if (newVal) p5Instance.value.loop()
        else p5Instance.value.noLoop()
      }
    }
)
</script>
<template>
  <div ref="canvasContainer"></div>
</template>
