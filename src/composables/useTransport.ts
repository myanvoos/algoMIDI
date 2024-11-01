import * as Tone from 'tone'
import {ref} from "vue"

export function useTransport() {
    const isPlaying = ref(false)
    const transportError = ref<Error | null>(null)

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
            transportError.value = err instanceof Error ? err : new Error("Unknown error occurred")
            console.transportError('Transport error:', transportError.value)
        }
    }

    const cleanup = () => {
        Tone.getTransport().stop()
        Tone.getTransport().cancel()
    }

    return {
        isPlaying,
        transportError,
        togglePlayPause,
        cleanup
    }
}