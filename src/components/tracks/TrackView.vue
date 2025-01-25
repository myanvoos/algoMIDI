<template>
    <div class="flex flex-col border h-screen w-full p-6 space-y-6">
        <div class="flex items-center justify-between w-full">
            <h2 class="text-2xl font-bold">Tracks</h2>
            <Button icon="pi pi-plus" rounded />
        </div>
        <div v-for="track in props.tracks" :key="track.id">
            <TrackControl
                :track-with-id="{ id: track.id, track: track.track }" 
                :playback-tempo="props.playbackTempo"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue';
import TrackControl from './TrackControl.vue';
import { Track } from '@tonejs/midi';

interface TrackWithId {
    id: string,
    track: Track,
}

const props = defineProps<{
    tracks: TrackWithId[],
    playbackTempo: number
}>()


</script>