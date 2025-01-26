<script setup lang="ts">
import { Header, Track } from "@tonejs/midi";
import * as Tone from "tone";
import { computed, onMounted, ref, watch } from "vue";
import { usePianoSampler } from "../composables/usePianoSampler";
import { useTrackControl } from "../composables/useTrackControl";
import { useTransport } from "../composables/useTransport";
import { useMIDIStore } from "../stores/midiStore";
import MathsCanvas from "./maths/MathsCanvas.vue";
import Piano from "./piano/Piano.vue";
import TrackView from "./tracks/TrackView.vue";
import { useTrackState } from "../composables/useTrackState";

const playbackTempo = ref(180);

const { addTrack } = useMIDIStore();
const { currentTrack, updateCurrentTrack } = useTrackState();
const { sampler, samplerError, samplerLoaded } = usePianoSampler();
const { isPlaying, transportError, togglePlayPause, initialiseTransport, handleStop } =
	useTransport({ playbackTempo: playbackTempo.value, 
    onStop: async () => {
      console.log("Adding track: ", currentTrack.value.track)
      await addTrack(currentTrack.value.track);
    }
   });
const { pressedKeys, handleCellToggled, handleGridUpdated, handleGridIsClear } =
	useTrackControl({
		sampler,
		onStop: () => {
			isPlaying.value = false;
			Tone.getTransport().stop();
			updateCurrentTrack({
				id: crypto.randomUUID(),
				track: new Track([], new Header()),
			});
		},
	});

onMounted(() => {
	initialiseTransport();
});
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
        />
        <Piano
          :track="currentTrack"
          :pressed-keys="pressedKeys"
          :is-playing="isPlaying"
          @toggle-play-pause="togglePlayPause"
          @end-track="handleStop"
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