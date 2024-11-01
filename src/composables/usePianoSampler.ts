import * as Tone from 'tone';
import { ref } from "vue";
import {Sampler} from "tone";

interface SamplerConfig {
    urls: Record<string, string>
    release: number
    baseUrl: string
}

const DEFAULT_SAMPLER_CONFIG: SamplerConfig = {
    urls: {
        'C4': 'C4.mp3',  // Tone.js will interpolate the rest of the notes
        'G4': 'G4.mp3',
        'C5': 'C5.mp3'
    },
    release: 1,
    baseUrl: "/samples/piano/", // Using base grand piano sampler for now
}

export function usePianoSampler(config: SamplerConfig = DEFAULT_SAMPLER_CONFIG) {
    const isLoaded = ref(false)
    const error = ref<Error | null>(null);

    const sampler = new Tone.Sampler({
        ...config,
        onload: () => {
            console.log("Sampler loaded successfully");
            isLoaded.value = true;
        },
        onerror: (err) => {
            console.error("Error loading sampler:", err);
            error.value = err;
        }
    }).toDestination()

    return {
        sampler,
        isLoaded,
        error
    }
}