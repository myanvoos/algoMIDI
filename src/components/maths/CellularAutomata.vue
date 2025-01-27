<script setup lang="ts">
import { Note } from "@tonejs/midi/dist/Note";
import p5 from "p5";
import { Ref, computed, onMounted, ref, watch } from "vue";
import {
	AutomataConfig,
	useAutomata,
} from "../../composables/cellular-automata/useAutomata";
import {
	AutomataState,
	useAutomataRenderer,
} from "../../composables/cellular-automata/useAutomataRenderer";
import { P5CanvasConfig, useP5Canvas } from "../../composables/useP5Canvas";

const props = defineProps<{
	pressedKeys: Set<Note>;
	isPlaying: boolean;
	cellularAutomataRules: string;
	playbackTempo: number;
}>();

const emit = defineEmits<{
	(e: "cellToggled", payload: { note: Note; isOn: boolean }): void;
	(e: "gridUpdated", activeNotes: Set<Note>): void;
	(e: "gridIsClear"): void;
}>();

const automataConfig: Ref<AutomataConfig> = ref<AutomataConfig>({
	gridSize: 11,
	scale: "minor",
	rootNote: "C",
	rules: props.cellularAutomataRules,
});

const canvasContainer = ref<HTMLElement | null>(null);

/**
 * Specifies the canvas configuration
 * IMPORTANT: frameRate directly affects the tempo.
 * Frame rate of 3 => notes recorded every 1/3 second, equivalent to 180 bpm
 * as 60 bpm is 1/60 second per beat, or frame rate of 1.
 */
const canvasConfig: Ref<P5CanvasConfig> = ref<P5CanvasConfig>({
	width: 500,
	height: 500,
	frameRate: props.playbackTempo / 60,
	backgroundColour: "#233140",
	canvasContainer: null,
});

watch(
	() => props.cellularAutomataRules,
	(newRules) => {
		automataConfig.value.rules = newRules;
	},
);

const { currentCells, rowCount, columnCount, updateAutomata, clearGrid } = useAutomata(
	automataConfig.value,
);

const cellSize = ref(0);

const isPlaying = computed(() => props.isPlaying);

const automataState = computed(() => ({
	currentCells: currentCells.value,
	rowCount: rowCount.value,
	columnCount: columnCount.value,
	isPlaying: isPlaying.value,
	cellSize: cellSize.value,
}));

const { drawGrid, handleMouseClick, updateGrid, clearGridDisplay } = useAutomataRenderer({
	automataConfig: automataConfig,
	automataState: automataState,
	callbacks: {
		onCellToggled: (payload: { note: Note; isOn: boolean }) => {
			emit("cellToggled", payload);
		},
		onGridUpdated: () => {
			const activeNotes = updateAutomata();
			if (activeNotes.size === 0) emit("gridIsClear");
			emit("gridUpdated", activeNotes);
		},
		onGridIsClear: () => {
			emit("gridIsClear");
		},
	},
});

watch(
	() => props.playbackTempo,
	(newTempo) => {
		canvasConfig.value.frameRate = newTempo / 60;
		if (p5Instance.value) {
			p5Instance.value.frameRate(canvasConfig.value.frameRate);
		}
	},
);

const { p5Instance, initCanvas, createSketch, redraw } = useP5Canvas();

const sketch = (p5: p5) => {
	const sketchFn = createSketch(canvasConfig, {
		onDraw: () => drawGrid(p5),
		onMouseClicked: () => handleMouseClick(p5),
		beforeLoop: () => updateGrid(),
	});

	sketchFn(p5);
};

watch(
	() => props.pressedKeys,
	(newKeys) => {
		if (newKeys.size === 0) {
			clearGrid();
			if (p5Instance.value) {
				clearGridDisplay(p5Instance.value);
				redraw();
			}
		}
	},
);

watch(
	canvasContainer,
	(newContainer) => {
		if (newContainer) {
			canvasConfig.value.canvasContainer = newContainer;
			if (p5Instance.value) {
				initCanvas(sketch, newContainer);
			}
		}
	},
	{ immediate: true },
);

onMounted(() => {
	if (canvasContainer.value) {
		initCanvas(sketch, canvasContainer.value);
	}
});

watch(
	() => props.isPlaying,
	(newVal) => {
		if (p5Instance.value) {
			if (newVal) p5Instance.value.loop();
			else p5Instance.value.noLoop();
		}
	},
);
</script>

<template>
  <div ref="canvasContainer"></div>
</template>
