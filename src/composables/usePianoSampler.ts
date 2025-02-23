import * as Tone from "tone"
import type { Sampler } from "tone"
import { onUnmounted, ref } from "vue"

interface SamplerConfig {
	urls: Record<string, string>
	release: number
	baseUrl: string
}

const DEFAULT_SAMPLER_CONFIG: SamplerConfig = {
	urls: {
		C4: "C4.mp3", // Tone.js will interpolate the rest of the notes
		G4: "G4.mp3",
		C5: "C5.mp3",
	},
	release: 1,
	baseUrl: "/samples/piano/", // Using base grand piano sampler for now
}

// global singleton instance
let globalSampler: Sampler | null = null

export function usePianoSampler(
	config: SamplerConfig = DEFAULT_SAMPLER_CONFIG,
) {
	const samplerLoaded = ref(false)
	const samplerError = ref<Error | null>(null)

	// Only create a new sampler if one doesn't exist
	if (!globalSampler) {
		globalSampler = new Tone.Sampler({
			...config,
			onload: () => {
				console.log("Sampler loaded successfully")
				samplerLoaded.value = true
			},
			onerror: (err) => {
				console.error("Error loading sampler:", err)
				samplerError.value = err
			},
			attack: 0,
			curve: "exponential",
		}).toDestination()
	}

	const cleanup = () => {
		if (globalSampler) {
			globalSampler.dispose()
			globalSampler = null
		}
	}

	onUnmounted(cleanup)

	return {
		sampler: globalSampler,
		samplerLoaded,
		samplerError,
	}
}
