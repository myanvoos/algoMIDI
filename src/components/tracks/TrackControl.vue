<template>
    <div class="flex items-center justify-between w-full border border-dashed border-gray-500 p-3">
        <div class="flex items-center gap-2">
            <Button 
                :icon="trackIsPlaying ? 'pi pi-pause' : 'pi pi-play'" 
                rounded
                @click="handleTogglePlayTrack"
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
import { Track } from "@tonejs/midi"
import { Button } from "primevue"
import * as Tone from "tone"
import { onUnmounted, ref } from "vue"
import { usePianoSampler } from "../../composables/usePianoSampler"
import { useTransport } from "../../composables/useTransport"

interface TrackWithId {
	id: string
	track: Track
}

const props = defineProps<{
	trackWithId: TrackWithId
}>()

const { transportError, handleStop } = useTransport({
	onStop: () => {
		trackIsPlaying.value = false
	},
})
const { sampler, samplerLoaded, samplerError } = usePianoSampler()

const trackIsPlaying = ref(false)
const trackId = ref<number | null>(null)

const handleTogglePlayTrack = async () => {
	if (trackIsPlaying.value) {
		handlePauseTrack()
	} else {
		handlePlayTrack()
	}
}

const handlePlayTrack = async () => {
	if (trackId.value) {
		Tone.getTransport().clear(trackId.value)
	}

	trackIsPlaying.value = true
	const transport = Tone.getTransport()
	transport.stop()
	transport.cancel()

	const notesByTicks: {
		[ticks: number]: (typeof props.trackWithId.track.notes)[0][]
	} = {}

	for (const note of props.trackWithId.track.notes) {
		if (!notesByTicks[note.ticks]) {
			notesByTicks[note.ticks] = []
		}
		notesByTicks[note.ticks].push(note)
	}

	// schedule all notes, store the ID
	for (const [ticks, notes] of Object.entries(notesByTicks)) {
		const startTime = `+${Tone.Ticks(Number.parseInt(ticks)).toBarsBeatsSixteenths()}`

		trackId.value = transport.schedule((time) => {
			notes.forEach((note) => {
				if (note.velocity > 0) {
					sampler.triggerAttackRelease(note.name, "4n", time, note.velocity)
				}
			})
		}, startTime)
	}

	const lastTick = Math.max(...Object.keys(notesByTicks).map(Number))
	const duration = Tone.Ticks(lastTick).toSeconds()

	transport.schedule(
		() => {
			handlePauseTrack()
		},
		`+${duration + 0.1}`,
	)

	await Tone.start()
	transport.start()
}

const handlePauseTrack = () => {
	trackIsPlaying.value = false
	if (trackId.value) {
		Tone.getTransport().clear(trackId.value)
		trackId.value = null
	}
	Tone.getTransport().stop()
}

const handleEditTrackName = (input: HTMLInputElement) => {
	input.focus()
	props.trackWithId.track.name = input.value
}

onUnmounted(() => {
	if (trackId.value) {
		Tone.getTransport().clear(trackId.value)
	}
})
</script>