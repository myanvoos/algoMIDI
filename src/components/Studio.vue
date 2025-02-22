<script setup lang="ts">
import { Header, Track } from "@tonejs/midi";
import * as Tone from "tone";
import { computed, onMounted, ref, watch } from "vue";
import { usePianoSampler } from "../composables/usePianoSampler";
import { useTrackControl } from "../composables/useTrackControl";
import { useTrackState } from "../composables/useTrackState";
import { useTransport } from "../composables/useTransport";
import { useMIDIStore } from "../stores/midiStore";
import MathsCanvas from "./maths/MathsCanvas.vue";
import Piano from "./piano/Piano.vue";
import TrackView from "./tracks/TrackView.vue";

const playbackTempo = ref(180);

const { addTrack } = useMIDIStore();
const { currentTrack, updateCurrentTrack } = useTrackState();
const { sampler, samplerError, samplerLoaded } = usePianoSampler();
const {
	isPlaying,
	transportError,
	togglePlayPause,
	initialiseTransport,
	handleStop,
} = useTransport({
	playbackTempo: playbackTempo.value,
	onStop: async () => {
		console.log("Adding track: ", currentTrack.value.track);
		await addTrack(currentTrack.value.track);
	},
});
const { pressedKeys, handleCellToggled, handleGridUpdated, handleGridIsClear, handleClearGrid } =
	useTrackControl({
		sampler,
		onStop: async () => {
			console.log("Adding track: ", currentTrack.value.track);
			await addTrack(currentTrack.value.track);
		},
	});

onMounted(() => {
	initialiseTransport();
});

const updatePlaybackTempo = (tempo: number) => {
  console.log("Updating playback tempo: ", tempo)
  playbackTempo.value = tempo
}
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
      <div class="piano-section">
        <div class="canvas-container">
          <MathsCanvas
            :pressed-keys="pressedKeys"
            @cellToggled="handleCellToggled"
            @gridUpdated="handleGridUpdated"
            @gridIsClear="handleGridIsClear"
            @update:playbackTempo="updatePlaybackTempo"
            :is-playing="isPlaying"
            :playback-tempo="playbackTempo"
          />
        </div>
        <Piano
          :track="currentTrack"
          :pressed-keys="pressedKeys"
          :is-playing="isPlaying"
          @toggle-play-pause="togglePlayPause"
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