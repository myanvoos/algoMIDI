import { Header } from "@tonejs/midi"
import { watch } from "vue"
import { Note } from "@tonejs/midi/dist/Note"
import * as Tone from "tone"
import { ref } from "vue"
import { Track as ToneTrack } from "@tonejs/midi"
import { useTransport } from "./useTransport"

interface Track {
    id: string;
    track: ToneTrack;
}

interface TrackControlConfig {
    sampler: Tone.Sampler | null;
}

export const useTrackControl = (config: TrackControlConfig) => {
    const { isPlaying, transportError, togglePlayPause, initialiseTransport } = useTransport({
        playbackTempo: 180
    })

    const pressedKeys = ref<Set<Note>>(new Set())
    const track = ref<Track>({
        id: new Date().getTime().toString(),
        track: new ToneTrack([
          {
            type: "trackName",
            text: "Untitled Track",
            deltaTime: 0,
            meta: true
          }
        ], new Header()),
      })
    
    const playbackTempo = ref(180)

    watch(pressedKeys, (newPressedKeys) => {
    if (isPlaying.value || track.value.track.notes.length === 0) {
        const currentTicks = Tone.getTransport().ticks
        
        // clear any existing notes at this tick position to avoid duplicates
        track.value.track.notes = track.value.track.notes.filter(note => note.ticks !== currentTicks)
        
        const notesToAdd: Note[] = []
        newPressedKeys.forEach(note => {
        const newNote = new Note({
            midi: Tone.Frequency(note.name).toMidi(),
            velocity: note.velocity,
            ticks: currentTicks,
        }, {
            ticks: currentTicks + Tone.Time('4n').toTicks(),
            velocity: note.velocity * 0.8,
        }, new Header())
        newNote.durationTicks = Tone.Time('4n').toTicks()
        notesToAdd.push(newNote)
        })
        
        track.value.track.notes.push(...notesToAdd)
        
        // sort notes by ticks, ensure proper playback order
        track.value.track.notes.sort((a, b) => a.ticks - b.ticks)
    }
    })


  const handleCellToggled = (payload: { note: Note, isOn: boolean }) => {
    const currentTicks = Tone.getTransport().ticks
        
    if (payload.isOn) {
      const note = new Note({
        midi: Tone.Frequency(payload.note.name).toMidi(),
        velocity: payload.note.velocity,
        ticks: currentTicks,
      }, {
            ticks: currentTicks + Tone.Time('4n').toTicks(),
            velocity: payload.note.velocity * 0.8
        }, new Header())
    
        note.durationTicks = Tone.Time('4n').toTicks()
        
        pressedKeys.value.add(note)
        } else {
        pressedKeys.value.forEach(existingNote => {
            if (existingNote.name === payload.note.name) {
            pressedKeys.value.delete(existingNote)
            }
        })
        }
        pressedKeys.value = new Set(pressedKeys.value)
    }
  
  const handleGridUpdated = (activeNotes: Set<Note>) => {
    if (!config.sampler) return
    try {
      activeNotes.forEach((note) => {
        if (!config.sampler) return
        config.sampler.triggerAttackRelease(
          note.name, 
          '4n', 
          undefined,
          note.velocity
        )
      })
      pressedKeys.value = activeNotes
    } catch (err) {
      console.error("Error playing notes:", err)
    }
  }
  
  const handleGridIsClear = async () => {
    console.log("Grid is clear")
    isPlaying.value = false
    pressedKeys.value.clear()
    Tone.getTransport().stop()
  }
  
  const updatePlaybackTempo = (value: number) => {
    playbackTempo.value = value
    togglePlayPause()
    initialiseTransport()
    togglePlayPause()
  }

  return {
    track,
    pressedKeys,
    playbackTempo,
    updatePlaybackTempo,
    handleCellToggled,
    handleGridUpdated,
    handleGridIsClear,
    togglePlayPause,
    initialiseTransport
  }
}