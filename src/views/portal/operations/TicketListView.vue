<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ticketsApi, type ContextTicketsDto, type ManagementTicketsDto, type TicketContext } from '@/api/portal/tickets'
import {
  formatDateTime,
  optionLabel,
  optionValue,
  useOperationState,
  usePortalRouteParams,
} from './operationView'

const params = usePortalRouteParams()
const { loading, error, success, capture } = useOperationState()
const page = ref<ContextTicketsDto | ManagementTicketsDto>()
const filter = reactive({
  search: '',
  statusId: '',
  priorityId: '',
  categoryId: '',
  customerId: '',
  propertyId: '',
  unitId: '',
  residentId: '',
  vendorId: '',
  dueFrom: '',
  dueTo: '',
})

const context = computed<TicketContext | undefined>(() => {
  if (params.residentIdCode.value) return { type: 'resident', residentIdCode: params.residentIdCode.value }
  if (params.unitSlug.value) {
    return {
      type: 'unit',
      customerSlug: params.customerSlug.value,
      propertySlug: params.propertySlug.value,
      unitSlug: params.unitSlug.value,
    }
  }
  if (params.propertySlug.value) {
    return { type: 'property', customerSlug: params.customerSlug.value, propertySlug: params.propertySlug.value }
  }
  if (params.customerSlug.value) return { type: 'customer', customerSlug: params.customerSlug.value }
  return undefined
})

const title = computed(() => {
  const contextPage = page.value as ContextTicketsDto | undefined
  return contextPage?.contextName ? `${contextPage.contextName} tickets` : 'Tickets'
})

const tickets = computed(() => page.value?.tickets ?? [])
const options = computed(() => page.value?.options ?? {})

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    const query = {
      search: filter.search,
      statusId: filter.statusId,
      priorityId: filter.priorityId,
      categoryId: filter.categoryId,
      customerId: filter.customerId,
      propertyId: filter.propertyId,
      unitId: filter.unitId,
      residentId: filter.residentId,
      vendorId: filter.vendorId,
      dueFrom: filter.dueFrom,
      dueTo: filter.dueTo,
    }
    page.value = context.value
      ? await ticketsApi.listForContext(params.companySlug.value, context.value, query)
      : await ticketsApi.list(params.companySlug.value, query)
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
        <p class="eyebrow">{{ page?.companyName ?? params.companySlug.value }}</p>
        <h1>{{ title }}</h1>
      </div>
      <RouterLink class="primary" :to="`/companies/${params.companySlug.value}/tickets/new`">New ticket</RouterLink>
    </header>

    <p v-if="success" class="alert success">{{ success }}</p>
    <section v-if="error" class="alert danger" role="alert">
      <strong>{{ error.title }}</strong>
      <p>{{ error.message }}</p>
      <details v-if="error.traceId"><summary>Technical details</summary>Trace ID: {{ error.traceId }}</details>
    </section>

    <form class="panel filters" @submit.prevent="load">
      <input v-model="filter.search" type="search" placeholder="Search tickets" />
      <select v-model="filter.statusId">
        <option value="">Any status</option>
        <option v-for="option in options.statuses" :key="optionValue(option)" :value="optionValue(option)">
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-model="filter.priorityId">
        <option value="">Any priority</option>
        <option v-for="option in options.priorities" :key="optionValue(option)" :value="optionValue(option)">
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-model="filter.categoryId">
        <option value="">Any category</option>
        <option v-for="option in options.categories" :key="optionValue(option)" :value="optionValue(option)">
          {{ optionLabel(option) }}
        </option>
      </select>
      <button type="submit" :disabled="loading">Apply</button>
    </form>

    <section class="panel">
      <p v-if="loading">Loading tickets...</p>
      <p v-else-if="tickets.length === 0" class="muted">No tickets found.</p>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Context</th>
              <th>Vendor</th>
              <th>Due</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.ticketId">
              <td>
                <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${ticket.ticketId}`">
                  {{ ticket.ticketNr || ticket.title || ticket.ticketId }}
                </RouterLink>
                <div class="muted">{{ ticket.title }}</div>
              </td>
              <td><span class="badge">{{ ticket.statusLabel || '-' }}</span></td>
              <td>{{ ticket.priorityLabel || '-' }}</td>
              <td>{{ ticket.categoryLabel || '-' }}</td>
              <td>
                <div>{{ ticket.customerName || '-' }}</div>
                <div class="muted">{{ ticket.propertyName || ticket.unitNr || ticket.residentName || '' }}</div>
              </td>
              <td>{{ ticket.vendorName || '-' }}</td>
              <td>{{ formatDateTime(ticket.dueAt) }}</td>
              <td>{{ formatDateTime(ticket.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<style scoped>
.operation-page { display: grid; gap: 1rem; }
.operation-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
.eyebrow, .muted { color: #667085; }
.eyebrow { margin: 0 0 .25rem; text-transform: uppercase; font-size: .75rem; font-weight: 700; }
.panel { border: 1px solid #d0d5dd; border-radius: 8px; padding: 1rem; background: #fff; }
.filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .75rem; }
input, select, button, .primary { min-height: 2.4rem; border-radius: 6px; border: 1px solid #98a2b3; padding: .45rem .7rem; }
button, .primary { background: #155eef; color: #fff; border-color: #155eef; text-decoration: none; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .7rem; border-bottom: 1px solid #eaecf0; text-align: left; vertical-align: top; }
.badge { display: inline-block; border: 1px solid #b2ddff; background: #eff8ff; border-radius: 999px; padding: .15rem .5rem; }
.alert { border-radius: 8px; padding: .8rem; }
.danger { background: #fef3f2; border: 1px solid #fecdca; }
.success { background: #ecfdf3; border: 1px solid #abefc6; }
</style>
