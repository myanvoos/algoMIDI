<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note"
import { useWindowSize } from "@vueuse/core"
import { computed, onMounted, ref, watch } from "vue"
import { useMultiTransport } from "../composables/useMultiTransport"
import { usePianoSampler } from "../composables/usePianoSampler"
import { useTrackControl } from "../composables/useTrackControl"
import { useTrackState } from "../composables/useTrackState"
import MathsCanvas from "./maths/MathsCanvas.vue"
import Piano from "./piano/Piano.vue"
import TrackView from "./tracks/TrackView.vue"

const { width } = useWindowSize()
const isMobileMessageOpen = ref(width.value < 1260)
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
	<div>
		<a href="https://github.com/myanvoos/algoMIDI" class="github-link">
			<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
				<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
			</svg>
			GitHub
		</a>
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
		  <div v-if="isMobileMessageOpen" class="mobile-message" @click="isMobileMessageOpen = false">
			<p>Note: Since you're on a mobile device, you can only play the cellular automata. If you want to try out the graph BFS/DFS, please revisit this site on a desktop device!
			</p>
		</div>
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
  @apply flex-1 w-full flex items-center justify-center flex-col;
}

.error-banner {
  @apply w-full bg-slate-500 text-slate-100 p-4 text-center rounded;
}

.loading-banner {
  @apply w-full bg-blue-100 text-blue-700 p-4 text-center rounded mb-3;
}

.mobile-message {
  @apply w-[90vw] border border-dashed p-3 rounded-md cursor-pointer;
}

.github-link {
  @apply text-gray-100 flex items-center gap-2 mb-5 md:mb-0;
}

</style>
