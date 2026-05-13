<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { scheduledWorkApi, type ScheduledWorkDetailsDto } from '@/api/portal/scheduledWork'
import { formatDateTime, useOperationState, usePortalRouteParams } from './operationView'

const router = useRouter()
const params = usePortalRouteParams()
const { loading, saving, error, success, capture } = useOperationState()
const item = ref<ScheduledWorkDetailsDto>()

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    item.value = await scheduledWorkApi.detail(
      params.companySlug.value,
      params.ticketId.value,
      params.scheduledWorkId.value,
    )
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

const actionAt = () => new Date().toISOString()

const runTimedAction = async (action: 'start' | 'complete') => {
  const confirmed = window.confirm(`${action === 'start' ? 'Start' : 'Complete'} this scheduled work?`)
  if (!confirmed) return
  saving.value = true
  error.value = undefined
  try {
    await scheduledWorkApi[action](params.companySlug.value, params.ticketId.value, params.scheduledWorkId.value, {
      actionAt: actionAt(),
    })
    success.value = action === 'start' ? 'Scheduled work started.' : 'Scheduled work completed.'
    await load()
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

const cancel = async () => {
  if (!window.confirm('Cancel this scheduled work?')) return
  saving.value = true
  error.value = undefined
  try {
    await scheduledWorkApi.cancel(params.companySlug.value, params.ticketId.value, params.scheduledWorkId.value)
    success.value = 'Scheduled work canceled.'
    await load()
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

const deleteItem = async () => {
  if (!window.confirm('Delete this scheduled work? This action cannot be undone.')) return
  saving.value = true
  error.value = undefined
  try {
    await scheduledWorkApi.delete(params.companySlug.value, params.ticketId.value, params.scheduledWorkId.value)
    await router.push(`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work`)
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
    <p v-if="loading">Loading scheduled work...</p>
    <section v-if="error" class="alert danger"><strong>{{ error.title }}</strong><p>{{ error.message }}</p></section>
    <p v-if="success" class="alert success">{{ success }}</p>

    <template v-if="item">
      <header class="operation-header panel">
        <div>
          <p class="eyebrow">{{ item.ticketNr }}</p>
          <h1>{{ item.vendorName || 'Scheduled work' }}</h1>
          <span class="badge">{{ item.workStatusLabel || '-' }}</span>
        </div>
        <div class="actions">
          <button :disabled="saving" @click="runTimedAction('start')">Start</button>
          <button :disabled="saving" @click="runTimedAction('complete')">Complete</button>
          <button :disabled="saving" class="secondary" @click="cancel">Cancel work</button>
          <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/edit`">Edit</RouterLink>
        </div>
      </header>

      <section class="panel">
        <dl>
          <dt>Scheduled start</dt><dd>{{ formatDateTime(item.scheduledStart) }}</dd>
          <dt>Scheduled end</dt><dd>{{ formatDateTime(item.scheduledEnd) }}</dd>
          <dt>Actual start</dt><dd>{{ formatDateTime(item.realStart) }}</dd>
          <dt>Actual end</dt><dd>{{ formatDateTime(item.realEnd) }}</dd>
          <dt>Work logs</dt><dd>{{ item.workLogCount ?? 0 }}</dd>
          <dt>Notes</dt><dd>{{ item.notes || '-' }}</dd>
        </dl>
      </section>

      <section class="panel">
        <div class="section-header">
          <div>
            <h2>Work logs</h2>
            <p class="muted">{{ item.workLogCount ?? 0 }} work logs have been recorded.</p>
          </div>
          <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/work-logs`">View work logs</RouterLink>
        </div>
      </section>

      <section class="panel danger-zone">
        <h2>Danger zone</h2>
        <p class="muted">Delete scheduled work only when no work logs exist.</p>
        <button :disabled="saving" @click="deleteItem">Delete scheduled work</button>
      </section>
    </template>
  </main>
</template>

<style scoped>
.operation-page { display: grid; gap: 1rem; }
.operation-header, .section-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.panel { border: 1px solid #d0d5dd; border-radius: 8px; padding: 1rem; background: #fff; }
.eyebrow, .muted { color: #667085; }
.eyebrow { margin: 0 0 .25rem; text-transform: uppercase; font-size: .75rem; font-weight: 700; }
.actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.badge { display: inline-block; border: 1px solid #b2ddff; background: #eff8ff; border-radius: 999px; padding: .15rem .5rem; }
dl { display: grid; grid-template-columns: 10rem 1fr; gap: .65rem; }
dt { font-weight: 700; }
button, a { border-radius: 6px; padding: .5rem .75rem; }
button { background: #155eef; color: #fff; border: 1px solid #155eef; }
.secondary { background: #fff; color: #344054; border-color: #98a2b3; }
.danger-zone button { background: #b42318; border-color: #b42318; }
.alert { border-radius: 8px; padding: .8rem; }
.danger { background: #fef3f2; border: 1px solid #fecdca; }
.success { background: #ecfdf3; border: 1px solid #abefc6; }
</style>
