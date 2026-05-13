<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import { scheduledWorkApi, type ScheduledWorkListDto } from '@/api/portal/scheduledWork'
import { formatDateTime, useOperationState, usePortalRouteParams } from './operationView'

const params = usePortalRouteParams()
const { loading, error, success, capture } = useOperationState()
const page = ref<ScheduledWorkListDto>()

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    page.value = await scheduledWorkApi.list(params.companySlug.value, params.ticketId.value)
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="operation-page">
    <header class="operation-header">
      <div>
        <p class="eyebrow">{{ page?.ticketNr }}</p>
        <h1>Scheduled work</h1>
        <p class="muted">{{ page?.ticketTitle }}</p>
      </div>
      <RouterLink class="primary" :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/new`">Create scheduled work</RouterLink>
    </header>

    <p v-if="success" class="alert success">{{ success }}</p>
    <AppErrorAlert v-if="error" :error="error" />

    <section class="panel">
      <p v-if="loading">Loading scheduled work...</p>
      <p v-else-if="(page?.items ?? []).length === 0" class="muted">No scheduled work has been added yet.</p>
      <table v-else>
        <thead><tr><th>Vendor</th><th>Status</th><th>Scheduled</th><th>Actual</th><th>Work logs</th><th></th></tr></thead>
        <tbody>
          <tr v-for="item in page?.items" :key="item.scheduledWorkId">
            <td>{{ item.vendorName || '-' }}</td>
            <td><span class="badge">{{ item.workStatusLabel || '-' }}</span></td>
            <td>{{ formatDateTime(item.scheduledStart) }} - {{ formatDateTime(item.scheduledEnd) }}</td>
            <td>{{ formatDateTime(item.realStart) }} - {{ formatDateTime(item.realEnd) }}</td>
            <td>{{ item.workLogCount ?? 0 }}</td>
            <td>
              <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${item.scheduledWorkId}`">Details</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style scoped>
.operation-page { display: grid; gap: 1rem; }
.operation-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.eyebrow, .muted { color: #667085; }
.eyebrow { margin: 0 0 .25rem; text-transform: uppercase; font-size: .75rem; font-weight: 700; }
.panel { border: 1px solid #d0d5dd; border-radius: 8px; padding: 1rem; background: #fff; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .7rem; border-bottom: 1px solid #eaecf0; text-align: left; }
.badge { display: inline-block; border: 1px solid #b2ddff; background: #eff8ff; border-radius: 999px; padding: .15rem .5rem; }
.primary { background: #155eef; color: #fff; border-radius: 6px; padding: .55rem .75rem; text-decoration: none; }
.alert { border-radius: 8px; padding: .8rem; }
.danger { background: #fef3f2; border: 1px solid #fecdca; }
.success { background: #ecfdf3; border: 1px solid #abefc6; }
</style>
