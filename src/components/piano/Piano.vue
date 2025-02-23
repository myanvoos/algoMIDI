<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note";
import { Button } from "primevue";
import { useTrackState } from "../../composables/useTrackState";
import { TrackData } from "../../services/db/types";
import PianoKeys from "./PianoKeys.vue";

const props = defineProps<{
	pressedKeys: Set<Note>;
	isPlaying: boolean;
	track: TrackData | null;
}>();

const { currentTrack } = useTrackState();

const endTrack = () => {
	emit("endTrack", currentTrack.value);
};

const clearGrid = () => {
	emit("clearGrid");
};

const emit = defineEmits<{
	(e: "togglePlayPause"): void;
	(e: "endTrack", track: TrackData | null): void;
	(e: "clearGrid"): void;
}>();
</script>

<template>
  <div class="piano-container">
    <div class="piano-wrapper">
      <PianoKeys
          :pressed-keys="props.pressedKeys"
      />
      <div class="flex justify-center items-center space-x-4">
        <Button
          @click="$emit('togglePlayPause')"
          class="play-button"
          :label="isPlaying ? 'Pause' : 'Play'"
          :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
          
      />
      <Button
        v-if="isPlaying"
        @click="endTrack"
        class="stop-button"
        :label="'Stop'"
        :icon="'pi pi-stop'"
        rounded
      />
      <Button
        @click="clearGrid"
        class="clear-grid-button"
        :label="'Clear'"
        :icon="'pi pi-undo'"
        rounded
      />
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.piano-container {
  @apply flex items-center justify-center
}
.piano-wrapper {
  @apply rounded-lg shadow-xl p-6 w-fit
}
.play-button {
  @apply mt-4 bg-slate-500 text-white px-4 py-2 rounded
  hover:bg-sky-600 transition-colors disabled:opacity-50 space-x-2;
}

.stop-button {
  @apply mt-4 bg-blue-400 text-white px-4 py-2 rounded
  hover:bg-blue-600 transition-colors disabled:opacity-50 space-x-2;
}

.clear-grid-button {
  @apply mt-4 text-white px-4 py-2 rounded
  transition-colors disabled:opacity-50 space-x-2;
}

</style>
