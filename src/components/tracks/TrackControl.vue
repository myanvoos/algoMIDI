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

            <input
                type="text"
                :value="trackWithId.track.name"
                @dblclick="(e) => handleEditTrackName(e.target as HTMLInputElement)"
                class="bg-transparent"
            />

            <Button icon="pi pi-trash" rounded />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { Track } from '@tonejs/midi';
import { useTransport } from '../../composables/useTransport';
import { usePianoSampler } from '../../composables/usePianoSampler';
import * as Tone from 'tone';
import { Button } from 'primevue';

interface TrackWithId {
    id: string,
    track: Track,
}

const props = defineProps<{
    trackWithId: TrackWithId,
}>()

const { isPlaying, transportError, togglePlayPause, cleanup } = useTransport()
const { sampler, samplerLoaded, samplerError } = usePianoSampler()

const trackIsPlaying = ref(false)

const handlePlayTrack = () => {
    trackIsPlaying.value = true

    const transport = Tone.getTransport()
    transport.stop()
    transport.cancel()

    console.log("Playing track", props.trackWithId.track)

    const notesByTicks: { [ticks: number]: typeof props.trackWithId.track.notes[0][] } = {}
    
    props.trackWithId.track.notes.forEach(note => {
        if (!notesByTicks[note.ticks]) {
            notesByTicks[note.ticks] = []
        }
        notesByTicks[note.ticks].push(note)
    })

    Object.entries(notesByTicks).forEach(([ticks, notes]) => {
        const startTime = `+${Tone.Ticks(parseInt(ticks)).toBarsBeatsSixteenths()}`
        
        transport.schedule((time) => {
            notes.forEach(note => {
                if (note.velocity > 0) {
                    sampler.triggerAttackRelease(
                        note.name,
                        '4n', 
                        time,
                        note.velocity
                    )
                }
            })
        }, startTime)
    })

    // Start playback
    if (!isPlaying.value) {
        togglePlayPause()
    } else {
        transport.start()
    }
}

const handlePauseTrack = () => {
    trackIsPlaying.value = false
    Tone.getTransport().stop()
}

const handleEditTrackName = (input: HTMLInputElement) => {
    input.focus()
    props.trackWithId.track.name = input.value
}

onUnmounted(cleanup)
</script>