
// Note with octave
interface Note {
  id: string; // i.e. C4, D#5
  baseNote: BaseNote;
  octave: number;
  position: number;
}

// Note without octave
interface BaseNote {
  key: string;
  isSharp: boolean;
  width: number;
  offset: number;
}

export const baseNotes: BaseNote[] = [
  { key: 'C', isSharp: false, width: 8.33, offset: 0 },
  { key: 'C#', isSharp: true, width: 5, offset: 6.67 },
  { key: 'D', isSharp: false, width: 8.33, offset: 11.67 },
  { key: 'D#', isSharp: true, width: 5, offset: 18.33 },
  { key: 'E', isSharp: false, width: 8.33, offset: 23.33 },
  { key: 'F', isSharp: false, width: 8.33, offset: 31.67 },
  { key: 'F#', isSharp: true, width: 5, offset: 38.33 },
  { key: 'G', isSharp: false, width: 8.33, offset: 43.33 },
  { key: 'G#', isSharp: true, width: 5, offset: 50 },
  { key: 'A', isSharp: false, width: 8.33, offset: 55 },
  { key: 'A#', isSharp: true, width: 5, offset: 61.67 },
  { key: 'B', isSharp: false, width: 8.33, offset: 66.67 },
];

export const generateFullKeyboard = (): Note[] => {
  const keys: Note[] = [];

  const startOctave = 0;
  const endOctave = 8;

  for (let octave = startOctave; octave <= endOctave; octave++) {
    baseNotes.forEach((note) => {
      if (octave === 0 && ['A', 'A#', 'B'].indexOf(note.key) === -1) {
        return;
      }

      if (octave === endOctave && note.key !== 'C') {
        return;
      }

      const id = `${note.key}${octave}`;
      const position = octave * 100 + note.offset;

      keys.push({
        id,
        baseNote: note,
        octave,
        position,
      })
    })
  }

  return keys;
}

export const fullKeyboard = generateFullKeyboard();