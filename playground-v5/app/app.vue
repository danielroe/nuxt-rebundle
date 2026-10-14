<script setup lang="ts">
const multiplier = 2
const { data } = await useAsyncData('rebundled', async () => {
  const value = 21 * multiplier
  return `rebundled ${value}`
})
</script>

<template>
  <div>{{ data }}</div>
</template>
