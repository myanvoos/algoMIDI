<template>
    <div class="flex flex-col border h-screen w-full p-6 space-y-6">
        <div class="flex items-center justify-between w-full">
            <h2 class="text-2xl font-bold">Tracks</h2>
            <Button icon="pi pi-plus" rounded />
        </div>
        <div v-for="track in props.tracks" :key="track.id">
            <div class="flex items-center justify-between w-full border border-dashed border-gray-500 p-3">
                <div class="flex items-center gap-2">
                    <Button 
                        icon="pi pi-play" 
                        rounded
                        @click="handlePlayTrack(track.id)"
                    />
                    <h3>{{ track.name }}</h3>
                </div>
                <Button icon="pi pi-trash" rounded />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue';
import { ref } from 'vue';
import { Track } from '../../types/types';
import { useTransport } from '../../composables/useTransport';
import { usePianoSampler } from '../../composables/usePianoSampler';
import * as Tone from 'tone';

const props = defineProps<{
    tracks: Track[]
}>()

const { isPlaying, transportError, togglePlayPause, cleanup } = useTransport()
const { sampler, samplerLoaded, samplerError } = usePianoSampler()

const handlePlayTrack = (trackId: string) => {
    const selectedTrack = props.tracks.find(track => track.id === trackId)
    if (!selectedTrack) return

    // Reset transport to beginning
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    
    Tone.getTransport().bpm.value = 180

    // Schedule all notes from the track
    selectedTrack.cells.forEach((noteSet, index) => {
        if (noteSet.size > 0) {
            Tone.getTransport().schedule((time) => {
                noteSet.forEach((note) => {
                    sampler.triggerAttackRelease(note, '4n', time)
                })
            }, `0:${index}:0`)  // Schedule at quarter note positions
        }
    })

    // Start playback
    if (!isPlaying.value) {
        togglePlayPause()
    } else {
        Tone.getTransport().start()
    }
}

</script>
