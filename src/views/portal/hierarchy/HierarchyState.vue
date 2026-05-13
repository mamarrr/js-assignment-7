<script setup lang="ts">
import type { ApiError } from '@/api/errors'

defineProps<{
  loading?: boolean
  error?: ApiError | null
  empty?: boolean
  emptyTitle?: string
  emptyText?: string
}>()
</script>

<template>
  <div v-if="loading" class="hierarchy-state" role="status">Loading...</div>

  <section v-else-if="error" class="hierarchy-alert hierarchy-alert-error" role="alert">
    <strong>{{ error.status === 403 ? 'Access denied' : error.status === 404 ? 'Not found' : error.title }}</strong>
    <p>{{ error.message }}</p>
    <details v-if="error.traceId">
      <summary>Technical details</summary>
      <code>Trace ID: {{ error.traceId }}</code>
    </details>
  </section>

  <section v-else-if="empty" class="hierarchy-state">
    <strong>{{ emptyTitle ?? 'No records found' }}</strong>
    <p>{{ emptyText ?? 'Create the first record to get started.' }}</p>
  </section>

  <slot v-else />
</template>

<style scoped>
.hierarchy-state,
.hierarchy-alert {
  border: 1px solid #d6dde8;
  border-radius: 8px;
  padding: 1rem;
  background: #f8fafc;
  color: #253044;
}

.hierarchy-alert-error {
  border-color: #f3b9b9;
  background: #fff5f5;
}

.hierarchy-alert p,
.hierarchy-state p {
  margin: 0.35rem 0 0;
  color: #5d687a;
}
</style>

