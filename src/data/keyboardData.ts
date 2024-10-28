
// Note with octave
export interface Note {
  id: string; // i.e. C4, D#5
  baseNote: BaseNote;
  octave: number;
}

// Note without octave
interface BaseNote {
  key: string;
  isSharp: boolean;
}

export const baseNotes: BaseNote[] = [
  { key: 'C', isSharp: false },
  { key: 'C#', isSharp: true },
  { key: 'D', isSharp: false },
  { key: 'D#', isSharp: true },
  { key: 'E', isSharp: false },
  { key: 'F', isSharp: false },
  { key: 'F#', isSharp: true },
  { key: 'G', isSharp: false },
  { key: 'G#', isSharp: true },
  { key: 'A', isSharp: false },
  { key: 'A#', isSharp: true },
  { key: 'B', isSharp: false }
];

export const generateFullKeyboard = (): Note[] => {
  const keys: Note[] = [];
  const startOctave = 0;
  const endOctave = 8;

  for (let octave = startOctave; octave <= endOctave; octave++) {
    baseNotes.forEach((note) => {
      if (octave === 0 && ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'].includes(note.key)) {
        return;
      }

      if (octave === endOctave && note.key !== 'C') {
        return;
      }

      const id = `${note.key}${octave}`;

      keys.push({
        id,
        baseNote: note,
        octave,
      })
    })
  }

  return keys;
}

export const fullKeyboard = generateFullKeyboard();