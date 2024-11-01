// types/types.ts

import {ref} from "vue";

export interface AutomataConfig {
    gridSize: number;
    scale: "major" | "minor" | "chromatic";
    rootNote: string;
}

export interface P5CanvasConfig {
    width: number
    height: number
    frameRate: number
    backgroundColour: string
}

export interface P5CanvasOptions {
    currentCells: ref<Cell[][]>
    rowCount: ref<number>
    columnCount: ref<number>
    onCellToggled: (payload: { noteId: string; isOn: boolean}) => void
}

// Note with octave
export interface Note {
    id: string; // i.e. C4, D#5
    baseNote: {
        key: string;
        isSharp?: boolean;
    }
}

export interface Cell {
    note: Note;
    isOn: boolean;
    isRightmostChild: boolean;
}

export type MusicMode =
    | 'IONIAN'
    | 'DORIAN'
    | 'PHRYGIAN'
    | 'LYDIAN'
    | 'MIXOLYDIAN'
    | 'AEOLIAN'
    | 'LOCRIAN'
    | 'CHROMATIC';