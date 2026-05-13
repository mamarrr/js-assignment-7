<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="app-loading" role="status" aria-live="polite">
    <span class="app-loading__mark" aria-hidden="true" />
    <span>{{ label ?? 'Loading...' }}</span>
  </div>
</template>
