<template>
  <Toolbar class="toolbar">
    <template #start>
      <span class="pi pi-sitemap mr-1"></span>
      <span class="text-white">Layout:</span>
      <select
        :value="layout"
        @change="(e) => layout = (e.target as HTMLSelectElement).value"
        class="p-2 rounded-md bg-transparent text-white"
      >
        <option v-for="opt in layoutOptions">{{ opt }}</option>
      </select>
      <select
        :value="selectedSearch.name"
        @change="(e) => updateSearchStrategy((e.target as HTMLSelectElement).value)"
        class="p-2 rounded-md bg-transparent text-white"
      >
        <option v-for="strat in searchStrategies">{{ strat.name }}</option>
      </select>
    </template>
    <template #end>
		<Button 
        label="Randomise" 
        icon="pi pi-refresh" 
        @click="randomiseGraph"
		icon-class="mr-1"
        class="mr-4"
      />
      <Button 
        :icon="inDrawMode ? 'pi pi-pencil' : 'pi pi-eye'" 
        icon-class="mr-1" 
        :label="inDrawMode ? 'In draw mode' : 'In view mode'" 
        @click="inDrawMode = !inDrawMode"  
      />
      <Button :label="loop ? 'On loop' : 'Single play'" icon-class="mr-1" :icon="loop ? 'pi pi-equals' : 'pi pi-minus'" @click="loop = !loop" class="ml-4"/>
    </template>
  </Toolbar>
  <div id="cy" class="border"></div>
</template>

<script setup lang="ts">
import { Header } from "@tonejs/midi"
import { Note } from "@tonejs/midi/dist/Note"
import cytoscape from "cytoscape"
// @ts-ignore
import edgehandles from "cytoscape-edgehandles"
import { Toolbar } from "primevue"
import Button from "primevue/button"
import * as Tone from "tone"
import { TransportClass } from "tone/build/esm/core/clock/Transport"
import { onMounted, ref, watch } from "vue"
import { baseNotes } from "../../composables/useKeyboardGenerator"

const cy = ref<cytoscape.Core | null>(null)

const searchStrategies = [
	{
		name: "Breath-First Search (BFS)",
		shorthand: "bfs",
	},
	{
		name: "Depth-First Search (DFS)",
		shorthand: "dfs",
	},
	// {
	//   name: "A* Search", shorthand: "aStar"
	// }
]
const selectedSearch = ref(searchStrategies[0])
const inDrawMode = ref(false)
const root = ref("") // leave blank to allow user to opt-out of graph search
const loop = ref(false)

const layoutOptions = ref([
	"breadthfirst",
	"grid",
	"random",
	"circle",
	"concentric",
	"cose",
])
const layout = ref(layoutOptions.value[0])

const updateSearchStrategy = (value: string) => {
	selectedSearch.value = searchStrategies.filter((v) => v.name === value)[0]
}

const props = defineProps<{
	isPlaying: boolean
	pressedKeys: Set<Note>
	transport: TransportClass
}>()

const emit = defineEmits<{
	(
		e: "cellToggled",
		payload: { note: Note; isOn: boolean; source: string },
	): void
	(e: "gridUpdated", activeNotes: Set<Note>, source: string): void
	(e: "gridIsClear", source: string): void
}>()

cytoscape.use(edgehandles)

/**
 * Using the reference: https://github.com/cytoscape/cytoscape.js/blob/master/documentation/demos/animated-bfs/code.js
 */
