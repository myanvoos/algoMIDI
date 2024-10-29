<template>
  <div class="min-w-[1200px] flex items-center justify-center">
    <CellularAutomata :pressed-keys="props.pressedKeys" @cellToggled="props.handleCellToggled"/>
  </div>
</template>

<script setup lang="ts">
import CellularAutomata from "./cellular-automata/CellularAutomata.vue";

const props = defineProps<{
  pressedKeys: Set<string>;
  handleCellToggled: (event: { noteId: string, isOn: boolean }) => void;
}>()

// TODO: Add chess and Collatz view
</script>


<style scoped>

</style>