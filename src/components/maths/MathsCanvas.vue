<template>
  <div class="min-w-[1200px] flex items-center justify-center">
    <CellularAutomata
        :pressed-keys="props.pressedKeys"
        @cellToggled="cellToggled"
        @gridUpdated="gridUpdated"
        :is-manual="props.isManual"
        :is-playing="props.isPlaying"
    />
  </div>
</template>

<script setup lang="ts">
import CellularAutomata from "./cellular-automata/CellularAutomata.vue";

const props = defineProps<{
  pressedKeys: Set<string>;
  isManual: boolean;
  isPlaying: boolean;
}>()

const emit = defineEmits<{
  (e: 'cellToggled', payload: { noteId: string; isOn: boolean }): void
  (e: 'gridUpdated', activeNotes: Set<string>): void
}>()

const cellToggled = (payload: { noteId: string; isOn: boolean }) => {
  emit('cellToggled', payload);
};

const gridUpdated = (activeNotes: Set<string>) => {
  emit('gridUpdated', activeNotes);
};
// TODO: Add chess and Collatz view
</script>


<style scoped>

</style>