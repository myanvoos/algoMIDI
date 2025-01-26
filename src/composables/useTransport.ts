import * as Tone from 'tone'
import {onUnmounted, ref} from "vue"

interface TransportConfig {
    playbackTempo: number
}

export function useTransport(config: TransportConfig) {
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
            console.error('Transport error:', transportError.value)
        }
    }

    const initialiseTransport = () => {
        Tone.getTransport().stop()
        Tone.getTransport().bpm.value = config.playbackTempo
        Tone.getTransport().start()
    }

    const cleanup = () => {
        Tone.getTransport().stop()
        Tone.getTransport().cancel()
    }

    onUnmounted(cleanup)

    return {
        isPlaying,
        transportError,
        togglePlayPause,
        initialiseTransport
    }
}