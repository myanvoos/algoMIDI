import { Header, Track } from "@tonejs/midi"
import { Note } from "@tonejs/midi/dist/Note"
import * as Tone from "tone"
import type { TransportClass } from "tone/build/esm/core/clock/Transport"
import { nextTick, ref, watch } from "vue"
import { useMultiTransport } from "./useMultiTransport"
import { useTrackState } from "./useTrackState"

interface TrackControlConfig {
	sampler: Tone.Sampler | null
	onStop: () => void
	transport?: TransportClass
}

export function useTrackControl(id: string, config: TrackControlConfig) {
	const { currentTrack } = useTrackState()
	const { isPlaying } = useMultiTransport(id)
	const pressedKeys = ref<Set<Note>>(new Set())

	watch(
		pressedKeys,
		(newPressedKeys) => {
			if (newPressedKeys.size === 0) {
				return
			}

			const transport = config.transport || Tone.getTransport()
			const currentTicks = transport.ticks

			currentTrack.value.track.notes = currentTrack.value.track.notes.filter(
				(note) => note.ticks !== currentTicks,
			)

			const notesToAdd: Note[] = Array.from(newPressedKeys).map((note) => {
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
					new Header(),
				)
				newNote.durationTicks = Tone.Time("4n").toTicks()
				return newNote
			})

			currentTrack.value.track.notes.push(...notesToAdd)
			currentTrack.value.track.notes.sort((a, b) => a.ticks - b.ticks)
		},
		{ deep: true },
	)

	const handleCellToggled = (payload: { note: Note; isOn: boolean }) => {
		if (payload.isOn) {
			pressedKeys.value.add(payload.note)
		} else {
			pressedKeys.value.delete(payload.note)
		}
		// reassign to make sure pressedKeys is a new object
		pressedKeys.value = new Set(pressedKeys.value)
	}

	const handleClearGrid = () => {
		console.log("Clearing grid")
		pressedKeys.value.clear()
		pressedKeys.value = new Set(pressedKeys.value)
	}

	const handleGridUpdated = (activeNotes: Set<Note>) => {
		if (!config.sampler) return

		const currentNotes = new Set(pressedKeys.value)
		const hasChanged =
			activeNotes.size !== currentNotes.size ||
			Array.from(activeNotes).some((note) => !currentNotes.has(note))

		if (!hasChanged) return

		try {
			activeNotes.forEach((note) => {
				if (!config.sampler) return
				config.sampler.triggerAttackRelease(
					note.name,
					"4n",
					undefined,
					note.velocity,
				)
			})
			pressedKeys.value = activeNotes
		} catch (err) {
			console.error("Error playing notes:", err)
		}
	}

	const handleGridIsClear = async () => {
		config.onStop()
		isPlaying.value = false
		pressedKeys.value.clear()
		Tone.getTransport().stop()
	}

	const recordNote = (note: Note) => {
		const currentTicks = Tone.getTransport().ticks
		return {
			...note,
			ticks: currentTicks,
			durationTicks: Tone.Time("4n").toTicks(),
		}
	}

	const playNote = (note: Note) => {
		if (!config.sampler) return
		config.sampler.triggerAttackRelease(
			note.name,
			"4n",
			undefined,
			note.velocity,
		)
	}

	return {
		pressedKeys,
		handleCellToggled,
		handleGridUpdated,
		handleGridIsClear,
		handleClearGrid,
		recordNote,
		playNote,
		updatePressedKeys: (keys: Set<Note>) => {
			pressedKeys.value = keys
		},
	}
}
