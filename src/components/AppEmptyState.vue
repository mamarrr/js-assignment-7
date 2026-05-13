<script setup lang="ts">
defineProps<{
  title: string
  message?: string
}>()
</script>

<template>
  <section class="empty-state">
    <div class="empty-state__body">
      <h2>{{ title }}</h2>
      <p v-if="message">{{ message }}</p>
      <div v-if="$slots.actions" class="empty-state__actions">
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>
