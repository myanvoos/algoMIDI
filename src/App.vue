<script setup lang="ts">
import { Analytics } from "@vercel/analytics/vue"
import Studio from "./components/Studio.vue"
</script>

<template>
  <div>
    <Studio />
    <Analytics />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
