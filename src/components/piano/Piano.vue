<script setup lang="ts">
import PianoKeys from "./PianoKeys.vue";
import {useTransport} from "../../composables/useTransport";

const props = defineProps<{
  pressedKeys: Set<string>
  isPlaying: boolean
}>();

const emit = defineEmits<{
  (e: 'togglePlayPause'): void
}>()
</script>

<template>
  <div class="piano-container">
    <div class="piano-wrapper">
      <PianoKeys
          :pressed-keys="props.pressedKeys"
      />
      <button
          @click="$emit('togglePlayPause')"
          class="play-button"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
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
  hover:bg-sky-600 transition-colors disabled:opacity-50;
}
</style>
