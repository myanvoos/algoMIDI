<template>
  <div class="min-w-[1200px] flex items-center justify-center">
    <div>
      <CASettings 
        v-if="settingsOpen" 
        :cellular-automata-rules="cellularAutomataRules"
        :playback-tempo="playbackTempo"
        @update:cellular-automata-rules="updateCellularAutomataRules" 
        @update:playback-tempo="updatePlaybackTempo"
      />
    </div>
    <div>
      <Toolbar>
        <template #start>
          <Button label="Settings" icon-class="mr-1" icon="pi pi-sliders-h" @click="settingsOpen = !settingsOpen" />
          <p class="ml-2">({{ cellularAutomataRules }})</p>
        </template>
        <template #end>
          <Button label="Layout" icon-class="mr-1" icon="pi pi-th-large"  />
        </template>
      </Toolbar>
    <CellularAutomata
        :pressed-keys="pressedKeys"
        :playback-tempo="playbackTempo"
        :cellular-automata-rules="cellularAutomataRules"
        @cellToggled="cellToggled"
        @gridUpdated="gridUpdated"
        @gridIsClear="gridIsClear"
        :is-playing="isPlaying"
    />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note";
import { Button, Toolbar } from "primevue";
import { ref } from "vue";
import CASettings from "./CASettings.vue";
import CellularAutomata from "./CellularAutomata.vue";

const settingsOpen = ref(false);
const cellularAutomataRules = ref("B3/S2,3");

const props = defineProps<{
	pressedKeys: Set<Note>;
	isPlaying: boolean;
	playbackTempo: number;
}>();

const emit = defineEmits<{
	(e: "cellToggled", payload: { note: Note; isOn: boolean }): void;
	(e: "gridUpdated", activeNotes: Set<Note>): void;
	(e: "gridIsClear"): void;
	(e: "update:playbackTempo", value: number): void;
}>();

const updateCellularAutomataRules = (value: string) => {
	cellularAutomataRules.value = value;
};

const updatePlaybackTempo = (value: number) => {
	emit("update:playbackTempo", value);
};

const cellToggled = (payload: { note: Note; isOn: boolean }) => {
	emit("cellToggled", payload);
};

const gridUpdated = (activeNotes: Set<Note>) => {
	emit("gridUpdated", activeNotes);
};

const gridIsClear = () => {
	emit("gridIsClear");
};
// TODO: Add chess and Collatz view
</script>


<style scoped>

</style>