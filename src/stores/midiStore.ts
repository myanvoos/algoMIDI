import type { Track } from "@tonejs/midi"
import { defineStore } from "pinia"
import { trackDB } from "../services/db/trackDB"

export const useMIDIStore = defineStore("midi", {
	state: () => ({
		tracks: [] as Array<{ id: string; track: Track }>,
		loading: false,
		error: null as string | null,
	}),

	actions: {
		async addTrack(track: Track) {
			this.loading = true
			try {
				const trackData = await trackDB.addTrack(track)
				this.tracks.push(trackData)
			} catch (error) {
				console.error("Error adding track:", error)
				this.error = error as string
				throw error
			} finally {
				this.loading = false
				console.log("DB state: ", this.tracks)
			}
		},

		async getTrack(id: string) {
			this.loading = true
			try {
				const trackData = await trackDB.getTrack(id)
				return trackData
			} catch (error) {
				console.error("Error getting track:", error)
				this.error = error as string
				throw error
			} finally {
				this.loading = false
			}
		},

		async getAllTracks() {
			this.loading = true
			try {
				const tracks = await trackDB.getTracks()
				return tracks
			} catch (error) {
				console.error("Error getting all tracks:", error)
				this.error = error as string
				throw error
			} finally {
				this.loading = false
			}
		},

		async deleteTrack(id: string) {
			this.loading = true
			try {
				await trackDB.deleteTrack(id)
				this.tracks = this.tracks.filter((track) => track.id !== id)
			} catch (error) {
				console.error("Error deleting track:", error)
				this.error = error as string
				throw error
			} finally {
				this.loading = false
			}
		},

		async clearAllTracks() {
			this.loading = true
			try {
				await trackDB.clearAll()
				this.tracks = []
			} catch (error) {
				console.error("Error deleting all tracks:", error)
				this.error = error as string
				throw error
			} finally {
				this.loading = false
			}
		},
	},
})
