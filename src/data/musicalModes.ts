import { Cell } from "../types/types";

const baseNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SCALE_INTERVALS = {
    'major': [0, 2, 4, 5, 7, 9, 11],  // Major scale (Ionian mode)
    'minor': [0, 2, 3, 5, 7, 8, 10]  , // Natural minor scale (Aeolian mode)
};

export function createNoteGrid(scaleType: 'major' | 'minor' | 'chromatic', rootNote: string = 'C', gridSize: number = 12): Cell[][] {
    const grid: Cell[][] = [];

    const rootIndex = baseNotes.findIndex(note => note === rootNote);
    if (rootIndex === -1) throw new Error('Invalid root note');

    const intervals = SCALE_INTERVALS[scaleType];
    const scaleNotes = intervals.map(interval => baseNotes[(rootIndex + interval) % 12]);

    for (let row = 0; row < gridSize; row++) {
        const gridRow: Cell[] = [];

        for (let col = 0; col < gridSize; col++) {
            const note: string = scaleNotes[(row + col) % scaleNotes.length];
            const octave = 3 + Math.floor((row + col) / scaleNotes.length)
            gridRow.push({
                note: {
                    id: `${note}${octave}`,
                    baseNote: {
                        key: note,
                        isSharp: note.includes('#')
                    },
                    octave
                },
                isOn: false,
                isRightmostChild: false
            });
        }
        grid.push(gridRow);
    }
    return grid;
}
