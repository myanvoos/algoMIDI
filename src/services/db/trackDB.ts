import type { Track } from "@tonejs/midi"
import { toRaw } from "vue"
import { IndexedDBService } from "./indexedDB"
import type { DBConfig, TrackData } from "./types"

const DB_CONFIG: DBConfig = {
	name: "trackDB",
	version: 1,
	storeName: "tracks",
} as const

class TrackDBService extends IndexedDBService {
	constructor() {
		super(DB_CONFIG)
	}

	async addTrack(track: Track): Promise<TrackData> {
		const db = await this.initDB()
		const id = crypto.randomUUID()

		const plainTrack = JSON.parse(JSON.stringify(toRaw(track)))
		const trackData: TrackData = { track: plainTrack, id }

		const tx = db.transaction(DB_CONFIG.storeName, "readwrite")
		await tx.store.add(trackData)
		await tx.done

		return trackData
	}

	async getTrack(id: string) {
		const db = await this.initDB()
		return await db.get(DB_CONFIG.storeName, id)
	}

	async editTrack(id: string, track: Track) {
		try {
			const db = await this.initDB()
			const tx = db.transaction(DB_CONFIG.storeName, "readwrite")
			const store = tx.objectStore(DB_CONFIG.storeName)
			await store.put(track, id)
			await tx.done
		} catch (error) {
			console.error("Database operation failed:", error)
			throw error
		}
	}

	async getTracks() {
		try {
			const db = await this.initDB()
			const tx = db.transaction(DB_CONFIG.storeName, "readonly")
			const tracks = await tx.store.getAll()
			await tx.done

			return tracks
		} catch (error) {
			console.error("Failed to get tracks:", error)
			throw error
		}
	}

	async deleteTrack(id: string) {
		try {
			const db = await this.initDB()
			await db.delete(DB_CONFIG.storeName, id)
		} catch (error) {
			console.error("Failed to delete track:", error)
			throw error
		}
	}

	async clearAll() {
		console.log("Clearing all tracks")
		try {
			const db = await this.initDB()
			await db.clear(DB_CONFIG.storeName)
		} catch (error) {
			console.error("Failed to clear all tracks:", error)
			throw error
		}
	}

	async getTrackById(id: string) {
		const db = await this.initDB()
		return await db.get(DB_CONFIG.storeName, id)
	}
}

export const trackDB = new TrackDBService()
