<script setup lang="ts">
import cytoscape, { EdgeSingular, NodeSingular } from 'cytoscape';
import { ref, onMounted, watch } from 'vue';

/**
 * Using the reference: https://github.com/cytoscape/cytoscape.js/blob/master/documentation/demos/animated-bfs/code.js
 */
const cy = ref<cytoscape.Core | null>(null);

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
        { data: { id: 'B-E', weight: 4, source: 'B', target: 'E' } },
        { data: { id: 'B-C', weight: 5, source: 'B', target: 'C' } },
        { data: { id: 'C-E', weight: 6, source: 'C', target: 'E' } },
        { data: { id: 'C-D', weight: 2, source: 'C', target: 'D' } },
        { data: { id: 'D-E', weight: 7, source: 'D', target: 'E' } }
      ]
    },

    layout: {
      name: 'circle',
      padding: 10
    },

    zoomingEnabled: false,
    userZoomingEnabled: false,
  });

  const bfs = cy.value.elements().bfs({
    roots: '#A',
    visit: function(){}, // leave visit empty because we're using highlightNextEle instead - see example 
    directed: true
  });

  let i = 0;
  const highlightNextEle = () =>{
    if (props.graphAnimating && i < bfs.path.length) {
      bfs.path[i].addClass('visited');
    i++;
    setTimeout(highlightNextEle, 500);
  }
};

// kick off
watch(() => props.graphAnimating, () => highlightNextEle())
});
</script>

<template>
  <div id="cy"></div>
</template>

<style scoped>
#cy {
  width: 100%;
  height: 620px; 
}
</style>