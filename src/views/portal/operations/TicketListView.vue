<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { lookupsApi } from '@/api/portal/lookups'
import {
  ticketsApi,
  type ContextTicketsDto,
  type ManagementTicketsDto,
  type TicketContext,
} from '@/api/portal/tickets'
import type { TicketOptionSetDto } from '@/types/api'
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
const lookupOptions = ref<TicketOptionSetDto>({})
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
  if (params.residentIdCode.value)
    return { type: 'resident', residentIdCode: params.residentIdCode.value }
  if (params.unitSlug.value) {
    return {
      type: 'unit',
      customerSlug: params.customerSlug.value,
      propertySlug: params.propertySlug.value,
      unitSlug: params.unitSlug.value,
    }
  }
  if (params.propertySlug.value) {
    return {
      type: 'property',
      customerSlug: params.customerSlug.value,
      propertySlug: params.propertySlug.value,
    }
  }
  if (params.customerSlug.value)
    return { type: 'customer', customerSlug: params.customerSlug.value }
  return undefined
})

const title = computed(() => {
  const contextPage = page.value as ContextTicketsDto | undefined
  return contextPage?.contextName ? `${contextPage.contextName} tickets` : 'Tickets'
})

const tickets = computed(() => page.value?.tickets ?? [])
const options = computed(() => ({ ...lookupOptions.value, ...page.value?.options }))
const showCustomerFilter = computed(() => !context.value)
const showPropertyFilter = computed(
  () => !context.value || context.value.type === 'customer' || context.value.type === 'resident',
)
const showUnitFilter = computed(
  () =>
    !context.value ||
    context.value.type === 'customer' ||
    context.value.type === 'property' ||
    context.value.type === 'resident',
)

const query = () => ({
  Search: filter.search,
  StatusId: filter.statusId,
  PriorityId: filter.priorityId,
  CategoryId: filter.categoryId,
  CustomerId: filter.customerId,
  PropertyId: filter.propertyId,
  UnitId: filter.unitId,
  ResidentId: filter.residentId,
  VendorId: filter.vendorId,
  DueFrom: filter.dueFrom,
  DueTo: filter.dueTo,
})

