import { ref, computed } from 'vue'
import { createNoteGrid } from '../data/musicalModes'
import { Cell, AutomataConfig } from '../types/types'

export function useCellularAutomata(config: AutomataConfig) {
    const currentCells = ref<Cell[][]>(createNoteGrid(config))
    const nextCells = ref<Cell[][]>([])

    const rowCount = computed(() => currentCells.value.length)
    const columnCount = computed(() => currentCells.value[0].length)

    const deepCloneCells = (cells: Cell[][]): Cell[][] => {
        return cells.map((row) => row.map((cell) => ({ ...cell })))
    }

    const clearRightmostFlags = (grid: Cell[][]): void => {
        for (let row = 0; row < rowCount.value; row++) {
            for (let column = 0; column < columnCount.value; column++) {
                grid[row][column].isRightmostChild = false
            }
        }
    }

    const countNeighbours = (row: number, column: number): number => {
        let count = 0
        for (let i = -1; i <= 1; i++) {
            const neighborRow = (row + i + rowCount.value) % rowCount.value
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue
                const neighborCol = (column + j + columnCount.value) % columnCount.value
                if (currentCells.value[neighborRow][neighborCol].isOn) {
                    count++
                }
            }
        }
        return count
    }

    const markRightmostCells = (
        rightmostNewAliveNotes: Map<number, { column: number; noteId: string }>
    ): void => {
        for (const [row, { column }] of rightmostNewAliveNotes.entries()) {
            nextCells.value[row][column].isRightmostChild = true
        }
    }

    const getActiveNotes = (
        rightmostNewAliveNotes: Map<number, { column: number; noteId: string }>
    ): Set<string> => {
        const activeNotes: Set<string> = new Set()
        for (const { noteId } of rightmostNewAliveNotes.values()) {
            activeNotes.add(noteId)
        }
        return activeNotes
    }

    const updateAutomata = () => {
        nextCells.value = deepCloneCells(currentCells.value)
        clearRightmostFlags(nextCells.value)

        const rightmostNewAliveNotes = new Map<
            number,
            { column: number; noteId: string }
        >()

        for (let row = 0; row < rowCount.value; row++) {
            for (let column = 0; column < columnCount.value; column++) {
                const neighbours = countNeighbours(row, column)
                const cellIsOn = currentCells.value[row][column].isOn
                let newCellState = cellIsOn

                if (cellIsOn && (neighbours < 2 || neighbours > 3)) newCellState = false
                else if (!cellIsOn && neighbours === 3) newCellState = true

                nextCells.value[row][column].isOn = newCellState

                if (!cellIsOn && newCellState) {
                    if (
                        !rightmostNewAliveNotes.has(row) ||
                        column > rightmostNewAliveNotes.get(row)!.column
                    ) {
                        rightmostNewAliveNotes.set(row, {
                            column,
                            noteId: nextCells.value[row][column].note.id,
                        })
                    }
                }
            }
        }
        markRightmostCells(rightmostNewAliveNotes)
        currentCells.value = deepCloneCells(nextCells.value);
        return getActiveNotes(rightmostNewAliveNotes)
    }
    return {
        currentCells,
        rowCount,
        columnCount,
        updateAutomata,
        countNeighbours // for testing
    }
}
