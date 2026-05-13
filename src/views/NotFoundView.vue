<template>
  <OperationalLayout
    title="Page not found"
    description="The requested route is not available in the frontend shell."
    :breadcrumbs="[{ label: 'Not found' }]"
  >
    <AppEmptyState title="No matching page" message="Check the address and try again." />
  </OperationalLayout>
</template>

<script setup lang="ts">
import AppEmptyState from '@/components/AppEmptyState.vue'
import OperationalLayout from '@/layouts/OperationalLayout.vue'
</script>
