<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppEmptyState from '@/components/AppEmptyState.vue'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppLoading from '@/components/AppLoading.vue'
import { useWorkspaceStore } from '@/stores/workspace'

const workspaceStore = useWorkspaceStore()
const loaded = ref(false)

onMounted(async () => {
  await workspaceStore.ensureStartupLoaded()
  loaded.value = true
})
</script>

<template>
  <main class="auth-page">
    <section class="auth-card auth-card--wide" aria-labelledby="onboarding-title">
      <div class="auth-card__header">
        <p class="eyebrow">Onboarding</p>
        <h1 id="onboarding-title">Choose how to continue</h1>
        <p>Set up access to a management company workspace.</p>
      </div>

      <AppLoading v-if="!loaded || workspaceStore.loading" label="Loading onboarding options..." />
      <AppErrorAlert v-else-if="workspaceStore.lastError" :error="workspaceStore.lastError" />

      <template v-else>
        <AppEmptyState
          v-if="workspaceStore.hasUsableWorkspace"
          title="Workspace access is available"
          message="You can continue to workspace selection or request another company access."
        >
          <template #actions>
            <RouterLink class="button" to="/workspaces">Choose workspace</RouterLink>
          </template>
        </AppEmptyState>

        <div class="choice-grid">
          <article v-if="workspaceStore.canCreateManagementCompany" class="panel">
            <h2>New management company</h2>
            <p>Register your company and create the first management workspace.</p>
            <RouterLink class="button" to="/onboarding/new-management-company"
              >Start setup</RouterLink
            >
          </article>

          <article v-if="workspaceStore.canJoinManagementCompany" class="panel">
            <h2>Join an existing company</h2>
            <p>Request employee access with the company registry code and requested role.</p>
            <RouterLink class="button button--secondary" to="/onboarding/join-management-company">
              Open request
            </RouterLink>
          </article>
        </div>

        <AppEmptyState
          v-if="
            !workspaceStore.canCreateManagementCompany && !workspaceStore.canJoinManagementCompany
          "
          title="No onboarding actions are available"
          message="Your account does not currently have an available onboarding action."
        />
      </template>
    </section>
  </main>
</template>
