<script setup lang="ts">
import cytoscape from 'cytoscape';
import { ref, onMounted } from 'vue';

const cy = ref<any>(null);

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
                'font-size': 14,
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
            }
        },
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
      name: 'grid',
      padding: 10
    },

    zoomingEnabled: false,
    userZoomingEnabled: false,
  });

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