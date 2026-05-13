<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppConfirmationDialog from '@/components/AppConfirmationDialog.vue'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import { workLogsApi, type WorkLogDeleteModelDto, type WorkLogListDto } from '@/api/portal/workLogs'
import { formatDateTime, formatMoney, formatNumber, useOperationState, usePortalRouteParams } from './operationView'

const params = usePortalRouteParams()
const { loading, saving, error, success, capture, notifySuccess } = useOperationState()
const page = ref<WorkLogListDto>()
const deleteOpen = ref(false)
const deleteTargetId = ref('')
const deleteModel = ref<WorkLogDeleteModelDto>()

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    page.value = await workLogsApi.list(params.companySlug.value, params.ticketId.value, params.scheduledWorkId.value)
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

const deleteLog = async (workLogId?: string) => {
  if (!workLogId || saving.value) return
  saving.value = true
  error.value = undefined
  try {
    await workLogsApi.delete(params.companySlug.value, params.ticketId.value, params.scheduledWorkId.value, workLogId)
    notifySuccess('Work log deleted.')
    deleteOpen.value = false
    deleteTargetId.value = ''
    deleteModel.value = undefined
    await load()
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

const openDelete = async (workLogId?: string) => {
  if (!workLogId || saving.value) return
  saving.value = true
  error.value = undefined
  try {
    deleteModel.value = await workLogsApi.deleteModel(
      params.companySlug.value,
      params.ticketId.value,
      params.scheduledWorkId.value,
      workLogId,
    )
    deleteTargetId.value = workLogId
    deleteOpen.value = true
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="operation-page">
    <header class="operation-header">
      <div>
        <p class="eyebrow">{{ page?.ticketNr }}</p>
        <h1>Work logs</h1>
        <p class="muted">{{ page?.vendorName }} - {{ page?.workStatusLabel }}</p>
      </div>
      <RouterLink class="primary" :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/work-logs/new`">Add work log</RouterLink>
    </header>

    <p v-if="success" class="alert success">{{ success }}</p>
    <AppErrorAlert v-if="error" :error="error" />

    <section class="panel totals">
      <div><p class="eyebrow">Logs</p><strong>{{ page?.totals?.count ?? 0 }}</strong></div>
      <div><p class="eyebrow">Hours</p><strong>{{ formatNumber(page?.totals?.hours) }}</strong></div>
      <template v-if="page?.canViewCosts">
        <div><p class="eyebrow">Material cost</p><strong>{{ formatMoney(page?.totals?.materialCost) }}</strong></div>
        <div><p class="eyebrow">Total cost</p><strong>{{ formatMoney(page?.totals?.totalCost) }}</strong></div>
      </template>
    </section>

    <section class="panel">
      <p v-if="loading">Loading work logs...</p>
      <p v-else-if="(page?.items ?? []).length === 0" class="muted">No work logs have been added yet.</p>
      <table v-else>
        <thead>
          <tr>
            <th>Work window</th>
            <th>Hours</th>
            <th v-if="page?.canViewCosts">Material cost</th>
            <th v-if="page?.canViewCosts">Labor cost</th>
            <th>Logged by</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in page?.items" :key="item.workLogId">
            <td>{{ formatDateTime(item.workStart) }} - {{ formatDateTime(item.workEnd) }}</td>
            <td>{{ formatNumber(item.hours) }}</td>
            <td v-if="page?.canViewCosts">{{ formatMoney(item.materialCost) }}</td>
            <td v-if="page?.canViewCosts">{{ formatMoney(item.laborCost) }}</td>
            <td>{{ item.appUserName || '-' }}</td>
            <td>{{ item.description || '-' }}</td>
            <td class="actions">
              <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/work-logs/${item.workLogId}/edit`">Edit</RouterLink>
              <button :disabled="saving" @click="openDelete(item.workLogId)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <AppConfirmationDialog
      :open="deleteOpen"
      title="Delete work log"
      :message="`Delete this work log${deleteModel?.vendorName ? ` for ${deleteModel.vendorName}` : ''}? ${deleteModel?.description ?? ''}`"
      :pending="saving"
      confirm-label="Delete work log"
      destructive
      @cancel="deleteOpen = false"
      @confirm="deleteLog(deleteTargetId)"
    />
  </main>
</template>

<style scoped>
.operation-page { display: grid; gap: 1rem; }
.operation-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.eyebrow, .muted { color: #667085; }
.eyebrow { margin: 0 0 .25rem; text-transform: uppercase; font-size: .75rem; font-weight: 700; }
.panel { border: 1px solid #d0d5dd; border-radius: 8px; padding: 1rem; background: #fff; overflow-x: auto; }
.totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .7rem; border-bottom: 1px solid #eaecf0; text-align: left; vertical-align: top; }
.primary { background: #155eef; color: #fff; border-radius: 6px; padding: .55rem .75rem; text-decoration: none; }
.actions { display: flex; gap: .5rem; align-items: center; }
button { background: #b42318; color: #fff; border: 1px solid #b42318; border-radius: 6px; padding: .4rem .65rem; }
.alert { border-radius: 8px; padding: .8rem; }
.danger { background: #fef3f2; border: 1px solid #fecdca; }
.success { background: #ecfdf3; border: 1px solid #abefc6; }
</style>
