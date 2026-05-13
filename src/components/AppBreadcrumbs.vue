<script setup lang="ts">
import type { BreadcrumbItem } from '@/types/ui'

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav v-if="items.length" class="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li v-for="(item, index) in items" :key="`${item.label}-${index}`">
        <RouterLink v-if="item.to && index < items.length - 1" :to="item.to">{{ item.label }}</RouterLink>
        <span v-else>{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
