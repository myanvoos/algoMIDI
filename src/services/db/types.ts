import type { Track } from "@tonejs/midi";

export interface TrackData {
	id: string;
	track: Track;
}

export interface DBConfig {
	name: string;
	version: number;
	storeName: string;
}
