import * as Tone from "tone"
import { onUnmounted, ref } from "vue"

interface TransportConfig {
	playbackTempo?: number
	onStop?: () => void
}

// singleton state
const isPlaying = ref(false)
const transportError = ref<Error | null>(null)

export function useTransport(config: TransportConfig = {}) {
	const togglePlayPause = async () => {
		try {
			if (isPlaying.value) {
				Tone.getTransport().pause()
				isPlaying.value = false
			} else {
				await Tone.start()
				Tone.getTransport().start()
				isPlaying.value = true
			}
		} catch (err) {
			transportError.value =
				err instanceof Error ? err : new Error("Unknown error occurred")
			console.error("Transport error:", transportError.value)
		}
	}

	const initialiseTransport = () => {
		console.log("Initialising transport")
		Tone.getTransport().stop()
		Tone.getTransport().bpm.value = config.playbackTempo ?? 120
		Tone.getTransport().start()
	}

	const cleanup = () => {
		console.log("Cleaning up transport")
		Tone.getTransport().stop()
		Tone.getTransport().cancel()
	}

	const handleStop = () => {
		console.log("Handling stop")
		config.onStop?.()
		Tone.getTransport().stop()
		isPlaying.value = false
	}

	onUnmounted(cleanup)

	return {
		isPlaying,
		transportError,
		togglePlayPause,
		initialiseTransport,
		handleStop,
	}
}
