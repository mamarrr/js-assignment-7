<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppEmptyState from '@/components/AppEmptyState.vue'

const route = useRoute()

const status = computed(() => Number(route.meta.status ?? 500))
const title = computed(() => String(route.meta.title ?? 'Request failed'))
const message = computed(() => {
  if (status.value === 403) return 'You do not have access to this workspace action.'
  if (status.value === 404) return 'The requested item was not found.'
  return 'The page could not complete the requested operation.'
})
</script>

<template>
  <section class="status-view">
    <AppEmptyState :title="title" :message="message">
      <template #actions>
        <RouterLink class="button button--secondary" to="/workspaces">Choose workspace</RouterLink>
      </template>
    </AppEmptyState>
  </section>
</template>

<style scoped>
.status-view {
  display: grid;
  gap: 1rem;
}
</style>
