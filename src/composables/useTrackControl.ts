import { Header, Track } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";
import * as Tone from "tone";
import { ref, watch } from "vue";
import { useTrackState } from './useTrackState';
import { useTransport } from "./useTransport";

interface TrackControlConfig {
	sampler: Tone.Sampler | null;
	onStop: () => void;
}

export function useTrackControl(config: TrackControlConfig) {
	const { currentTrack } = useTrackState();
	const { isPlaying } = useTransport();
	const pressedKeys = ref<Set<Note>>(new Set());

	watch(pressedKeys, (newPressedKeys) => {
		if (!isPlaying.value) {
			console.log("Not playing, returning");
			return;
		}
		
		const currentTicks = Tone.getTransport().ticks;
		
		currentTrack.value.track.notes = currentTrack.value.track.notes.filter(
			(note) => note.ticks !== currentTicks
		);
		
		const notesToAdd: Note[] = Array.from(newPressedKeys).map(note => {
			const newNote = new Note(
				{
					midi: Tone.Frequency(note.name).toMidi(),
					velocity: note.velocity,
					ticks: currentTicks,
				},
				{
					ticks: currentTicks + Tone.Time("4n").toTicks(),
					velocity: note.velocity * 0.8,
				},
				new Header()
			);
			newNote.durationTicks = Tone.Time("4n").toTicks();
			return newNote;
		});
		
		currentTrack.value.track.notes.push(...notesToAdd);
		currentTrack.value.track.notes.sort((a, b) => a.ticks - b.ticks);

		console.log("Track updated:", currentTrack.value.track);
	}, { deep: true });

	const handleCellToggled = (payload: { note: Note; isOn: boolean }) => {
		if (payload.isOn) {
			pressedKeys.value.add(payload.note);
		} else {
			pressedKeys.value.delete(payload.note);
		}
		pressedKeys.value = new Set(pressedKeys.value);
	};

	const handleGridUpdated = (activeNotes: Set<Note>) => {
		if (!config.sampler) return;
		try {
			activeNotes.forEach((note) => {
				if (!config.sampler) return;
				config.sampler.triggerAttackRelease(
					note.name,
					"4n",
					undefined,
					note.velocity,
				);
			});
			pressedKeys.value = activeNotes;
		} catch (err) {
			console.error("Error playing notes:", err);
		}
	};

	const handleGridIsClear = async () => {
		config.onStop();
		pressedKeys.value.clear();
		Tone.getTransport().stop();
	};

	const recordNote = (note: Note) => {
		const currentTicks = Tone.getTransport().ticks;
		return {
			...note,
			ticks: currentTicks,
			durationTicks: Tone.Time("4n").toTicks()
		};
	};

	const playNote = (note: Note) => {
		if (!config.sampler) return;
		config.sampler.triggerAttackRelease(
			note.name,
			"4n",
			undefined,
			note.velocity
		);
	};

	return {
		pressedKeys,
		handleCellToggled,
		handleGridUpdated,
		handleGridIsClear,
		recordNote,
		playNote,
		updatePressedKeys: (keys: Set<Note>) => pressedKeys.value = keys
	};
}
