import { Cell } from "../../../types/types";

const BASE_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
// const BASE_NOTES = ["B", "C", "C#", "D", "F", "F#", "G", "G#", "A", "A#", "B"];

// Major and minor scale intervals
const SCALE_INTERVALS = {
    'major': [0, 2, 4, 5, 7, 9, 11],  // Major scale (Ionian mode)
    'minor': [0, 2, 3, 5, 7, 8, 10]   // Natural minor scale (Aeolian mode)
};

export function createNoteGrid(scaleType: 'major' | 'minor', rootNote: string = 'C', gridSize: number = 12): Cell[][] {
    const grid: Cell[][] = [];

    const rootIndex = BASE_NOTES.findIndex(note => note === rootNote);
    if (rootIndex === -1) throw new Error('Invalid root note');

    const intervals = SCALE_INTERVALS[scaleType];
    const scaleNotes = intervals.map(interval => BASE_NOTES[(rootIndex + interval) % 12]);

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
                isOn: false
            });
        }

        grid.push(gridRow);
    }

    return grid;
}

export function getChordNotes(root: string, chordType: 'major' | 'minor' | 'diminished' | 'augmented'): string[] {
    const rootIndex = BASE_NOTES.findIndex(note => note === root);
    if (rootIndex === -1) throw new Error('Invalid root note');

    const intervals = {
        'major': [0, 4, 7],        // Root, major third, perfect fifth
        'minor': [0, 3, 7],        // Root, minor third, perfect fifth
        'diminished': [0, 3, 6],   // Root, minor third, diminished fifth
        'augmented': [0, 4, 8]     // Root, major third, augmented fifth
    }[chordType];

    return intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return BASE_NOTES[noteIndex];
    });
}
