<template>
  <Toolbar class="toolbar">
    <template #start>
      <Button 
        :icon="inDrawMode ? 'pi pi-pencil' : 'pi pi-eye'" 
        icon-class="mr-1" 
        :label="inDrawMode ? 'In draw mode' : 'In view mode'" 
        @click="inDrawMode = !inDrawMode"  
      />
    </template>
    <template #end>
      <select
        :value="selectedSearch.name"
        @change="(e) => updateSearchStrategy((e.target as HTMLSelectElement).value)"
        class="w-full p-2 rounded-md bg-transparent text-white"
      >
        <option v-for="strat in searchStrategies">{{ strat.name }}</option>
      </select>
    </template>
  </Toolbar>
  <div id="cy" class="border"></div>
</template>

<script setup lang="ts">
import cytoscape, { EdgeSingular, NodeSingular } from 'cytoscape';
// @ts-ignore
import edgehandles from 'cytoscape-edgehandles'
import { Toolbar } from 'primevue';
import { ref, onMounted, watch } from 'vue';
import Button from "primevue/button";
/**
 * Using the reference: https://github.com/cytoscape/cytoscape.js/blob/master/documentation/demos/animated-bfs/code.js
 */
const cy = ref<cytoscape.Core | null>(null);

const searchStrategies = [
  {
    name: "Breath-First Search (BFS)", shorthand: "bfs",
  },
  {
    name: "Depth-First Search (DFS)", shorthand: "dfs",
  },
  // {
  //   name: "A* Search", shorthand: "aStar"
  // }
]
const selectedSearch = ref(searchStrategies[0])
const inDrawMode = ref(false)

const updateSearchStrategy = (value: string) => {
  selectedSearch.value = searchStrategies.filter(v => v.name === value)[0]
}


const props = defineProps<{
  graphAnimating: boolean
}>()

cytoscape.use( edgehandles )

onMounted(() => {
  cy.value = cytoscape({
    container: document.getElementById('cy'),

    boxSelectionEnabled: false,
    autounselectify: true,

    style: [
        {
            selector: 'node',
            style: {
                'label': 'data(id)',
                'color': '#213547',
                'background-color': '#fff',
                'font-size': 16,
                'font-weight': 'bold',
                'text-valign': 'center',
                'text-halign': 'center'
            }
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'line-color': '#fff',
                'target-arrow-color': '#fff',
                'line-opacity': 1,
                'label': 'data(weight)',
                'color': '#fff',
                'font-size': 20,
                'font-weight': 'bold',
                'text-rotation': 'autorotate',
                'text-margin-y': -20,
            }
        },
        {
            selector: 'node.visited',
            style: {
                'background-color': '#61bffc',
                'line-color': '#61bffc',
                'target-arrow-color': '#61bffc',
                'transition-property': 'background-color, line-color, target-arrow-color',
                'transition-duration': 0.5
            }
        },
        {
            selector: 'edge.visited',
            style: {
                'line-color': '#61bffc',
                'color': '#61bffc',
                'target-arrow-color': '#61bffc',
                'transition-property': 'line-color, target-arrow-color',
                'transition-duration': 0.5
            }
        },
        {
              selector: '.eh-handle',
              style: {
                'background-color': 'lightskyblue',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12, // makes the handle easier to hit
                'border-opacity': 0
              }
            },

            {
              selector: '.eh-hover',
              style: {
                'background-color': 'lightskyblue'
              }
            },

            {
              selector: '.eh-source',
              style: {
                'border-width': 2,
                'border-color': 'lightskyblue',
                'background-color': 'lightskyblue'
              }
            },

            {
              selector: '.eh-target',
              style: {
                'border-width': 2,
                'border-color': 'lightskyblue'
              }
            },

            {
              selector: '.eh-preview, .eh-ghost-edge',
              style: {
                'background-color': 'lightskyblue',
                'line-color': 'lightskyblue',
                'target-arrow-color': 'lightskyblue',
                'source-arrow-color': 'lightskyblue'
              }
            },

            {
              selector: '.eh-ghost-edge.eh-preview-active',
              style: {
                'opacity': 0
              }
            }

    ],
    elements: {
      nodes: [
        { data: { id: 'A' } },
        { data: { id: 'B' } },
        { data: { id: 'C' } },
        { data: { id: 'D' } },
        { data: { id: 'E' } }
      ],

      edges: [
        // TODO: Add weights back in, currently removed for simplicity
        { data: { id: 'A-E', source: 'A', target: 'E' } },
        { data: { id: 'A-B', source: 'A', target: 'B' } },
        { data: { id: 'B-E', source: 'B', target: 'D' } },
        { data: { id: 'B-C', source: 'B', target: 'C' } },
        { data: { id: 'C-E', source: 'C', target: 'E' } },
        { data: { id: 'C-D', source: 'C', target: 'D' } },
        { data: { id: 'D-E', source: 'D', target: 'E' } }
      ]
    },

    layout: {
      name: 'grid',
      padding: 10
    },

    zoomingEnabled: false,
    userZoomingEnabled: false,
    
  });

  // enable the edgehandles extension by default
  const eh = (cy.value as any).edgehandles({
    preview: true,
    handleNodes: "node",
    handleInDrawMode: true
  });


  const determineStrategy = (cy: cytoscape.Core) => {
    switch (selectedSearch.value.shorthand) {
      case 'dfs':
        console.log('Performing DFS...')
        const dfs = cy.elements().dfs({
          roots: '#A',
          visit: () => {},
          directed: true
        })

        return { strategy: dfs }
      default:
        console.error('Not a valid search strategy! Defaulting to BFS...')

        const bfs = cy.elements().bfs({
          roots: '#A',
          visit: () => {}, // leave visit empty because we're using highlightNextEle instead - see example 
          directed: true
        });

        return { strategy: bfs }
    }
  }
  
  if (!cy) return

  let i = 0;
  const strategy = determineStrategy(cy.value)?.strategy
  const highlightNextEle = () =>{
    if (cy.value && props.graphAnimating && i < strategy.path.length) {
      console.log(strategy)
      strategy.path[i].addClass('visited');
    i++;
    setTimeout(highlightNextEle, 500);
  }
};

// kick off
watch(() => props.graphAnimating, () => highlightNextEle())
watch(inDrawMode, () => {
    if (inDrawMode.value) eh.enableDrawMode()
    else eh.disableDrawMode()
  })
});
</script>

<style scoped>
#cy {
  width: 100%;
  height: 620px; 
}

.search-select {
  @apply text-end gap-2 mb-3
}

</style>