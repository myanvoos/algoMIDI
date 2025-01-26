<template>
    <div class="flex flex-col border h-screen w-full p-6 space-y-6">
        <div class="flex items-center justify-between w-full">
            <h2 class="text-2xl font-bold">Tracks</h2>
            <div class="flex items-center space-x-4">
                <Button icon="pi pi-plus" rounded />
                <Button @click="midiStore.clearAll" label="Clear All" rounded />
            </div>
        </div>

        <div v-if="loading" class="text-center py-4">
            Loading tracks...
        </div>

        <div v-else-if="error" class="text-red-500 text-center py-4">
            {{ error }}
        </div>

        <div v-else-if="midiStore.tracks.length === 0" class="text-center py-4">
            No tracks available
        </div>

        <div v-else v-for="track in midiStore.tracks" :key="track.id">
            <TrackControl :track-with-id="track" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from "primevue";
import { onMounted, ref } from "vue";
import { useMIDIStore } from "../../stores/midiStore";
import TrackControl from "./TrackControl.vue";

const loading = ref(false);
const error = ref<string | null>(null);
const midiStore = useMIDIStore();

const loadTracks = async () => {
	loading.value = true;
	error.value = null;
	try {
		await midiStore.getTracks();
	} catch (err) {
		error.value = err instanceof Error ? err.message : "Failed to load tracks";
		console.error("Error loading tracks:", err);
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadTracks();
});
</script>