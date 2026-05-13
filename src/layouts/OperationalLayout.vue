<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'
import { usePortalShell } from '@/composables/portalShell'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useWorkspaceStore, workspaceRedirectPath } from '@/stores/workspace'
import type { BreadcrumbItem } from '@/types/ui'

defineProps<{
  eyebrow?: string
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}>()

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const notifications = useNotificationStore()
const router = useRouter()
const {
  breadcrumbs: routeBreadcrumbs,
  companySlug,
  mainNavigation,
  redirectPath,
  selectedCompanyName,
  selectedWorkspaceKey,
  workspaceOptions,
} = usePortalShell()

const switchingWorkspace = ref(false)
const loggingOut = ref(false)

const workspaceKey = (option: { id?: string; workspaceId?: string; contextId?: string }) =>
  option.id ?? option.workspaceId ?? option.contextId ?? ''

const switchWorkspace = async (event: Event) => {
  const key = (event.target as HTMLSelectElement).value
  const option = workspaceOptions.value.find((item) => workspaceKey(item) === key)
  if (!option || key === selectedWorkspaceKey.value) return

  switchingWorkspace.value = true
  try {
    const redirect = await workspaceStore.selectWorkspace(option)
    await router.push(workspaceRedirectPath(redirect) ?? redirectPath())
    notifications.push({ tone: 'success', title: 'Workspace switched' })
  } catch (error) {
    notifications.push({
      tone: 'error',
      title: 'Workspace switch failed',
      message: error instanceof Error ? error.message : 'The workspace could not be selected.',
    })
  } finally {
    switchingWorkspace.value = false
  }
}

const logout = async () => {
  loggingOut.value = true
  try {
    await authStore.logout()
    await router.replace({ name: 'login' })
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="app-topbar">
      <div>
        <RouterLink class="app-brand" :to="redirectPath()">Property operations</RouterLink>
        <p class="app-topbar__context">{{ selectedCompanyName }}</p>
      </div>
      <div class="app-topbar__meta">
        <label class="workspace-switcher">
          <span>Workspace</span>
          <select :value="selectedWorkspaceKey" :disabled="switchingWorkspace" @change="switchWorkspace">
            <option v-for="option in workspaceOptions" :key="workspaceKey(option)" :value="workspaceKey(option)">
              {{ option.displayName ?? option.name ?? option.slug ?? option.companySlug ?? 'Workspace' }}
            </option>
          </select>
        </label>
        <span class="topbar-user">{{ authStore.displayName }}</span>
        <RouterLink class="topbar-link" :to="companySlug ? `/companies/${companySlug}/profile` : '/workspaces'">
          Profile
        </RouterLink>
        <button class="topbar-button" type="button" :disabled="loggingOut" @click="logout">
          {{ loggingOut ? 'Signing out...' : 'Logout' }}
        </button>
      </div>
    </header>

    <div class="app-body">
      <aside class="app-sidebar" aria-label="Primary navigation">
        <div class="app-sidebar__section">
          <p class="app-sidebar__label">Management</p>
          <RouterLink
            v-for="item in mainNavigation"
            :key="item.label"
            class="app-sidebar__link"
            :to="item.to"
            :end="item.label === 'Dashboard'"
          >
            {{ item.label }}
          </RouterLink>
        </div>
        <div class="app-sidebar__footer">
          <RouterLink class="app-sidebar__link" to="/workspaces">Switch workspace</RouterLink>
        </div>
      </aside>

      <main class="app-main">
        <AppBreadcrumbs :items="breadcrumbs ?? routeBreadcrumbs" />
        <header v-if="$slots.default" class="page-header">
          <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
          <h1 v-if="title">{{ title }}</h1>
          <p v-if="description">{{ description }}</p>
          <div v-if="$slots.actions" class="page-header__actions">
            <slot name="actions" />
          </div>
        </header>
        <slot />
        <RouterView v-if="!$slots.default" />
      </main>
    </div>
  </div>
</template>
