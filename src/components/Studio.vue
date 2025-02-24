<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note"
import { computed, onMounted, ref, watch } from "vue"
import { useMultiTransport } from "../composables/useMultiTransport"
import { usePianoSampler } from "../composables/usePianoSampler"
import { useTrackControl } from "../composables/useTrackControl"
import { useTrackState } from "../composables/useTrackState"
import MathsCanvas from "./maths/MathsCanvas.vue"
import Piano from "./piano/Piano.vue"
import TrackView from "./tracks/TrackView.vue"

const playbackTempo = ref(180)

const { currentTrack, updateCurrentTrack } = useTrackState()
const { sampler, samplerError, samplerLoaded } = usePianoSampler()

const caTransport = useMultiTransport("ca", {
	playbackTempo: playbackTempo.value,
	onStop: async () => {
		// console.log("Adding CA track: ", currentTrack.value.track)
		// await addTrack(currentTrack.value.track)
	},
})
const graphTransport = useMultiTransport("graph", {
	playbackTempo: playbackTempo.value,
	onStop: async () => {
		// console.log("Adding graph track: ", currentTrack.value.track)
		// await addTrack(currentTrack.value.track)
	},
})

const {
	pressedKeys: caPressedKeys,
	handleCellToggled: caHandleCellToggled,
	handleGridUpdated: caHandleGridUpdated,
	handleGridIsClear: caHandleGridIsClear,
	handleClearGrid: caHandleClearGrid,
} = useTrackControl("ca", {
	sampler,
	transport: caTransport.transport,
	onStop: async () => {
		// console.log("Adding CA track: ", currentTrack.value.track)
		// await addTrack(currentTrack.value.track)
	},
})

const {
	pressedKeys: graphPressedKeys,
	handleCellToggled: graphHandleCellToggled,
	handleGridUpdated: graphHandleGridUpdated,
	handleGridIsClear: graphHandleGridIsClear,
	handleClearGrid: graphHandleClearGrid,
} = useTrackControl("graph", {
	sampler,
	transport: graphTransport.transport,
	onStop: async () => {
		// console.log("Adding graph track: ", currentTrack.value.track)
		// await addTrack(currentTrack.value.track)
	},
})
const handleCellToggled = (payload: {
	note: Note
	isOn: boolean
	source: string
}) => {
	if (payload.source === "ca") {
		caHandleCellToggled(payload)
	} else {
		graphHandleCellToggled(payload)
	}
}

const handleGridUpdated = (activeNotes: Set<Note>, source: string) => {
	if (source === "ca") {
		caHandleGridUpdated(activeNotes)
	} else {
		graphHandleGridUpdated(activeNotes)
	}
}

const handleGridIsClear = (source: string) => {
	if (source === "ca" && !caPressedKeys?.value?.size) {
		caHandleGridIsClear()
		if (!graphPressedKeys?.value?.size) {
			handleStop()
		}
	} else if (source === "graph" && !graphPressedKeys?.value?.size) {
		graphHandleGridIsClear()
		if (!caPressedKeys?.value?.size) {
			handleStop()
		}
	}
}

const handleClearGrid = () => {
	caHandleClearGrid()
	graphHandleClearGrid()
}

const handleTogglePlayPause = () => {
	if (
		!caTransport.isPlaying &&
		!caPressedKeys?.value?.size &&
		!graphPressedKeys?.value?.size
	) {
		return
	}
	caTransport.togglePlayPause()
	graphTransport.togglePlayPause()
}

const handleStop = () => {
	caTransport.handleStop()
	graphTransport.handleStop()
}

onMounted(() => {
	caTransport.initialiseTransport()
	graphTransport.initialiseTransport()
})

const updatePlaybackTempo = (tempo: number) => {
	console.log("Updating playback tempo: ", tempo)
	playbackTempo.value = tempo
}
</script>

<template>
  <div class="studio-container">
    <!-- <div v-if="samplerError || caTransport.transportError || graphTransport.transportError" class="error-banner">
      Error: {{ samplerError || caTransport.transportError?.value?.message || graphTransport.transportError?.value?.message }}
    </div> -->
    <div v-if="!samplerLoaded"  class="loading-banner">
      Loading sound samples...
    </div>
    <div class="studio-layout">
      <div class="piano-section">
        <div class="canvas-container">
          <MathsCanvas
            :pressed-keys="{ ca: caPressedKeys, graph: graphPressedKeys }"
            :is-playing="{ ca: caTransport.isPlaying, graph: graphTransport.isPlaying }"
            :transport="{ ca: caTransport.transport, graph: graphTransport.transport }"
            @cellToggled="handleCellToggled"
            @gridUpdated="handleGridUpdated"
            @gridIsClear="handleGridIsClear"
            @update:playbackTempo="updatePlaybackTempo"
            :playback-tempo="playbackTempo"
          />
        </div>
        <Piano
          :track="currentTrack"
          :pressed-keys="{ ca: caPressedKeys, graph: graphPressedKeys }"
          :is-playing="{ ca: caTransport.isPlaying, graph: graphTransport.isPlaying }"
          @toggle-play-pause="handleTogglePlayPause"
          @end-track="handleStop"
          @clear-grid="handleClearGrid"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.studio-container {
  @apply w-full h-full flex flex-col items-center justify-center;
}

.studio-layout {
  @apply flex flex-col w-full h-[90vh] items-center justify-center;
}

.piano-section {
  @apply w-full h-full flex flex-col items-center justify-center gap-4;
}

.canvas-container {
  @apply flex-1 w-full flex items-center justify-center;
}

.error-banner {
  @apply w-full bg-slate-500 text-slate-100 p-4 text-center rounded;
}

.loading-banner {
  @apply w-full bg-blue-100 text-blue-700 p-4 text-center rounded mb-3;
}
</style>