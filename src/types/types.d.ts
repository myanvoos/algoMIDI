export interface MidiEvent {
    time: number;
    note: string;
    type: 'noteOn' | 'noteOff';
    trackName?: string;
    channel?: number;
}

// Note with octave
export interface Note {
    id: string; // i.e. C4, D#5
    baseNote: BaseNote;
    octave: number;
}

// Note without octave
export interface BaseNote {
    key: string;
    isSharp?: boolean;
}

export interface Cell {
    note: Note;
    isOn: boolean;
}