import {computed, ref} from "vue";
import {createNoteGrid} from "../data/musicalModes.ts";
import {Cell} from "../types/types";

interface AutomataConfig {
    gridSize: number
    scale: string
    rootNote: string
}

export function useCellularAutomata(config: AutomataConfig): AutomataConfig {
    const currentCells = ref<Cell[][]>(createNoteGrid(config.scale, config.rootNote, config.gridSize))
    const nextCells = ref<Cell[][]>([])

    const rowCount = computed(() => currentCells.value.length)
    const columnCount = computed(() => currentCells.value[0].length)

    const updateAutomata = () => {
        nextCells.value = deepCloneCells(currentCells.value)
        clearRightmostFlags(nextCells.value)

        const rightmostNewAliveNotes = findNewAliveNotes()
        updateCellStates()
        markRightmostCelss(rightmostNewAliveNotes)

        [currentCells.value, nextCells.value] = [nextCells.value, currentCells.value]
        return getActiveNotes(rightmostNewAliveNotes)
    }
    const deepCloneCells = (cells: Cell[][]): Cell[][] => {
        return cells.map(row => row.map(cell => ({ ...cell })));
    };
    const clearRightmostFlags = (grid: Cell[][]): void => {
        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {
                grid[row][column].isRightmostChild = false;
            }
        }
    }
    const updateCellStates = (): void => {
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
            }
        }
    }
    const findNewAliveNotes = (): Map<number, { column: number; noteId: string }> => {
        const rightmostNewAliveNotes: Map<number, { column: number; noteId: string }> = new Map();
        for (let row = 0; row < rowCount; row++) {
            for (let column = 0; column < columnCount; column++) {
                const cellIsOn = currentCells[row][column].isOn;
                let newCellState = cellIsOn;

                if (cellIsOn && (neighbours < 2 || neighbours > 3)) {
                    newCellState = false;
                } else if (!cellIsOn && neighbours === 3) {
                    newCellState = true;
                }

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
        return rightmostNewAliveNotes
    }
    const markRightmostCells = (rightmostNewAliveNotes: Map<number, { column: number; noteId: string }>): void => {
        for (const [row, { column }] of rightmostNewAliveNotes.entries()) {
            nextCells[row][column].isRightmostChild = true;
        }
    }
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
    const getActiveNotes = (rightmostNewAliveNotes: Map<number, { column: number; noteId: string }>): Set<string> => {
        const activeNotes: Set<string> = new Set();
        for (const { noteId } of rightmostNewAliveNotes.values()) {
            activeNotes.add(noteId);
        }
        return activeNotes
    }
    return {
        currentCells,
        rowCount,
        columnCount,
        updateAutomata
    }
}