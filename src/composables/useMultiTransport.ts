import * as Tone from "tone"
import { onUnmounted, ref } from "vue"

interface TransportConfig {
	playbackTempo?: number
	onStop?: () => void
}

export function useMultiTransport(id: string, config: TransportConfig = {}) {
	const isPlaying = ref(false)
	const transportError = ref<Error | null>(null)
	// Create a dedicated transport instance
	const transport = Tone.getTransport()

	const togglePlayPause = async () => {
		try {
			if (isPlaying.value) {
				transport.pause()
				isPlaying.value = false
			} else {
				await Tone.start()
				transport.start()
				isPlaying.value = true
			}
		} catch (err) {
			transportError.value =
				err instanceof Error ? err : new Error("Unknown error occurred")
			console.error(`Transport ${id} error:`, transportError.value)
		}
	}

	const initialiseTransport = () => {
		console.log(`Initialising transport ${id}`)
		transport.stop()
		transport.bpm.value = config.playbackTempo ?? 120
	}

	const cleanup = () => {
		console.log(`Cleaning up transport ${id}`)
		transport.stop()
		transport.cancel()
		transport.dispose()
	}

	const handleStop = () => {
		console.log(`Handling stop for transport ${id}`)
		config.onStop?.()
		transport.stop()
		isPlaying.value = false
	}

	onUnmounted(cleanup)

	return {
		transport, // transport instance
		isPlaying,
		transportError,
		togglePlayPause,
		initialiseTransport,
		handleStop,
	}
}
