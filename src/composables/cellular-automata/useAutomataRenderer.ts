import type { Note } from "@tonejs/midi/dist/Note"
import type p5 from "p5"
import { type Ref, computed, watch } from "vue"
import type { AutomataConfig, Cell } from "./useAutomata"

export interface AutomataState {
	cellSize: number
	currentCells: Cell[][]
	rowCount: number
	columnCount: number
	isPlaying: boolean
}

interface AutomataRendererConfig {
	automataConfig: Ref<AutomataConfig>
	automataState: Ref<AutomataState>
	callbacks: {
		onCellToggled: (payload: { note: Note; isOn: boolean }) => void
		onGridUpdated: () => void
		onGridIsClear: () => void
	}
}

export const useAutomataRenderer = (config: AutomataRendererConfig) => {
	const calculateCellSize = (p5: p5) => {
		const smallestDimension = Math.min(p5.width, p5.height)
		config.automataState.value.cellSize = Math.floor(
			smallestDimension / config.automataConfig.value.gridSize,
		)
	}

	const drawGrid = (p5: p5) => {
		if (config.automataState.value.cellSize === 0) {
			calculateCellSize(p5)
		}

		p5.stroke("slategray")
		p5.textAlign(p5.CENTER, p5.CENTER)
		p5.textSize(config.automataState.value.cellSize / 3)

		config.automataState.value.currentCells.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				const currentColumn = colIndex % config.automataState.value.columnCount

				if (cell.isOn)
					p5.fill(cell.isRightmostChild ? "lightskyblue" : "#213547")
				else p5.fill(255)

				p5.square(
					currentColumn * config.automataState.value.cellSize,
					rowIndex * config.automataState.value.cellSize,
					config.automataState.value.cellSize,
				)

				if (cell.isOn) {
					if (cell.isRightmostChild) p5.fill("#213547")
					else p5.fill(255)
					p5.text(
						`${cell.note.name}`,
						currentColumn * config.automataState.value.cellSize +
							config.automataState.value.cellSize / 2,
						rowIndex * config.automataState.value.cellSize +
							config.automataState.value.cellSize / 2,
					)
				}
			})
		})
	}

	const handleMouseClick = (p5: p5) => {
		if (!config.automataState.value.isPlaying) {
			const row = Math.floor(p5.mouseY / config.automataState.value.cellSize)
			if (row < 0 || row >= config.automataState.value.rowCount) return

			let adjustedMouseX = p5.mouseX
			if (adjustedMouseX < 0)
				adjustedMouseX +=
					config.automataState.value.columnCount *
					config.automataState.value.cellSize
			const column =
				Math.floor(adjustedMouseX / config.automataState.value.cellSize) %
				config.automataState.value.columnCount

			if (column < 0 || column >= config.automataState.value.columnCount) return
			const cell = config.automataState.value.currentCells[row][column]
			cell.isOn = !cell.isOn
			config.callbacks.onCellToggled({
				note: cell.note,
				isOn: cell.isOn,
			})
			p5.redraw()
		}
	}

	const updateGrid = () => {
		if (config.automataState.value.isPlaying) {
			config.callbacks.onGridUpdated()
		}
	}

	const clearGridDisplay = (p5: p5) => {
		p5.background(255)
		drawGrid(p5)
	}

	return {
		drawGrid,
		handleMouseClick,
		updateGrid,
		clearGridDisplay,
	}
}
