<template>
  <Toolbar class="toolbar">
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
import { Toolbar, Button, Select } from 'primevue';
import { ref, onMounted, watch } from 'vue';

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

const updateSearchStrategy = (value: string) => {
  
}
const props = defineProps<{
  graphAnimating: boolean
}>()

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
        { data: { id: 'A-E', weight: 1, source: 'A', target: 'E' } },
        { data: { id: 'A-B', weight: 3, source: 'A', target: 'B' } },
        { data: { id: 'B-E', weight: 4, source: 'B', target: 'D' } },
        { data: { id: 'B-C', weight: 5, source: 'B', target: 'C' } },
        { data: { id: 'C-E', weight: 6, source: 'C', target: 'E' } },
        { data: { id: 'C-D', weight: 2, source: 'C', target: 'D' } },
        { data: { id: 'D-E', weight: 7, source: 'D', target: 'E' } }
      ]
    },

    layout: {
      name: 'grid',
      padding: 10
    },

    zoomingEnabled: false,
    userZoomingEnabled: false,
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
});
</script>

<style scoped>
#cy {
  width: 100%;
  height: 620px; 
}

.search-select {
  @apply w-full md:w-52 text-end gap-2 mb-3
}

</style>