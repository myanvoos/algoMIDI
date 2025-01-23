<template>
    <div class="flex items-center justify-between w-full border border-dashed border-gray-500 p-3">
        <div class="flex items-center gap-2">
            <Button 
                v-if="!trackIsPlaying"
                icon="pi pi-play" 
                rounded
                @click="handlePlayTrack"
            />
            <Button 
                v-if="trackIsPlaying"
                icon="pi pi-pause" 
                rounded
                @click="handlePauseTrack"
            />

            <h3>{{ track.name }}</h3>
            <input
                type="range"
                :value="track.volume"
                min="0"
                max="1"
                step="0.01"
                @change="updateVolume(($event.target as HTMLInputElement).value)"
            />
            <Button icon="pi pi-trash" rounded />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Track } from '../../types/types';
import { useTransport } from '../../composables/useTransport';
import { usePianoSampler } from '../../composables/usePianoSampler';
import * as Tone from 'tone';
import { Button } from 'primevue';

const props = defineProps<{
    track: Track,
    playbackTempo: number
}>()

const { isPlaying, transportError, togglePlayPause, cleanup } = useTransport()
const { sampler, samplerLoaded, samplerError } = usePianoSampler()

const trackIsPlaying = ref(false)

const handlePlayTrack = () => {
    trackIsPlaying.value = true

    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    
    Tone.getTransport().bpm.value = props.playbackTempo

    // Schedule all notes from the track
    props.track.cells.forEach((noteSet, index) => {
        if (noteSet.size > 0) {
            Tone.getTransport().schedule((time) => {
                noteSet.forEach((note) => {
                    sampler.triggerAttackRelease(note, '4n', time, props.track.volume)
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

const handlePauseTrack = () => {
    trackIsPlaying.value = false
    Tone.getTransport().stop()
}

const updateVolume = (volume: string) => {
    props.track.volume = parseFloat(volume)
}

</script>