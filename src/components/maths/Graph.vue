<template>
  <Toolbar class="toolbar">
    <template #center>
      <Button 
        :icon="inDrawMode ? 'pi pi-pencil' : 'pi pi-eye'" 
        icon-class="mr-1" 
        :label="inDrawMode ? 'In draw mode' : 'In view mode'" 
        @click="inDrawMode = !inDrawMode"  
      />
    </template>
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
    </template>
    <template #end>
      <select
        :value="selectedSearch.name"
        @change="(e) => updateSearchStrategy((e.target as HTMLSelectElement).value)"
        class="p-2 rounded-md bg-transparent text-white"
      >
        <option v-for="strat in searchStrategies">{{ strat.name }}</option>
      </select>
    </template>
  </Toolbar>
  <div id="cy" class="border"></div>
</template>

<script setup lang="ts">
import cytoscape from "cytoscape"
// @ts-ignore
import edgehandles from "cytoscape-edgehandles"
import { Toolbar } from "primevue"
import Button from "primevue/button"
import { onMounted, ref, watch } from "vue"
/**
 * Using the reference: https://github.com/cytoscape/cytoscape.js/blob/master/documentation/demos/animated-bfs/code.js
 */
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
const root = ref("#C4")

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
	graphAnimating: boolean
}>()

cytoscape.use(edgehandles)

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
					"background-color": "#61bffc",
					"line-color": "#61bffc",
					"target-arrow-color": "#61bffc",
					"transition-property":
						"background-color, line-color, target-arrow-color",
					"transition-duration": 0.5,
				},
			},
			{
				selector: "edge.visited",
				style: {
					"line-color": "#61bffc",
					color: "#61bffc",
					"target-arrow-color": "#61bffc",
					"transition-property": "line-color, target-arrow-color",
					"transition-duration": 0.5,
				},
			},
			{
				selector: ".eh-handle",
				style: {
					"background-color": "lightskyblue",
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
					"border-color": "lightskyblue",
					"background-color": "lightskyblue",
				},
			},

			{
				selector: ".eh-target",
				style: {
					"border-width": 2,
					"border-color": "lightskyblue",
				},
			},

			{
				selector: ".eh-preview, .eh-ghost-edge",
				style: {
					"background-color": "lightskyblue",
					"line-color": "lightskyblue",
					"target-arrow-color": "lightskyblue",
					"source-arrow-color": "lightskyblue",
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
				console.error("Not a valid search strategy! Defaulting to BFS...")

				const bfs = cy.elements().bfs({
					roots: root.value,
					visit: () => {}, // leave visit empty because we're using highlightNextEle instead - see example
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
		if (cy.value && props.graphAnimating && i < strategy.path.length) {
			strategy.path[i].addClass("visited")
			i++
			setTimeout(highlightNextEle, 500)
		}
	}

	// kick off
	watch(
		() => props.graphAnimating,
		() => highlightNextEle(),
	)
	watch(layout, () => {
		cy.value?.layout({ name: layout.value }).run()
	})
	watch(inDrawMode, () => {
		if (inDrawMode.value) eh.enableDrawMode()
		else eh.disableDrawMode()
	})

	cy?.value.on("dblclick", "node", (evt) => {
		const node = evt.target
		root.value = `#${node.id()}`

		console.log("Setting root to", node.id())

		cy.value?.elements().removeClass("visited")
		cy.value?.elements().$id(root.value).addClass("visited")
		node.addClass("visited")

		i = 0

		if (cy.value) {
			const newStrategy = determineStrategy(cy.value)?.strategy
			strategy = newStrategy
		}
	})
})
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