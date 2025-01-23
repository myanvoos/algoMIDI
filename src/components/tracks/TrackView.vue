<template>
    <div class="flex flex-col border h-screen w-full p-6 space-y-6">
        <div class="flex items-center justify-between w-full">
            <h2 class="text-2xl font-bold">Tracks</h2>
            <Button icon="pi pi-plus" rounded />
        </div>
        <div v-for="track in props.tracks" :key="track.id">
            <TrackControl
                :track="track" 
                :playback-tempo="props.playbackTempo"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue';
import { Track } from '../../types/types';
import TrackControl from './TrackControl.vue';

const props = defineProps<{
    tracks: Track[],
    playbackTempo: number
}>()


</script>