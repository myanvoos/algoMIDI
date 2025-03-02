<template>
  <Card class="ca-settings">
    <template #header>
      <div class="settings-header">
        <h3 class="settings-title">Settings</h3>
        <Button 
          icon="pi pi-times" 
          class="close-button"
          @click="$emit('close')" 
        />
      </div>
    </template>
    <template #content>
      <div class="settings-content">
        <div class="section">
          <h4 class="section-title">Tempo</h4>
          <div class="tempo-selector">
            <select
              :value="props.playbackTempo"
              @change="(e) => updatePlaybackTempo(Number((e.target as HTMLSelectElement).value))"
              class="tempo-select"
            >
              <option value="60">60 BPM</option>
              <option value="120">120 BPM</option>
              <option value="180">180 BPM</option>
              <option value="240">240 BPM</option>
            </select>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">Preset Layouts</h4>
          <div class="preset-grid">
            <Button 
              v-for="preset in presets" 
              :key="preset.name"
              class="preset-button"
              :class="{ 'selected': selectedPreset === preset.name }"
              @click="selectPreset(preset)"
            >
              {{ preset.name }}
            </Button>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">Custom Rules</h4>
          <Textarea
            :model-value="props.cellularAutomataRules"
            @update:model-value="updateCustomRules"
            rows="3"
            placeholder="Enter your custom rules here..."
            class="custom-rules-input"
          />
          <small class="helper-text">
            Format: B3/S2,3 (Born with 3 neighbors, Survives with 2 or 3 neighbors)
          </small>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Button from "primevue/button"
import Card from "primevue/card"
import Textarea from "primevue/textarea"
import { ref } from "vue"

const customRules = ref("B3/S2,3")

const updateCustomRules = (value: string) => {
	customRules.value = value
	emit("update:cellular-automata-rules", customRules.value)
}

const presets = [
	{ name: "Game of Life", rules: "B3/S2,3" },
	{ name: "Day & Night", rules: "B3,6,7,8/S3,4,6,7,8" },
	{ name: "HighLife", rules: "B3,6/S2,3" },
	{ name: "Seeds", rules: "B2/S" },
]

const props = defineProps<{
	cellularAutomataRules: string
	playbackTempo: number
}>()

const emit = defineEmits<{
	(e: "update:cellular-automata-rules", value: string): void
	(e: "update:playback-tempo", value: number): void
}>()

const selectedPreset = ref<string | undefined>(
	presets.find((p) => p.rules === props.cellularAutomataRules)?.name,
)

const selectPreset = (preset: { name: string; rules: string }) => {
	customRules.value = preset.rules
	selectedPreset.value = preset.name
	emit("update:cellular-automata-rules", customRules.value)
}

const updatePlaybackTempo = (value: number) => {
	emit("update:playback-tempo", value)
}
</script>

<style scoped>
.ca-settings {
  @apply w-[90vw] max-h-[90vh] overflow-y-auto bg-[#213547] border border-white rounded-md;
  @apply md:w-[350px] md:max-h-none;
}

.settings-header {
  @apply flex items-center justify-between p-4 border-b border-white;
}

.settings-title {
  @apply text-lg font-semibold m-0;
}

.close-button {
  @apply p-2 rounded-full hover:bg-white/10;
}

.settings-content {
  @apply flex flex-col gap-6 p-4;
}

.section {
  @apply flex flex-col gap-3;
}

.section-title {
  @apply text-base font-medium m-0;
}

.tempo-selector {
  @apply w-full;
}

.tempo-select {
  @apply w-full p-2 rounded-md bg-white text-black;
}

.preset-grid {
  @apply grid grid-cols-2 gap-2;
}

.preset-button {
  @apply w-full p-2 text-sm rounded-3xl border border-white transition-all;
  @apply hover:bg-white/10;
}

.preset-button.selected {
  @apply bg-sky-300 text-black;
}

.custom-rules-input {
  @apply w-full p-2 rounded-md bg-white text-black;
  @apply focus:border-sky-300 focus:ring-1 focus:ring-sky-300;
}

.helper-text {
  @apply text-sm text-white italic;
}
</style>