onMounted(() => {
	cy.value = cytoscape({
		container: document.getElementById("cy"),

		boxSelectionEnabled: false,
		autounselectify: true,

		style: [
			{
				selector: "node",
				style: {
					label: "data(id)",
					color: "#213547",
					"background-color": "#fff",
					"font-size": 16,
					"font-weight": "bold",
					"text-valign": "center",
					"text-halign": "center",
				},
			},
			{
				selector: "edge",
				style: {
					"curve-style": "bezier",
					"target-arrow-shape": "triangle",
					"line-color": "#fff",
					"target-arrow-color": "#fff",
					"line-opacity": 1,
					label: "data(weight)",
					color: "#fff",
					"font-size": 20,
					"font-weight": "bold",
					"text-rotation": "autorotate",
					"text-margin-y": -20,
				},
			},
			{
				selector: "node.visited",
				style: {
					"background-color": "pink",
					"line-color": "pink",
					"target-arrow-color": "pink",
					"transition-property":
						"background-color, line-color, target-arrow-color",
					"transition-duration": 0,
				},
			},
			{
				selector: "edge.visited",
				style: {
					"line-color": "pink",
					color: "pink",
					"target-arrow-color": "pink",
					"transition-property": "line-color, target-arrow-color",
					"transition-duration": 0.5,
				},
			},
			{
				selector: ".eh-handle",
				style: {
					"background-color": "lightpink",
					width: 12,
					height: 12,
					shape: "ellipse",
					"overlay-opacity": 0,
					"border-width": 12, // makes the handle easier to hit
					"border-opacity": 0,
				},
			},

			{
				selector: ".eh-hover",
				style: {
					"background-color": "lightskyblue",
				},
			},

			{
				selector: ".eh-source",
				style: {
					"border-width": 2,
					"border-color": "lightpink",
					"background-color": "lightpink",
				},
			},

			{
				selector: ".eh-target",
				style: {
					"border-width": 2,
					"border-color": "lightpink",
				},
			},

			{
				selector: ".eh-preview, .eh-ghost-edge",
				style: {
					"background-color": "lightpink",
					"line-color": "lightpink",
					"target-arrow-color": "lightpink",
					"source-arrow-color": "lightpink",
				},
			},

			{
				selector: ".eh-ghost-edge.eh-preview-active",
				style: {
					opacity: 0,
				},
			},
		],
		elements: {
			nodes: [
				// Lower octave (3)
				{ data: { id: "A3" } },
				{ data: { id: "B3" } },
				{ data: { id: "C3" } },
				{ data: { id: "D3" } },
				{ data: { id: "E3" } },
				{ data: { id: "F3" } },
				{ data: { id: "G3" } },
				{ data: { id: "C#3" } },
				{ data: { id: "F#3" } },

				// Middle octave (4) - most common
				{ data: { id: "C4" } },
				{ data: { id: "D4" } },
				{ data: { id: "E4" } },
				{ data: { id: "F4" } },
				{ data: { id: "G4" } },
				{ data: { id: "A4" } },
				{ data: { id: "B4" } },
				{ data: { id: "C#4" } },
				{ data: { id: "F#4" } },

				// Higher octave (5)
				{ data: { id: "C5" } },
				{ data: { id: "D5" } },
				{ data: { id: "E5" } },
				{ data: { id: "F5" } },
				{ data: { id: "G5" } },
			],

			edges: [
				// Octave transitions (same note, different octaves)
				{ data: { id: "C3-C4", source: "C3", target: "C4" } },
				{ data: { id: "C4-C5", source: "C4", target: "C5" } },
				{ data: { id: "G3-G4", source: "G3", target: "G4" } },
				{ data: { id: "G4-G5", source: "G4", target: "G5" } },

				// Common transitions within octave 3
				{ data: { id: "C3-E3", source: "C3", target: "E3" } },
				{ data: { id: "E3-G3", source: "E3", target: "G3" } },
				{ data: { id: "G3-C#3", source: "G3", target: "C#3" } },
				{ data: { id: "F#3-A3", source: "F#3", target: "A3" } },

				// Common transitions within octave 4
				{ data: { id: "C4-E4", source: "C4", target: "E4" } },
				{ data: { id: "E4-G4", source: "E4", target: "G4" } },
				{ data: { id: "G4-C#4", source: "G4", target: "C#4" } },
				{ data: { id: "C#4-F4", source: "C#4", target: "F4" } },
				{ data: { id: "F4-A4", source: "F4", target: "A4" } },
				{ data: { id: "A4-D4", source: "A4", target: "D4" } },
				{ data: { id: "D4-B4", source: "D4", target: "B4" } },
				{ data: { id: "F#4-A4", source: "F#4", target: "A4" } },

				// common transitions within octave 5
				{ data: { id: "C5-E5", source: "C5", target: "E5" } },
				{ data: { id: "E5-G5", source: "E5", target: "G5" } },

				// Cross-octave transitions
				{ data: { id: "G3-C4", source: "G3", target: "C4" } },
				{ data: { id: "B3-E4", source: "B3", target: "E4" } },
				{ data: { id: "G4-C5", source: "G4", target: "C5" } },
				{ data: { id: "B4-E5", source: "B4", target: "E5" } },

				// graph connectivity
				{ data: { id: "C3-G3", source: "C3", target: "G3" } },
				{ data: { id: "E4-A4", source: "E4", target: "A4" } },
				{ data: { id: "D4-G4", source: "D4", target: "G4" } },
				{ data: { id: "F4-C5", source: "F4", target: "C5" } },
				{ data: { id: "A4-E5", source: "A4", target: "E5" } },

				// sharp notes
				{ data: { id: "C#3-F#3", source: "C#3", target: "F#3" } },
				{ data: { id: "C#4-F#4", source: "C#4", target: "F#4" } },
				{ data: { id: "F#3-C#4", source: "F#3", target: "C#4" } },
			],
		},

		layout: {
			name: "breadthfirst",
		},

		zoomingEnabled: true,
		userZoomingEnabled: true,
	})

	// enable the edgehandles extension by default
	const eh = (cy.value as any).edgehandles({
		preview: true,
		handleNodes: "node",
		handleInDrawMode: true,
	})

	const determineStrategy = (cy: cytoscape.Core) => {
		if (!root.value) {
			console.log("No root node selected yet")
			return { strategy: null }
		}

		switch (selectedSearch.value.shorthand) {
			case "dfs": {
				console.log("Performing DFS...")
				const dfs = cy.elements().dfs({
					roots: root.value,
					visit: () => {},
					directed: true,
				})
				return { strategy: dfs }
			}
			default: {
				console.log("Performing BFS...")
				const bfs = cy.elements().bfs({
					roots: root.value,
					visit: () => {},
					directed: true,
				})
				return { strategy: bfs }
			}
		}
	}

	if (!cy) return

	let i = 0
	let strategy = determineStrategy(cy.value)?.strategy
	const highlightNextEle = () => {
		if (!strategy) return

		if (cy.value && props.isPlaying && i < strategy.path.length) {
			const element = strategy.path[i]
			element.addClass("visited")

			if (element.isNode()) {
				emit("gridUpdated", new Set([createNoteFromId(element.id())]), "graph")
			}

			i++
			// Convert transport time to milliseconds
			const timeInMs = 60000 / props.transport.bpm.value / 2 // Quarter note timing
			setTimeout(highlightNextEle, timeInMs)
		} else if (props.isPlaying && loop.value) {
			i = 0
			cy.value?.elements().removeClass("visited")
			const timeInMs = 60000 / props.transport.bpm.value / 2
			setTimeout(highlightNextEle, timeInMs)
		} else if (i >= strategy.path.length) {
			i = 0
			if (!loop.value) {
				emit("gridIsClear", "graph")
				props.pressedKeys.clear()
				cy.value?.elements().removeClass("visited")
				root.value = ""
				strategy = null
			}
		}
	}

	// kick off
	watch(
		() => props.isPlaying,
		() => highlightNextEle(),
	)
	watch(layout, () => {
		console.log("Layout changed to", layout.value)
		cy.value?.layout({ name: layout.value }).run()
	})
	watch(inDrawMode, () => {
		if (inDrawMode.value) eh.enableDrawMode()
		else eh.disableDrawMode()
	})

	cy?.value.on("click", "node", (evt) => {
		const node = evt.target
		root.value = `#${node.id().replace("#", "\\#")}`

		console.log("Setting root to", node.id())

		cy.value?.elements().removeClass("visited")
		cy.value?.elements().$id(root.value.substring(1)).addClass("visited")
		node.addClass("visited")

		// Emit selected root note
		emit("cellToggled", {
			note: createNoteFromId(node.id()),
			isOn: true,
			source: "graph",
		})

		i = 0

		if (cy.value) {
			const newStrategy = determineStrategy(cy.value)?.strategy
			strategy = newStrategy
		}
	})

	watch(
		() => props.isPlaying,
		(newVal) => {
			if (!newVal) {
				Array.from(props.pressedKeys).forEach((note) => {
					emit("cellToggled", { note, isOn: false, source: "graph" })
					cy.value?.elements().removeClass("visited")
				})
			}
		},
	)

	watch(
		() => props.pressedKeys,
		(newVal) => {
			if (newVal.size === 0) {
				cy.value?.elements().removeClass("visited")
				i = 0
			}
		},
	)

	// Add a watch for loop changes to reset state if needed
	watch(
		() => loop.value,
		(newVal) => {
			if (!newVal) {
				cy.value?.elements().removeClass("visited")
				i = 0
			}
		},
	)
})

