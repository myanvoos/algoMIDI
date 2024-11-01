<template>
  <div class="flex items-center justify-center">
    <div class="rounded-lg shadow-xl p-6 w-fit">
      <PianoKeys :pressed-keys="props.pressedKeys" />

      <button @click="$emit('togglePlayPause')" class="mt-4 bg-slate-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition-colors">
        {{ props.isPlaying ? 'Pause' : 'Play' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import PianoKeys from "./PianoKeys.vue";

const props = defineProps<{
  pressedKeys: Set<string>;
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  (e: 'togglePlayPause'): void;
}>()

</script>

<style scoped>
</style>
