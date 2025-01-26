import type { Track } from "@tonejs/midi";
import { deleteDB, openDB } from "idb";
import { defineStore } from "pinia";
import { toRaw } from "vue";

const DB_NAME = "midi";
const STORE_NAME = "tracks";
const DB_VERSION = 1;

const initDB = async () => {
	try {
		const db = await openDB(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion, newVersion) {
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					console.log("Creating tracks store...");
					db.createObjectStore(STORE_NAME, { keyPath: "id" });
				}
			},
			blocked() {
				console.log("Database blocked");
			},
			blocking() {
				console.log("Database blocking");
			},
			terminated() {
				console.log("Database terminated");
			},
		});

		const transaction = db.transaction(STORE_NAME, "readonly");
		const store = transaction.objectStore(STORE_NAME);
		await transaction.done;

		return db;
	} catch (error) {
		console.error("Failed to initialize DB:", error);
		await deleteDB(DB_NAME);
		throw error;
	}
};

export const useMIDIStore = defineStore("midi", {
	state: () => ({
		tracks: [] as Array<{ id: string; track: Track }>,
		loading: false,
		error: null as string | null,
	}),

	actions: {
		async addTrack(track: Track) {
			try {
				const db = await initDB();
				const id = crypto.randomUUID();

				const plainTrack = JSON.parse(JSON.stringify(toRaw(track)));
				const trackData = { track: plainTrack, id };

				const tx = db.transaction(STORE_NAME, "readwrite");
				const store = tx.objectStore(STORE_NAME);

				await store.add(trackData);
				await tx.done;

				this.tracks.push(trackData);
			} catch (error) {
				console.error("Database operation failed:", error);
				throw error;
			}
		},

		async editTrack(id: string, track: Track) {
			try {
				const db = await initDB();
				const tx = db.transaction(STORE_NAME, "readwrite");
				const store = tx.objectStore(STORE_NAME);
				await store.put(track, id);
				await tx.done;
			} catch (error) {
				console.error("Database operation failed:", error);
				throw error;
			}
		},

		async getTracks() {
			try {
				this.loading = true;
				const db = await initDB();
				const tx = db.transaction(STORE_NAME, "readonly");
				const tracks = await tx.store.getAll();
				await tx.done;

				this.tracks = tracks;
				return tracks;
			} catch (error) {
				console.error("Failed to get tracks:", error);
				this.error = error instanceof Error ? error.message : "Unknown error";
				throw error;
			} finally {
				this.loading = false;
			}
		},

		async deleteTrack(id: string) {
			try {
				const db = await initDB();
				await db.delete(STORE_NAME, id);

				this.tracks = this.tracks.filter((track) => track.id !== id);
			} catch (error) {
				console.error("Failed to delete track:", error);
				throw error;
			}
		},

		async clearAll() {
			console.log("Clearing all tracks");
			try {
				const db = await initDB();
				await db.clear(STORE_NAME);

				this.tracks = [];
			} catch (error) {
				console.error("Failed to clear all tracks:", error);
				throw error;
			}
		},

		async getTrackById(id: string) {
			const db = await initDB();
			return await db.get(STORE_NAME, id);
		},
	},
});
