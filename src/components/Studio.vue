<script setup lang="ts">
import Piano from "./piano/Piano.vue"
import MathsCanvas from "./maths/MathsCanvas.vue"
import TrackView from "./tracks/TrackView.vue"
import {onUnmounted, ref, watch} from 'vue'
import {usePianoSampler} from "../composables/usePianoSampler"
import {useTransport} from "../composables/useTransport";
import { Header, Track as ToneTrack } from "@tonejs/midi"
import { Note } from "@tonejs/midi/dist/Note"
import * as Tone from "tone"
import { useMIDIStore } from "../stores/midiStore"


const { sampler, samplerLoaded, samplerError } = usePianoSampler()
const { isPlaying, transportError, togglePlayPause, cleanup } = useTransport()
const { addTrack } = useMIDIStore()


// NOTE:
// Use Set instead of Array for storing pressed keys, for O(1) lookup time.
// Certain conditions are satisfied:
// - The keys are unique values without duplication
// - The order of pressed keys is not important. Multiple pressed keys form a chord.

interface Track {
  id: string;
  track: ToneTrack;
}

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

const tracks = ref<Track[]>([])
const pressedKeys = ref<Set<Note>>(new Set())
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

watch(tracks, async (newTracks) => {
  console.log("Adding track to store:", newTracks)
  await addTrack(newTracks[0].track)
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
  if (!samplerLoaded.value) return
  try {
    activeNotes.forEach((note) => {
      sampler.triggerAttackRelease(
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
  tracks.value.push(track.value)

  console.log("Adding tracks:", track.value.track)
  await addTrack(track.value.track)
  
  Tone.getTransport().pause()
}

const updatePlaybackTempo = (value: number) => {
  playbackTempo.value = value
  togglePlayPause()
  initialiseTransport()
  togglePlayPause()
}

const initialiseTransport = () => {
  Tone.getTransport().stop()
  Tone.getTransport().bpm.value = playbackTempo.value
  Tone.getTransport().start()
}

onUnmounted(cleanup)

initialiseTransport()
</script>

<template>
  <div class="studio-container">
    <div v-if="samplerError || transportError" class="error-banner">
      Error: {{ samplerError?.message || transportError?.message }}
    </div>
    <div v-if="!samplerLoaded"  class="loading-banner">
      Loading sound samples...
    </div>
    <div class="studio-layout">
      <div class="track-view-container">
        <TrackView />
      </div>
      <div class="piano-section">
        <MathsCanvas
          :pressed-keys="pressedKeys"
          @cellToggled="handleCellToggled"
          @gridUpdated="handleGridUpdated"
          @gridIsClear="handleGridIsClear"
          :is-playing="isPlaying"
          :playback-tempo="playbackTempo"
          @update:playback-tempo="updatePlaybackTempo"
        />
        <Piano
          :pressed-keys="pressedKeys"
          :is-playing="isPlaying"
          @toggle-play-pause="togglePlayPause"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.studio-container {
  @apply min-w-[1200px] flex flex-col w-full h-full;
}

.studio-layout {
  @apply flex w-full h-full gap-3;
}

.track-view-container {
  @apply w-1/3 min-w-[400px] h-full;
}

.piano-section {
  @apply flex-1 flex flex-col items-center justify-center;
}

.error-banner {
  @apply w-full bg-slate-500 text-slate-100 p-4 text-center rounded;
}

.loading-banner {
  @apply w-full bg-blue-100 text-blue-700 p-4 text-center rounded mb-3;
}
</style>