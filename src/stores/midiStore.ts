import { openDB, deleteDB, wrap, unwrap } from "idb";
import { Track } from "@tonejs/midi";

/**
 * Using IndexedDB to store tracks locally
 */
export const addTrack = async (track: Track) => {
    const id = crypto.randomUUID();
    const db = await openDB("midi", 1);
    await db.put("tracks", { ...track, id });
}

export const getTracks = async () => {
    const db = await openDB("midi", 1);
    return await db.getAll("tracks");
}

export const getTrackById = async ({ id }: { id: string }) => {
    const db = await openDB("midi", 1);
    return await db.get("tracks", id);
}

export const deleteTrack = async ({ id }: { id: string }) => {
    const db = await openDB("midi", 1);
    await db.delete("tracks", id);
}