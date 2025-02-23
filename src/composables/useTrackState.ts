import { Header, Track } from "@tonejs/midi"
import { ref } from "vue"
import type { TrackData } from "../services/db/types"

// Make it a singleton to share state across composables
const currentTrack = ref<TrackData>({
	id: crypto.randomUUID(),
	track: new Track([], new Header()),
})

export function useTrackState() {
	const updateCurrentTrack = (track: TrackData) => {
		currentTrack.value = track
	}

	return {
		currentTrack,
		updateCurrentTrack,
	}
}
