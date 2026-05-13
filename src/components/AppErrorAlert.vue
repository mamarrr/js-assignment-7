<script setup lang="ts">
import type { ApiError } from '@/api/errors'

defineProps<{
  error?: ApiError | null
  title?: string
  message?: string
}>()
</script>

<template>
  <section v-if="error || title || message" class="alert alert--error" role="alert">
    <strong>{{ title ?? error?.title ?? 'Something went wrong' }}</strong>
    <p v-if="message || error?.message">{{ message ?? error?.message }}</p>
    <details v-if="error?.traceId" class="alert__details">
      <summary>Technical details</summary>
      <code>Trace ID: {{ error.traceId }}</code>
    </details>
  </section>
</template>
