<script setup lang="ts">
defineProps<{
  errors?: string[] | string
}>()
</script>

<template>
  <ul v-if="Array.isArray(errors) && errors.length" class="field-errors" aria-live="polite">
    <li v-for="error in errors" :key="error">{{ error }}</li>
  </ul>
  <p
    v-else-if="typeof errors === 'string' && errors.length"
    class="field-errors"
    aria-live="polite"
  >
    {{ errors }}
  </p>
</template>
