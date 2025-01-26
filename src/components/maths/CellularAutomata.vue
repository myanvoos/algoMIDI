<script setup lang="ts">
import {ref, watch, onMounted, Ref} from 'vue'
import p5 from 'p5'
import { useP5Canvas } from '../../composables/useP5Canvas'
import { useCellularAutomata } from '../../composables/useCellularAutomata'
import {AutomataConfig, P5CanvasConfig} from "../../types/types"
import { Note } from "@tonejs/midi/dist/Note"

const props = defineProps<{
  pressedKeys: Set<Note>
  isPlaying: boolean
  cellularAutomataRules: string
  playbackTempo: number
}>()

const emit = defineEmits<{
  (e: 'cellToggled', payload: { note: Note; isOn: boolean }): void
  (e: 'gridUpdated', activeNotes: Set<Note>): void
  (e: 'gridIsClear'): void
}>()

const automataConfig: Ref<AutomataConfig> = ref<AutomataConfig>({
  gridSize: 11,
  scale: 'minor',
  rootNote: 'C',
  rules: props.cellularAutomataRules
})

watch(() => props.cellularAutomataRules, (newRules) => {
  automataConfig.value.rules = newRules
})

const {
  currentCells,
  rowCount,
  columnCount,
  updateAutomata,
} = useCellularAutomata(automataConfig.value)

const cellSize = ref(0)

/**
 * Specifies the canvas configuration
 * IMPORTANT: frameRate directly affects the tempo.
 * Frame rate of 3 => notes recorded every 1/3 second, equivalent to 180 bpm
 * as 60 bpm is 1/60 second per beat, or frame rate of 1.
 */
const canvasConfig: Ref<P5CanvasConfig> = ref<P5CanvasConfig>({
  width: 500,
  height: 500,
  frameRate: props.playbackTempo / 60, // needs to be 3 for 180bpm tempo sync with Tone.js
  backgroundColour: '#233140'
})

watch(() => props.playbackTempo, (newTempo) => {
  canvasConfig.value.frameRate = newTempo / 60
  if (p5Instance.value) {
    p5Instance.value.frameRate(canvasConfig.value.frameRate)
  }
})

const canvasContainer = ref<HTMLElement | null>(null)

const onCellToggled = (payload: { note: Note; isOn: boolean }) => {
  emit('cellToggled', payload)
}

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
          if (cell.isRightmostChild) p5.fill('#213547')
          else p5.fill(255)
          p5.text(
              `${cell.note.name}`,
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
        note: cell.note,
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
