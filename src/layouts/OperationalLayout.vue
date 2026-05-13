<script setup lang="ts">
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'
import type { BreadcrumbItem } from '@/types/ui'

defineProps<{
  eyebrow?: string
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}>()
</script>

<template>
  <div class="app-shell">
    <header class="app-topbar">
      <RouterLink class="app-brand" to="/">Property operations</RouterLink>
      <div class="app-topbar__meta">
        <span>SPA foundation</span>
      </div>
    </header>

    <div class="app-body">
      <aside class="app-sidebar" aria-label="Primary navigation">
        <div class="app-sidebar__section">
          <p class="app-sidebar__label">Workspace</p>
          <RouterLink class="app-sidebar__link" to="/">Foundation</RouterLink>
        </div>
      </aside>

      <main class="app-main">
        <AppBreadcrumbs :items="breadcrumbs ?? []" />
        <header class="page-header">
          <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
          <h1>{{ title }}</h1>
          <p v-if="description">{{ description }}</p>
          <div v-if="$slots.actions" class="page-header__actions">
            <slot name="actions" />
          </div>
        </header>
        <slot />
      </main>
    </div>
  </div>
</template>
