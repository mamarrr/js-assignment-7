<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppConfirmationDialog from '@/components/AppConfirmationDialog.vue'
import {
  ticketsApi,
  ticketLifecycle,
  type TicketDetailsDto,
  type TicketTransitionAvailabilityDto,
} from '@/api/portal/tickets'
import { useNotificationStore } from '@/stores/notifications'
import { formatDateTime, useOperationState, usePortalRouteParams } from './operationView'

const router = useRouter()
const notifications = useNotificationStore()
const params = usePortalRouteParams()
const { loading, saving, error, capture } = useOperationState()
const ticket = ref<TicketDetailsDto>()
const transition = ref<TicketTransitionAvailabilityDto>()
const advanceOpen = ref(false)
const deleteOpen = ref(false)
const deleteConfirmation = ref('')

const blockingReasons = computed(
  () => transition.value?.blockingReasons ?? ticket.value?.transitionBlockingReasons ?? [],
)
const canAdvance = computed(
  () => transition.value?.canAdvance ?? ticket.value?.canAdvanceStatus ?? false,
)
const nextStatusLabel = computed(
  () => transition.value?.nextStatusLabel ?? ticket.value?.nextStatusLabel,
)
const normalizedStatus = computed(() =>
  String(ticket.value?.statusCode ?? ticket.value?.statusLabel ?? '').toLowerCase(),
)
const canDelete = computed(() => deleteConfirmation.value === 'DELETE')

const statusMatches = (step: string) => {
  const normalizedStep = step.toLowerCase().replace(/\s+/g, '')
  return normalizedStatus.value.replace(/[_\-\s]+/g, '') === normalizedStep
}

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    const [details, availability] = await Promise.all([
      ticketsApi.detail(params.companySlug.value, params.ticketId.value),
      ticketsApi.transitionAvailability(params.companySlug.value, params.ticketId.value),
    ])
    ticket.value = details
    transition.value = availability
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

