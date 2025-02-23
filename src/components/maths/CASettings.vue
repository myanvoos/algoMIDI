<template>
  <Card class="ca-settings">
    <template #content>
      <div class="settings-content">
        <div class="section">
          <h4 class="section-title">Tempo</h4>
          <select
            :value="props.playbackTempo"
            @change="(e) => updatePlaybackTempo(Number((e.target as HTMLSelectElement).value))"
            class="w-full p-2 rounded-md bg-[#f0f0f0] border border-gray-300 text-black"
          >
            <option value="60">60</option>
            <option value="120">120</option>
            <option value="180">180</option>
            <option value="240">240</option>
          </select>
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
            rows="4"
            placeholder="Enter your custom rules here..."
            class="w-full"
            style="outline: 1px solid whitesmoke; border-radius: 10px; padding: 10px;"
          />
          <small class="helper-text">
            Enter rules in the format: B3/S2,3 (Born with 3 neighbors, Survives with 2 or 3 neighbors)
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
  width: 350px;
  margin-right: 10px;
  background-color: var(--surface-card);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid whitesmoke;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.preset-button {
  width: 100%;
  outline: 1px solid whitesmoke;
  border-radius: 10px;
  transition: all 0.1s ease-in-out;
}

.preset-button.selected {
  background-color: lightskyblue !important;
  color: #213547 !important;
  outline: 1px solid #213547 !important;
}

.helper-text {
  color: var(--text-color-secondary);
  font-style: italic;
}

</style>