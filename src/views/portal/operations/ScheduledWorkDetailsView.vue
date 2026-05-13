<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppConfirmationDialog from '@/components/AppConfirmationDialog.vue'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppFieldErrors from '@/components/AppFieldErrors.vue'
import { scheduledWorkApi, type ScheduledWorkDetailsDto } from '@/api/portal/scheduledWork'
import {
  fieldErrors,
  formatDateTime,
  toDateTimeLocal,
  useOperationState,
  usePortalRouteParams,
} from './operationView'

const router = useRouter()
const params = usePortalRouteParams()
const { loading, saving, error, success, capture, notifySuccess } = useOperationState()
const item = ref<ScheduledWorkDetailsDto>()
const cancelOpen = ref(false)
const deleteOpen = ref(false)
const deleteConfirmation = ref('')
const startActionAt = ref('')
const completeActionAt = ref('')
const fieldErrorMap = computed(() => error.value?.fieldErrors ?? {})
const canDelete = computed(() => deleteConfirmation.value === 'DELETE')

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    item.value = await scheduledWorkApi.detail(
      params.companySlug.value,
      params.ticketId.value,
      params.scheduledWorkId.value,
    )
    startActionAt.value =
      toDateTimeLocal(item.value.realStart) || toDateTimeLocal(new Date().toISOString())
    completeActionAt.value =
      toDateTimeLocal(item.value.realEnd) || toDateTimeLocal(new Date().toISOString())
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