// should be in a composable
const createNoteFromId = (id: string): Note => {
	console.log("Creating note from id", id)
	return new Note(
		{
			midi: Tone.Frequency(id).toMidi(),
			velocity: 0.8,
			ticks: props.transport.toTicks(),
		},
		{
			ticks: Tone.Time("4n").toTicks(),
			velocity: 0.5,
		},
		new Header(),
	)
}

const generateRandomGraph = () => {
	const octaves = [4, 5]
	const nodes: cytoscape.NodeDefinition[] = []
	const edges: cytoscape.EdgeDefinition[] = []

	octaves.forEach((octave) => {
		baseNotes.forEach((note) => {
			nodes.push({
				data: { id: `${note}${octave}` },
			})
		})
	})

	nodes.forEach((node) => {
		// generate 2-3 random connections for each node
		const numConnections = 2 + Math.floor(Math.random() * 2)
		for (let i = 0; i < numConnections; i++) {
			const target = nodes[Math.floor(Math.random() * nodes.length)]
			if (target.data.id !== node.data.id) {
				edges.push({
					data: {
						id: `${node.data.id}-${target.data.id}`,
						source: node.data.id || "",
						target: target.data.id || "",
					},
				})
			}
		}
	})

	return { nodes, edges }
}

const randomiseGraph = () => {
	if (!cy.value) return

	const { nodes, edges } = generateRandomGraph()
	cy.value.elements().remove()
	cy.value.add([...nodes, ...edges])
	cy.value.layout({ name: layout.value }).run()
}
</script>

<style scoped>
#cy {
  width: 100%;
  height: 620px; 
}

.toolbar {
  @apply w-full mb-3;
}


</style>