const advance = async () => {
  if (!nextStatusLabel.value || saving.value) return
  saving.value = true
  error.value = undefined
  try {
    await ticketsApi.advanceStatus(params.companySlug.value, params.ticketId.value)
    notifications.push({ tone: 'success', title: 'Ticket status advanced.' })
    advanceOpen.value = false
    await load()
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

const deleteTicket = async () => {
  if (!canDelete.value || saving.value) return
  saving.value = true
  error.value = undefined
  try {
    await ticketsApi.delete(params.companySlug.value, params.ticketId.value, {
      deleteConfirmation: deleteConfirmation.value,
    })
    notifications.push({ tone: 'success', title: 'Ticket deleted.' })
    await router.push(`/companies/${params.companySlug.value}/tickets`)
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
    <p v-if="loading">Loading ticket...</p>
    <section v-if="error" class="alert danger" role="alert">
      <strong>{{ error.title }}</strong>
      <p>{{ error.message }}</p>
      <details v-if="error.traceId">
        <summary>Technical details</summary>
        Trace ID: {{ error.traceId }}
      </details>
    </section>

    <template v-if="ticket">
      <header class="operation-header panel">
        <div>
          <p class="eyebrow">{{ ticket.ticketNr }}</p>
          <h1>{{ ticket.title || 'Ticket details' }}</h1>
          <div class="badges">
            <span class="badge">{{ ticket.statusLabel || '-' }}</span>
            <span class="badge">{{ ticket.priorityLabel || '-' }}</span>
            <span class="badge">{{ ticket.categoryLabel || '-' }}</span>
          </div>
        </div>
        <div class="actions">
          <button
            v-if="nextStatusLabel && canAdvance"
            :disabled="saving"
            @click="advanceOpen = true"
          >
            Advance to {{ nextStatusLabel }}
          </button>
          <RouterLink
            :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/edit`"
            >Edit</RouterLink
          >
        </div>
      </header>

      <section v-if="!canAdvance && blockingReasons.length > 0" class="alert warning">
        <strong>Status advancement is blocked.</strong>
        <ul>
          <li v-for="reason in blockingReasons" :key="reason">{{ reason }}</li>
        </ul>
      </section>

      <section class="panel lifecycle">
        <span
          v-for="step in ticketLifecycle"
          :key="step"
          :class="{ active: statusMatches(step) }"
          >{{ step }}</span
        >
      </section>

      <div class="grid">
        <section class="panel">
          <h2>Description</h2>
          <p>{{ ticket.description || '-' }}</p>
        </section>
        <section class="panel">
          <h2>Dates</h2>
          <dl>
            <dt>Created</dt>
            <dd>{{ formatDateTime(ticket.createdAt) }}</dd>
            <dt>Due</dt>
            <dd>{{ formatDateTime(ticket.dueAt) }}</dd>
            <dt>Closed</dt>
            <dd>{{ formatDateTime(ticket.closedAt) }}</dd>
          </dl>
        </section>
        <section class="panel">
          <h2>Context</h2>
          <dl>
            <dt>Customer</dt>
            <dd>{{ ticket.customerName || '-' }}</dd>
            <dt>Property</dt>
            <dd>{{ ticket.propertyName || '-' }}</dd>
            <dt>Unit</dt>
            <dd>{{ ticket.unitNr || '-' }}</dd>
            <dt>Resident</dt>
            <dd>{{ ticket.residentName || '-' }}</dd>
            <dt>Vendor</dt>
            <dd>{{ ticket.vendorName || '-' }}</dd>
          </dl>
        </section>
      </div>

      <section class="panel">
        <div class="section-header">
          <div>
            <h2>Scheduled work</h2>
            <p class="muted">Vendor work scheduled for this ticket.</p>
          </div>
          <div class="actions">
            <RouterLink
              :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work`"
              >View scheduled work</RouterLink
            >
          </div>
        </div>
        <p v-if="(ticket.scheduledWork ?? []).length === 0" class="muted">
          No scheduled work has been added yet.
        </p>
        <table v-else>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Status</th>
              <th>Scheduled start</th>
              <th>Scheduled end</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="work in ticket.scheduledWork" :key="work.scheduledWorkId">
              <td>{{ work.vendorName || '-' }}</td>
              <td>
                <span class="badge">{{ work.workStatusLabel || '-' }}</span>
              </td>
              <td>{{ formatDateTime(work.scheduledStart) }}</td>
              <td>{{ formatDateTime(work.scheduledEnd) }}</td>
              <td>
                <RouterLink
                  :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${work.scheduledWorkId}`"
                  >Details</RouterLink
                >
                <RouterLink
                  :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${work.scheduledWorkId}/work-logs`"
                  >Work logs</RouterLink
                >
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="panel danger-zone">
        <h2>Danger zone</h2>
        <p class="muted">Delete this ticket only when it was created in error.</p>
        <button :disabled="saving" @click="deleteOpen = true">Delete ticket</button>
      </section>

      <AppConfirmationDialog
        :open="advanceOpen"
        title="Advance ticket status"
        :message="`Advance this ticket to ${nextStatusLabel}? This lifecycle action is applied immediately.`"
        :pending="saving"
        confirm-label="Advance status"
        @cancel="advanceOpen = false"
        @confirm="advance"
      />

      <dialog :open="deleteOpen" class="ticket-dialog">
        <form method="dialog" @submit.prevent="deleteTicket">
          <h2>Delete ticket</h2>
          <p>This deletes the ticket record. Type DELETE to confirm this destructive action.</p>
          <label>
            Confirmation
            <input v-model="deleteConfirmation" autocomplete="off" />
          </label>
          <div class="actions">
            <button type="button" class="secondary" :disabled="saving" @click="deleteOpen = false">
              Cancel
            </button>
            <button type="submit" class="danger-button" :disabled="saving || !canDelete">
              {{ saving ? 'Deleting...' : 'Delete ticket' }}
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
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
.badges,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.badge,
.lifecycle span {
  display: inline-block;
  border: 1px solid #b2ddff;
  background: #eff8ff;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
}
.lifecycle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.lifecycle .active {
  background: #155eef;
  color: #fff;
  border-color: #155eef;
}
dl {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 0.5rem;
}
dt {
  font-weight: 700;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.7rem;
  border-bottom: 1px solid #eaecf0;
  text-align: left;
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
.danger-zone button,
.danger-button {
  background: #b42318;
  border-color: #b42318;
  color: #fff;
}
.secondary {
  background: #fff;
  color: #344054;
  border-color: #98a2b3;
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
.warning {
  background: #fffaeb;
  border: 1px solid #fedf89;
}
.ticket-dialog {
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
.ticket-dialog::backdrop {
  background: rgb(16 24 40 / 0.35);
}
.ticket-dialog form {
  display: grid;
  gap: 0.9rem;
}
.ticket-dialog label {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}
.ticket-dialog input {
  border: 1px solid #98a2b3;
  border-radius: 6px;
  padding: 0.5rem 0.7rem;
  font: inherit;
}
</style>