const clearFilters = async () => {
  Object.assign(filter, {
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
  await load()
}

const customerPath = (ticket: { customerSlug?: string }) =>
  ticket.customerSlug
    ? `/companies/${params.companySlug.value}/customers/${ticket.customerSlug}`
    : undefined

const propertyPath = (ticket: { customerSlug?: string; propertySlug?: string }) =>
  ticket.customerSlug && ticket.propertySlug
    ? `/companies/${params.companySlug.value}/customers/${ticket.customerSlug}/properties/${ticket.propertySlug}`
    : undefined

const unitPath = (ticket: { customerSlug?: string; propertySlug?: string; unitSlug?: string }) =>
  ticket.customerSlug && ticket.propertySlug && ticket.unitSlug
    ? `/companies/${params.companySlug.value}/customers/${ticket.customerSlug}/properties/${ticket.propertySlug}/units/${ticket.unitSlug}`
    : undefined

const residentPath = (ticket: { residentIdCode?: string }) =>
  ticket.residentIdCode
    ? `/companies/${params.companySlug.value}/residents/${ticket.residentIdCode}`
    : undefined

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    const activeQuery = query()
    const [loadedPage, loadedOptions] = await Promise.all([
      context.value
        ? ticketsApi.listForContext(params.companySlug.value, context.value, activeQuery)
        : ticketsApi.list(params.companySlug.value, activeQuery),
      lookupsApi.ticketOptions(params.companySlug.value, activeQuery),
    ])
    page.value = loadedPage
    lookupOptions.value = loadedOptions
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(
  () => [
    params.companySlug.value,
    params.customerSlug.value,
    params.propertySlug.value,
    params.unitSlug.value,
    params.residentIdCode.value,
  ],
  () => void load(),
)
</script>

<template>
  <main class="operation-page">
    <header class="operation-header">
      <div>
        <p class="eyebrow">{{ page?.companyName ?? params.companySlug.value }}</p>
        <h1>{{ title }}</h1>
      </div>
      <RouterLink class="primary" :to="`/companies/${params.companySlug.value}/tickets/new`"
        >Create ticket</RouterLink
      >
    </header>

    <p v-if="success" class="alert success">{{ success }}</p>
    <section v-if="error" class="alert danger" role="alert">
      <strong>{{ error.title }}</strong>
      <p>{{ error.message }}</p>
      <details v-if="error.traceId">
        <summary>Technical details</summary>
        Trace ID: {{ error.traceId }}
      </details>
    </section>

    <form class="panel filters" @submit.prevent="load">
      <label>
        <span>Search</span>
        <input v-model="filter.search" type="search" placeholder="Search tickets" />
      </label>
      <select v-model="filter.statusId">
        <option value="">Any status</option>
        <option
          v-for="option in options.statuses"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-model="filter.priorityId">
        <option value="">Any priority</option>
        <option
          v-for="option in options.priorities"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-model="filter.categoryId">
        <option value="">Any category</option>
        <option
          v-for="option in options.categories"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-if="showCustomerFilter" v-model="filter.customerId">
        <option value="">Any customer</option>
        <option
          v-for="option in options.customers"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-if="showPropertyFilter" v-model="filter.propertyId">
        <option value="">Any property</option>
        <option
          v-for="option in options.properties"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-if="showUnitFilter" v-model="filter.unitId">
        <option value="">Any unit</option>
        <option
          v-for="option in options.units"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-if="!context || context.type !== 'resident'" v-model="filter.residentId">
        <option value="">Any resident</option>
        <option
          v-for="option in options.residents"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <select v-model="filter.vendorId">
        <option value="">Any vendor</option>
        <option
          v-for="option in options.vendors"
          :key="optionValue(option)"
          :value="optionValue(option)"
        >
          {{ optionLabel(option) }}
        </option>
      </select>
      <label>
        <span>Due from</span>
        <input v-model="filter.dueFrom" type="date" />
      </label>
      <label>
        <span>Due to</span>
        <input v-model="filter.dueTo" type="date" />
      </label>
      <div class="filter-actions">
        <button type="submit" :disabled="loading">{{ loading ? 'Applying...' : 'Apply' }}</button>
        <button type="button" class="secondary" :disabled="loading" @click="clearFilters">
          Clear
        </button>
      </div>
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
                <RouterLink
                  :to="`/companies/${params.companySlug.value}/tickets/${ticket.ticketId}`"
                >
                  {{ ticket.ticketNr || ticket.title || ticket.ticketId }}
                </RouterLink>
                <div class="muted">{{ ticket.title }}</div>
              </td>
              <td>
                <span class="badge">{{ ticket.statusLabel || '-' }}</span>
              </td>
              <td>{{ ticket.priorityLabel || '-' }}</td>
              <td>{{ ticket.categoryLabel || '-' }}</td>
              <td>
                <div>
                  <RouterLink v-if="customerPath(ticket)" :to="customerPath(ticket)!">{{
                    ticket.customerName
                  }}</RouterLink>
                  <span v-else>{{ ticket.customerName || '-' }}</span>
                </div>
                <div class="muted">
                  <RouterLink v-if="propertyPath(ticket)" :to="propertyPath(ticket)!">{{
                    ticket.propertyName
                  }}</RouterLink>
                  <span v-else>{{ ticket.propertyName || '' }}</span>
                  <span v-if="ticket.unitNr"> / </span>
                  <RouterLink v-if="unitPath(ticket)" :to="unitPath(ticket)!">{{
                    ticket.unitNr
                  }}</RouterLink>
                  <span v-else>{{ ticket.unitNr || '' }}</span>
                  <span v-if="ticket.residentName"> / </span>
                  <RouterLink v-if="residentPath(ticket)" :to="residentPath(ticket)!">{{
                    ticket.residentName
                  }}</RouterLink>
                  <span v-else>{{ ticket.residentName || '' }}</span>
                </div>
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
.operation-page {
  display: grid;
  gap: 1rem;
}
.operation-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
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
.panel {
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}
input,
select,
button,
.primary {
  min-height: 2.4rem;
  border-radius: 6px;
  border: 1px solid #98a2b3;
  padding: 0.45rem 0.7rem;
}
button,
.primary {
  background: #155eef;
  color: #fff;
  border-color: #155eef;
  text-decoration: none;
}
.table-wrap {
  overflow-x: auto;
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
  vertical-align: top;
}
.badge {
  display: inline-block;
  border: 1px solid #b2ddff;
  background: #eff8ff;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
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
</style>
