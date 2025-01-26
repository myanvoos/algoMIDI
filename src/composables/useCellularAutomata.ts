import { ref, computed, watch } from 'vue'
import { Note } from '@tonejs/midi/dist/Note'
import * as Tone from 'tone'
import { Header } from '@tonejs/midi'

interface AutomataConfig {
    gridSize: number;
    scale: "major" | "minor" | "chromatic";
    rootNote: string;
    rules: string;
}

interface Cell {
    note: Note;
    isOn: boolean;
    isRightmostChild: boolean;
}

export const useCellularAutomata = (config: AutomataConfig) => {
    const baseNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    
    const SCALE_INTERVALS = {
        'major': [0, 2, 4, 5, 7, 9, 11],  // Major scale (Ionian mode)
        'minor': [0, 2, 3, 5, 7, 8, 10],  // Natural minor scale (Aeolian mode)
        'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    };
    
    const createNoteGrid = (config: AutomataConfig): Cell[][] => {
        const grid: Cell[][] = [];
    
        const rootIndex = baseNotes.findIndex(note => note === config.rootNote);
        if (rootIndex === -1) throw new Error('Invalid root note');
    
        const intervals = SCALE_INTERVALS[config.scale];
        const scaleNotes = intervals.map(interval => baseNotes[(rootIndex + interval) % 12]);
    
        for (let row = 0; row < config.gridSize; row++) {
            const gridRow: Cell[] = [];
    
            for (let col = 0; col < config.gridSize; col++) {
                const noteName = scaleNotes[(row + col) % scaleNotes.length];
                const octave = 3 + Math.floor((row + col) / scaleNotes.length);
                const noteId = `${noteName}${octave}`;
                
                // velocity between 0.3 and 0.8 for more musical dynamics
                const velocity = 0.3 + Math.random() * 0.8;
    
                const note = new Note({
                    midi: Tone.Frequency(noteId).toMidi(),
                    velocity: velocity,  
                    ticks: 0
                }, {
                    ticks: Tone.Time('4n').toTicks(),
                    velocity: velocity * 0.8  // release velocity slightly lower for softer release
                }, new Header());
    
                gridRow.push({
                    note,
                    isOn: false,
                    isRightmostChild: false
                });
            }
            grid.push(gridRow);
        }
        return grid;
    }
    
    const currentCells = ref<Cell[][]>(createNoteGrid(config))
    const nextCells = ref<Cell[][]>([])

    const rowCount = computed(() => currentCells.value.length)
    const columnCount = computed(() => currentCells.value[0].length)

    const parseRules = (rules: string): { born: number[]; survive: number[] } => {
        const [born, survive] = rules.split('/')
        return {
            born: born.slice(1).split(',').map(Number),
            survive: survive.slice(1).split(',').map(Number)
        }
    }

    const rules = ref(config.rules)
    const parsedRules = ref(parseRules(rules.value))

    watch(config, (newConfig) => {
        parsedRules.value = parseRules(newConfig.rules)
    })

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
        rightmostNewAliveNotes: Map<number, { column: number; note: Note }>
    ): void => {
        for (const [row, { column }] of rightmostNewAliveNotes.entries()) {
            nextCells.value[row][column].isRightmostChild = true
        }
    }

    const getActiveNotes = (
        rightmostNewAliveNotes: Map<number, { column: number; note: Note }>
    ): Set<Note> => {
        const activeNotes: Set<Note> = new Set()
        for (const { note } of rightmostNewAliveNotes.values()) {
            activeNotes.add(note)
        }
        return activeNotes
    }

    const updateAutomata = () => {
        nextCells.value = deepCloneCells(currentCells.value)
        clearRightmostFlags(nextCells.value)

        const rightmostNewAliveNotes = new Map<
            number,
            { column: number; note: Note }
        >()

        for (let row = 0; row < rowCount.value; row++) {
            for (let column = 0; column < columnCount.value; column++) {
                const neighbours = countNeighbours(row, column)
                const cellIsOn = currentCells.value[row][column].isOn
                let newCellState = cellIsOn

                if (cellIsOn) {
                    newCellState = parsedRules.value.survive.includes(neighbours)
                } else {
                    newCellState = parsedRules.value.born.includes(neighbours)
                }

                nextCells.value[row][column].isOn = newCellState

                if (!cellIsOn && newCellState) {
                    if (
                        !rightmostNewAliveNotes.has(row) ||
                        column > rightmostNewAliveNotes.get(row)!.column
                    ) {
                        rightmostNewAliveNotes.set(row, {
                            column,
                            note: nextCells.value[row][column].note,
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
