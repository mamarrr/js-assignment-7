<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ticketsApi, ticketLifecycle, type TicketDetailsDto, type TicketTransitionAvailabilityDto } from '@/api/portal/tickets'
import { formatDateTime, useOperationState, usePortalRouteParams } from './operationView'

const router = useRouter()
const params = usePortalRouteParams()
const { loading, saving, error, success, capture } = useOperationState()
const ticket = ref<TicketDetailsDto>()
const transition = ref<TicketTransitionAvailabilityDto>()

const blockingReasons = computed(
  () => transition.value?.blockingReasons ?? ticket.value?.transitionBlockingReasons ?? [],
)
const canAdvance = computed(() => transition.value?.canAdvance ?? ticket.value?.canAdvanceStatus ?? false)
const nextStatusLabel = computed(() => transition.value?.nextStatusLabel ?? ticket.value?.nextStatusLabel)

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
  if (!nextStatusLabel.value) return
  const confirmed = window.confirm(`Advance this ticket to ${nextStatusLabel.value}?`)
  if (!confirmed) return
  saving.value = true
  error.value = undefined
  try {
    await ticketsApi.advanceStatus(params.companySlug.value, params.ticketId.value)
    success.value = 'Ticket status advanced.'
    await load()
  } catch (caught) {
    capture(caught)
  } finally {
    saving.value = false
  }
}

const deleteTicket = async () => {
  const confirmed = window.confirm('Delete this ticket? This action cannot be undone.')
  if (!confirmed) return
  saving.value = true
  error.value = undefined
  try {
    await ticketsApi.delete(params.companySlug.value, params.ticketId.value)
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
      <details v-if="error.traceId"><summary>Technical details</summary>Trace ID: {{ error.traceId }}</details>
    </section>
    <p v-if="success" class="alert success">{{ success }}</p>

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
          <button v-if="nextStatusLabel && canAdvance" :disabled="saving" @click="advance">
            Advance to {{ nextStatusLabel }}
          </button>
          <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/edit`">Edit</RouterLink>
        </div>
      </header>

      <section v-if="!canAdvance && blockingReasons.length > 0" class="alert warning">
        <strong>Status advancement is blocked.</strong>
        <ul>
          <li v-for="reason in blockingReasons" :key="reason">{{ reason }}</li>
        </ul>
      </section>

      <section class="panel lifecycle">
        <span v-for="step in ticketLifecycle" :key="step" :class="{ active: step === ticket.statusLabel }">{{ step }}</span>
      </section>

      <div class="grid">
        <section class="panel">
          <h2>Description</h2>
          <p>{{ ticket.description || '-' }}</p>
        </section>
        <section class="panel">
          <h2>Dates</h2>
          <dl>
            <dt>Created</dt><dd>{{ formatDateTime(ticket.createdAt) }}</dd>
            <dt>Due</dt><dd>{{ formatDateTime(ticket.dueAt) }}</dd>
            <dt>Closed</dt><dd>{{ formatDateTime(ticket.closedAt) }}</dd>
          </dl>
        </section>
        <section class="panel">
          <h2>Context</h2>
          <dl>
            <dt>Customer</dt><dd>{{ ticket.customerName || '-' }}</dd>
            <dt>Property</dt><dd>{{ ticket.propertyName || '-' }}</dd>
            <dt>Unit</dt><dd>{{ ticket.unitNr || '-' }}</dd>
            <dt>Resident</dt><dd>{{ ticket.residentName || '-' }}</dd>
            <dt>Vendor</dt><dd>{{ ticket.vendorName || '-' }}</dd>
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
            <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work`">View scheduled work</RouterLink>
          </div>
        </div>
        <p v-if="(ticket.scheduledWork ?? []).length === 0" class="muted">No scheduled work has been added yet.</p>
        <table v-else>
          <thead><tr><th>Vendor</th><th>Status</th><th>Scheduled start</th><th>Scheduled end</th><th></th></tr></thead>
          <tbody>
            <tr v-for="work in ticket.scheduledWork" :key="work.scheduledWorkId">
              <td>{{ work.vendorName || '-' }}</td>
              <td><span class="badge">{{ work.workStatusLabel || '-' }}</span></td>
              <td>{{ formatDateTime(work.scheduledStart) }}</td>
              <td>{{ formatDateTime(work.scheduledEnd) }}</td>
              <td>
                <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${work.scheduledWorkId}`">Details</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="panel danger-zone">
        <h2>Danger zone</h2>
        <p class="muted">Delete this ticket only when it was created in error.</p>
        <button :disabled="saving" @click="deleteTicket">Delete ticket</button>
      </section>
    </template>
  </main>
</template>

<style scoped>
.operation-page { display: grid; gap: 1rem; }
.operation-header, .section-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.panel { border: 1px solid #d0d5dd; border-radius: 8px; padding: 1rem; background: #fff; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.eyebrow, .muted { color: #667085; }
.eyebrow { margin: 0 0 .25rem; text-transform: uppercase; font-size: .75rem; font-weight: 700; }
.badges, .actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.badge, .lifecycle span { display: inline-block; border: 1px solid #b2ddff; background: #eff8ff; border-radius: 999px; padding: .15rem .5rem; }
.lifecycle { display: flex; flex-wrap: wrap; gap: .5rem; }
.lifecycle .active { background: #155eef; color: #fff; border-color: #155eef; }
dl { display: grid; grid-template-columns: 7rem 1fr; gap: .5rem; }
dt { font-weight: 700; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .7rem; border-bottom: 1px solid #eaecf0; text-align: left; }
button, a { border-radius: 6px; padding: .5rem .75rem; }
button { background: #155eef; color: #fff; border: 1px solid #155eef; }
.danger-zone button { background: #b42318; border-color: #b42318; }
.alert { border-radius: 8px; padding: .8rem; }
.danger { background: #fef3f2; border: 1px solid #fecdca; }
.success { background: #ecfdf3; border: 1px solid #abefc6; }
.warning { background: #fffaeb; border: 1px solid #fedf89; }
</style>