const runTimedAction = async (action: 'start' | 'complete') => {
  if (saving.value) return
  const actionAt = action === 'start' ? startActionAt.value : completeActionAt.value
  if (!actionAt) {
    error.value = {
      status: 0,
      title: 'Validation failed',
      message: 'Enter the action time and try again.',
      fieldErrors: { actionAt: ['Action time is required.'] },
      raw: null,
    }
    return
  }
  saving.value = true
  error.value = undefined
  try {
    await scheduledWorkApi[action](
      params.companySlug.value,
      params.ticketId.value,
      params.scheduledWorkId.value,
      {
        actionAt: new Date(actionAt).toISOString(),
      },
    )
    notifySuccess(action === 'start' ? 'Scheduled work started.' : 'Scheduled work completed.')
    await load()
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

const cancel = async () => {
  if (saving.value) return
  saving.value = true
  error.value = undefined
  try {
    await scheduledWorkApi.cancel(
      params.companySlug.value,
      params.ticketId.value,
      params.scheduledWorkId.value,
    )
    notifySuccess('Scheduled work canceled.')
    cancelOpen.value = false
    await load()
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

const deleteItem = async () => {
  if (!canDelete.value || saving.value) return
  saving.value = true
  error.value = undefined
  try {
    await scheduledWorkApi.delete(
      params.companySlug.value,
      params.ticketId.value,
      params.scheduledWorkId.value,
    )
    notifySuccess('Scheduled work deleted.')
    await router.push(
      `/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work`,
    )
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
    <AppErrorAlert v-if="error" :error="error" />
    <p v-if="success" class="alert success">{{ success }}</p>

    <template v-if="item">
      <header class="operation-header panel">
        <div>
          <p class="eyebrow">{{ item.ticketNr }}</p>
          <h1>{{ item.vendorName || 'Scheduled work' }}</h1>
          <span class="badge">{{ item.workStatusLabel || '-' }}</span>
        </div>
        <div class="actions">
          <button :disabled="saving" class="secondary" @click="cancelOpen = true">
            Cancel work
          </button>
          <RouterLink
            :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/edit`"
            >Edit</RouterLink
          >
        </div>
      </header>

      <section class="panel">
        <dl>
          <dt>Scheduled start</dt>
          <dd>{{ formatDateTime(item.scheduledStart) }}</dd>
          <dt>Scheduled end</dt>
          <dd>{{ formatDateTime(item.scheduledEnd) }}</dd>
          <dt>Actual start</dt>
          <dd>{{ formatDateTime(item.realStart) }}</dd>
          <dt>Actual end</dt>
          <dd>{{ formatDateTime(item.realEnd) }}</dd>
          <dt>Work logs</dt>
          <dd>{{ item.workLogCount ?? 0 }}</dd>
          <dt>Notes</dt>
          <dd>{{ item.notes || '-' }}</dd>
        </dl>
      </section>

      <section class="panel">
        <h2>Work actions</h2>
        <div class="action-forms">
          <form class="inline-action" @submit.prevent="runTimedAction('start')">
            <label
              >Actual start<input
                v-model="startActionAt"
                type="datetime-local"
                :aria-invalid="fieldErrors(fieldErrorMap, 'actionAt', 'ActionAt').length > 0"
            /></label>
            <AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'actionAt', 'ActionAt')" />
            <button :disabled="saving" type="submit">
              {{ saving ? 'Working...' : 'Start work' }}
            </button>
          </form>
          <form class="inline-action" @submit.prevent="runTimedAction('complete')">
            <label
              >Actual end<input
                v-model="completeActionAt"
                type="datetime-local"
                :aria-invalid="fieldErrors(fieldErrorMap, 'actionAt', 'ActionAt').length > 0"
            /></label>
            <AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'actionAt', 'ActionAt')" />
            <button :disabled="saving" type="submit">
              {{ saving ? 'Working...' : 'Complete work' }}
            </button>
          </form>
        </div>
      </section>

      <section class="panel">
        <div class="section-header">
          <div>
            <h2>Work logs</h2>
            <p class="muted">{{ item.workLogCount ?? 0 }} work logs have been recorded.</p>
          </div>
          <RouterLink
            :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/work-logs`"
            >View work logs</RouterLink
          >
        </div>
      </section>

      <section class="panel danger-zone">
        <h2>Danger zone</h2>
        <p class="muted">Delete scheduled work only when no work logs exist.</p>
        <button :disabled="saving" @click="deleteOpen = true">Delete scheduled work</button>
      </section>

      <AppConfirmationDialog
        :open="cancelOpen"
        title="Cancel scheduled work"
        message="Cancel this scheduled work? This lifecycle action is applied immediately."
        :pending="saving"
        confirm-label="Cancel work"
        destructive
        @cancel="cancelOpen = false"
        @confirm="cancel"
      />

      <dialog :open="deleteOpen" class="operation-dialog">
        <form method="dialog" @submit.prevent="deleteItem">
          <h2>Delete scheduled work</h2>
          <p>
            This deletes the scheduled work record. Type DELETE to confirm this destructive action.
          </p>
          <label>Confirmation<input v-model="deleteConfirmation" autocomplete="off" /></label>
          <div class="actions">
            <button type="button" class="secondary" :disabled="saving" @click="deleteOpen = false">
              Cancel
            </button>
            <button type="submit" class="danger-button" :disabled="saving || !canDelete">
              {{ saving ? 'Deleting...' : 'Delete scheduled work' }}
            </button>
          </div>
        </form>
      </dialog>
    </template>
  </main>
</template>

<style scoped>
.operation-page {
  display: grid;
  gap: 1rem;
}
.operation-header,
.section-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}
.panel {
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}
.eyebrow,
.muted {
  color: #667085;
}
.eyebrow {
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.action-forms {
  display: grid;
  gap: 1rem;
}
.inline-action {
  display: grid;
  grid-template-columns: minmax(15rem, 1fr) auto;
  gap: 0.5rem;
  align-items: end;
}
.inline-action label {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}
.badge {
  display: inline-block;
  border: 1px solid #b2ddff;
  background: #eff8ff;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
}
dl {
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: 0.65rem;
}
dt {
  font-weight: 700;
}
button,
a {
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
}
button {
  background: #155eef;
  color: #fff;
  border: 1px solid #155eef;
}
.secondary {
  background: #fff;
  color: #344054;
  border-color: #98a2b3;
}
.danger-zone button,
.danger-button {
  background: #b42318;
  border-color: #b42318;
  color: #fff;
}
.alert {
  border-radius: 8px;
  padding: 0.8rem;
}
.danger {
  background: #fef3f2;
  border: 1px solid #fecdca;
}
.success {
  background: #ecfdf3;
  border: 1px solid #abefc6;
}
.operation-dialog {
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 1rem;
  max-width: 28rem;
  width: calc(100% - 2rem);
  position: fixed;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  box-shadow: 0 24px 48px rgb(16 24 40 / 0.2);
}
.operation-dialog::backdrop {
  background: rgb(16 24 40 / 0.35);
}
.operation-dialog form {
  display: grid;
  gap: 0.9rem;
}
.operation-dialog label {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}
@media (max-width: 700px) {
  .inline-action {
    grid-template-columns: 1fr;
  }
}
</style>
