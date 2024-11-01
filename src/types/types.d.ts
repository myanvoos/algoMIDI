// types/types.ts

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