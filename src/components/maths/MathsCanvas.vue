<template>
  <div class="min-w-[1200px] flex items-center justify-center">
    <div>
    <Button label="Settings">
      <Settings2 class="w-5 h-5" />
    </Button>
    <CellularAutomata
        :pressed-keys="props.pressedKeys"
        @cellToggled="cellToggled"
        @gridUpdated="gridUpdated"
        @gridIsClear="gridIsClear"
        :is-playing="props.isPlaying"
    />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { Settings2 } from "lucide-vue-next";
import CellularAutomata from "./CellularAutomata.vue";
import { Button } from "primevue";
import { ref } from "vue";

const props = defineProps<{
  pressedKeys: Set<string>;
  isPlaying: boolean;
}>()

const emit = defineEmits<{
  (e: 'cellToggled', payload: { noteId: string; isOn: boolean }): void
  (e: 'gridUpdated', activeNotes: Set<string>): void
  (e: 'gridIsClear'): void
}>()

const cellToggled = (payload: { noteId: string; isOn: boolean }) => {
  emit('cellToggled', payload);
};

const gridUpdated = (activeNotes: Set<string>) => {
  emit('gridUpdated', activeNotes);
};

const gridIsClear = () => {
  emit('gridIsClear');
}
// TODO: Add chess and Collatz view
</script>


<style scoped>

</style>