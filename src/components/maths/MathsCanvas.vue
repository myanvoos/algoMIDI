<template>
  <div class="maths-canvas-container">
    <div class="settings-wrapper" :class="{ 'settings-open': settingsOpen }">
      <CASettings 
        v-if="settingsOpen" 
        :cellular-automata-rules="cellularAutomataRules"
        :playback-tempo="playbackTempo"
        @update:cellular-automata-rules="updateCellularAutomataRules" 
        @update:playback-tempo="updatePlaybackTempo"
        @close="settingsOpen = false"
      />
    </div>
    <div class="canvas-wrapper">
      <div class="canvas-content">
        <div class="cellular-automata-section">
          <Toolbar class="toolbar">
            <template #start v-if="width >= 768">
              <Button 
                label="Settings" 
                icon="pi pi-sliders-h" 
                @click="settingsOpen = !settingsOpen"
                class="settings-button" 
              />
              <p class="rules-display">({{ cellularAutomataRules }})</p>
            </template>
            <template #center v-else>
              <Button 
                label="Settings" 
                icon="pi pi-sliders-h" 
                @click="settingsOpen = !settingsOpen"
                class="settings-button" 
              />
              <p class="rules-display">({{ cellularAutomataRules }})</p>
            </template>
            <!-- <template #end>
              <Button label="Layout" icon-class="mr-1" icon="pi pi-th-large"  />
            </template> -->
          </Toolbar>
          <CellularAutomata
            :pressed-keys="pressedKeys.ca"
            :playback-tempo="playbackTempo"
            :cellular-automata-rules="cellularAutomataRules"
            @cellToggled="cellToggled"
            @gridUpdated="gridUpdated"
            @gridIsClear="gridIsClear"
            :is-playing="isPlaying.ca.value"
          />
        </div>
        <div class="flex-1" v-if="width >= 1260">
          <Graph 
            :is-playing="isPlaying.graph.value"
            :pressed-keys="pressedKeys.graph"
            @cellToggled="cellToggled"
            @gridUpdated="gridUpdated"
            @gridIsClear="gridIsClear"
            :transport="transport.graph"
          />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note"
import { useWindowSize } from "@vueuse/core"
import { Button, Toolbar } from "primevue"
import { TransportClass } from "tone/build/esm/core/clock/Transport"
import { Ref, ref } from "vue"
import CASettings from "./CASettings.vue"
import CellularAutomata from "./CellularAutomata.vue"
import Graph from "./Graph.vue"

const settingsOpen = ref(false)
const cellularAutomataRules = ref("B3/S2,3")
const { width } = useWindowSize()

const props = defineProps<{
	pressedKeys: {
		ca: Set<Note>
		graph: Set<Note>
	}
	isPlaying: {
		ca: Ref<boolean>
		graph: Ref<boolean>
	}
	transport: {
		ca: TransportClass
		graph: TransportClass
	}
	playbackTempo: number
}>()

const emit = defineEmits<{
	(
		e: "cellToggled",
		payload: { note: Note; isOn: boolean; source: string },
	): void
	(e: "gridUpdated", activeNotes: Set<Note>, source: string): void
	(e: "gridIsClear", source: string): void
	(e: "update:playbackTempo", value: number): void
}>()

const updateCellularAutomataRules = (value: string) => {
	cellularAutomataRules.value = value
}

const updatePlaybackTempo = (value: number) => {
	emit("update:playbackTempo", value)
}

const cellToggled = (payload: {
	note: Note
	isOn: boolean
	source: string
}) => {
	emit("cellToggled", payload)
}

const gridUpdated = (activeNotes: Set<Note>, source: string) => {
	emit("gridUpdated", activeNotes, source)
}

const gridIsClear = (source: string) => {
	emit("gridIsClear", source)
}
</script>


<style scoped>
.maths-canvas-container {
  @apply w-full h-full flex items-center justify-center relative;
  @apply md:w-[70vw] md:h-[50vh];
}

.settings-wrapper {
  @apply fixed inset-0 z-50 bg-black/50 flex items-center justify-center;
  @apply md:absolute md:inset-auto md:right-0 md:top-0 md:bg-transparent;
  display: none;
}

.settings-wrapper.settings-open {
  display: flex;
}

.settings-button {
  @apply text-sm;
  @apply md:text-base;
}

.rules-display {
  @apply ml-2 text-xs truncate max-w-[120px];
  @apply md:text-sm md:max-w-none;
}

.canvas-wrapper {
  @apply w-full h-full flex flex-col;
}

.canvas-content {
  @apply flex flex-col w-full h-full gap-4;
  @apply md:flex-row md:gap-8;
}

.cellular-automata-section {
  @apply flex flex-col w-full flex-shrink-0 items-center justify-center;
  @apply md:w-[520px];
}

.toolbar {
  @apply w-full mb-4;
}

</style>