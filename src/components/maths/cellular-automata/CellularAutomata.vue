<script setup lang="ts">

import p5 from "p5"
const sketch = (p5: p5) => {
  p5.setup = () => {
    p5.createCanvas(500, 500)

  }
  p5.draw = () => {
    p5.background("#233140")
  }
}
</script>
<template>
  <P5 :sketch="sketch" />
</template>

<style scoped>

</style>