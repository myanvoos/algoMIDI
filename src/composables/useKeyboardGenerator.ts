import { Header } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";
import * as Tone from "tone";
import { ref } from "vue";

export const baseNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const generateFullKeyboard = (): Note[] => {
  const keys: Note[] = [];
  const startOctave = 0;
  const endOctave = 8;

  for (let octave = startOctave; octave <= endOctave; octave++) {
    baseNotes.forEach((noteName) => {
      // Skip notes below A0 (first note on a piano)
      if (octave === 0 && ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'].includes(noteName)) {
        return;
      }

      // Only include C8 (last note on a piano)
      if (octave === endOctave && noteName !== 'C') {
        return;
      }

      const noteId = `${noteName}${octave}`;
      
      const note = new Note({
        midi: Tone.Frequency(noteId).toMidi(),
        velocity: 0.7, 
        ticks: 0
      }, {
        ticks: Tone.Time('4n').toTicks(),
        velocity: 0.5  
      }, new Header()
    );

      keys.push(note);
    });
  }

  return keys;
};

export function useKeyboardGenerator() {
    const keyboard = ref(generateFullKeyboard());
    
    const regenerateKeyboard = () => {
        keyboard.value = generateFullKeyboard();
    };

    return {
        keyboard,
        regenerateKeyboard
    };
}