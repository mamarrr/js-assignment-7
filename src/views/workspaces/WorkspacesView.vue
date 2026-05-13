<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppEmptyState from '@/components/AppEmptyState.vue'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppLoading from '@/components/AppLoading.vue'
import { isApiError, type ApiError } from '@/api/errors'
import {
  useWorkspaceStore,
  workspaceOptionPath,
  workspaceRedirectPath,
} from '@/stores/workspace'
import type { WorkspaceOptionDto } from '@/types/api'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loaded = ref(false)
const selectError = ref<ApiError | null>(null)
const selectedId = ref<string | null>(null)

const workspaceKey = (option: WorkspaceOptionDto) =>
  option.id ?? option.workspaceId ?? option.contextId ?? option.path ?? option.name ?? ''

const groups = computed(() => {
  const groupedKeys = new Set(
    [...workspaceStore.managementCompanies, ...workspaceStore.customers, ...workspaceStore.residents].map(workspaceKey),
  )
  const otherOptions = workspaceStore.workspaceOptions.filter((option) => !groupedKeys.has(workspaceKey(option)))

  return [
    { title: 'Management companies', items: workspaceStore.managementCompanies },
    { title: 'Customers', items: workspaceStore.customers },
    { title: 'Residents', items: workspaceStore.residents },
    { title: 'Other workspaces', items: otherOptions },
  ].filter((group) => group.items.length > 0)
})

const optionTitle = (option: WorkspaceOptionDto) => option.name ?? option.displayName ?? option.slug ?? 'Workspace'

const optionMeta = (option: WorkspaceOptionDto) =>
  [
    option.contextType,
    option.managementCompanySlug ? `Company: ${option.managementCompanySlug}` : undefined,
    option.isDefault ? 'Default' : undefined,
  ].filter(Boolean).join(' | ')

const enterWorkspace = async (option: WorkspaceOptionDto) => {
  selectError.value = null
  selectedId.value = workspaceKey(option)

  try {
    const redirect = await workspaceStore.selectWorkspace(option)
    await router.replace(workspaceRedirectPath(redirect) ?? workspaceOptionPath(option) ?? workspaceStore.defaultPath ?? '/')
  } catch (error) {
    selectError.value = isApiError(error)
      ? error
      : {
          status: 0,
          title: 'Workspace selection failed',
          message: 'Unable to enter this workspace. Try again or choose another workspace.',
          fieldErrors: {},
          raw: error,
        }
  } finally {
    selectedId.value = null
  }
}

onMounted(async () => {
  await workspaceStore.ensureStartupLoaded()
  loaded.value = true
})
</script>

<template>
  <main class="auth-page">
    <section class="auth-card auth-card--wide" aria-labelledby="workspaces-title">
      <div class="auth-card__header">
        <p class="eyebrow">Workspaces</p>
        <h1 id="workspaces-title">Choose a workspace</h1>
        <p>Select the management context you want to work in.</p>
      </div>

      <AppLoading v-if="!loaded || workspaceStore.loading" label="Loading workspaces..." />
      <AppErrorAlert v-else-if="workspaceStore.lastError" :error="workspaceStore.lastError" />
      <AppErrorAlert v-if="selectError" :error="selectError" />

      <template v-if="loaded && !workspaceStore.loading && !workspaceStore.lastError">
        <AppEmptyState
          v-if="!workspaceStore.hasUsableWorkspace"
          title="No usable workspace found"
          message="Create a management company or request access to an existing company."
        >
          <template #actions>
            <RouterLink class="button" to="/onboarding">Open onboarding</RouterLink>
          </template>
        </AppEmptyState>

        <div v-else class="workspace-groups">
          <section v-for="group in groups" :key="group.title" class="workspace-group">
            <h2>{{ group.title }}</h2>
            <div class="workspace-grid">
              <article v-for="option in group.items" :key="option.id ?? option.path ?? option.name" class="panel">
                <div>
                  <h3>{{ optionTitle(option) }}</h3>
                  <p v-if="optionMeta(option)">{{ optionMeta(option) }}</p>
                </div>
                <button
                  class="button"
                  type="button"
                  :disabled="selectedId === workspaceKey(option)"
                  @click="enterWorkspace(option)"
                >
                  {{ selectedId === workspaceKey(option) ? 'Entering...' : 'Enter workspace' }}
                </button>
              </article>
            </div>
          </section>
        </div>

        <div
          v-if="workspaceStore.canCreateManagementCompany || workspaceStore.canJoinManagementCompany"
          class="workspace-actions"
        >
          <RouterLink
            v-if="workspaceStore.canCreateManagementCompany"
            class="button button--secondary"
            to="/onboarding/new-management-company"
          >
            Create management company
          </RouterLink>
          <RouterLink
            v-if="workspaceStore.canJoinManagementCompany"
            class="button button--secondary"
            to="/onboarding/join-management-company"
          >
            Request company access
          </RouterLink>
        </div>
      </template>
    </section>
  </main>
</template>
