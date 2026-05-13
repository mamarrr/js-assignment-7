<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ticketsApi, type TicketFormDto } from '@/api/portal/tickets'
import { useNotificationStore } from '@/stores/notifications'
import {
  emptyToNull,
  fieldErrors,
  fromDateTimeLocal,
  optionLabel,
  optionValue,
  toDateTimeLocal,
  useOperationState,
  usePortalRouteParams,
} from './operationView'

const router = useRouter()
const notifications = useNotificationStore()
const params = usePortalRouteParams()
const { loading, saving, error, capture } = useOperationState()
const isEdit = computed(() => Boolean(params.ticketId.value))
const bootstrap = ref<TicketFormDto>({})
const form = reactive({
  ticketNr: '',
  title: '',
  description: '',
  ticketCategoryId: '',
  ticketStatusId: '',
  ticketPriorityId: '',
  customerId: '',
  propertyId: '',
  unitId: '',
  residentId: '',
  vendorId: '',
  dueAt: '',
})

const options = computed(() => bootstrap.value.options ?? {})
const summaryErrors = computed(() =>
  fieldErrors(error.value?.fieldErrors ?? {}, '', 'model', 'Model', '$'),
)

const optionQuery = () => ({
  CustomerId: emptyToNull(form.customerId),
  PropertyId: emptyToNull(form.propertyId),
  UnitId: emptyToNull(form.unitId),
  CategoryId: emptyToNull(form.ticketCategoryId),
})

const fill = (dto: TicketFormDto) => {
  bootstrap.value = dto
  form.ticketNr = dto.ticketNr ?? ''
  form.title = dto.title ?? ''
  form.description = dto.description ?? ''
  form.ticketCategoryId = dto.ticketCategoryId ?? ''
  form.ticketStatusId = dto.ticketStatusId ?? ''
  form.ticketPriorityId = dto.ticketPriorityId ?? ''
  form.customerId = dto.customerId ?? ''
  form.propertyId = dto.propertyId ?? ''
  form.unitId = dto.unitId ?? ''
  form.residentId = dto.residentId ?? ''
  form.vendorId = dto.vendorId ?? ''
  form.dueAt = toDateTimeLocal(dto.dueAt)
}

const refreshOptions = async () => {
  if (loading.value) return
  try {
    bootstrap.value = {
      ...bootstrap.value,
      options: await ticketsApi.options(params.companySlug.value, optionQuery()),
    }
  } catch (caught) {
    capture(caught)
  }
}

const onCustomerChanged = async () => {
  form.propertyId = ''
  form.unitId = ''
  await refreshOptions()
}

const onPropertyChanged = async () => {
  form.unitId = ''
  await refreshOptions()
}

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    fill(
      isEdit.value
        ? await ticketsApi.editForm(params.companySlug.value, params.ticketId.value)
        : await ticketsApi.form(params.companySlug.value),
    )
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (saving.value) return
  saving.value = true
  error.value = undefined
  try {
    const body = {
      ticketNr: emptyToNull(form.ticketNr),
      title: emptyToNull(form.title),
      description: emptyToNull(form.description),
      ticketCategoryId: form.ticketCategoryId,
      ticketPriorityId: form.ticketPriorityId,
      customerId: emptyToNull(form.customerId),
      propertyId: emptyToNull(form.propertyId),
      unitId: emptyToNull(form.unitId),
      residentId: emptyToNull(form.residentId),
      vendorId: emptyToNull(form.vendorId),
      dueAt: fromDateTimeLocal(form.dueAt),
    }
    const saved = isEdit.value
      ? await ticketsApi.update(params.companySlug.value, params.ticketId.value, {
          ...body,
          ticketStatusId: form.ticketStatusId,
        })
      : await ticketsApi.create(params.companySlug.value, body)

    notifications.push({
      tone: 'success',
      title: isEdit.value ? 'Ticket updated.' : 'Ticket created.',
    })
    await router.push(
      `/companies/${params.companySlug.value}/tickets/${saved.ticketId ?? params.ticketId.value}`,
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
    <header>
      <p class="eyebrow">{{ bootstrap.companyName ?? params.companySlug.value }}</p>
      <h1>{{ isEdit ? 'Edit ticket' : 'New ticket' }}</h1>
    </header>

    <section v-if="error" class="alert danger" role="alert">
      <strong>{{ error.title }}</strong>
      <p>{{ error.message }}</p>
      <ul v-if="summaryErrors.length > 0">
        <li v-for="message in summaryErrors" :key="message">{{ message }}</li>
      </ul>
      <details v-if="error.traceId">
        <summary>Technical details</summary>
        Trace ID: {{ error.traceId }}
      </details>
    </section>
    <p v-if="loading">Loading ticket form...</p>

    <form v-else class="panel form-grid" @submit.prevent="submit">
      <label>
        Ticket number
        <input v-model="form.ticketNr" />
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'ticketNr', 'TicketNr')"
          :key="message"
          >{{ message }}</small
        >
      </label>
      <label class="wide">
        Title
        <input v-model="form.title" />
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'title', 'Title')"
          :key="message"
          >{{ message }}</small
        >
      </label>
      <label class="full">
        Description
        <textarea v-model="form.description" rows="5" />
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'description', 'Description')"
          :key="message"
          >{{ message }}</small
        >
      </label>

      <label>
        Category
        <select v-model="form.ticketCategoryId" @change="refreshOptions">
          <option value="">Select category</option>
          <option
            v-for="option in options.categories"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(
            error?.fieldErrors ?? {},
            'ticketCategoryId',
            'TicketCategoryId',
          )"
          :key="message"
          >{{ message }}</small
        >
      </label>

      <label v-if="isEdit">
        Status
        <select v-model="form.ticketStatusId">
          <option value="">Select status</option>
          <option
            v-for="option in options.statuses"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(
            error?.fieldErrors ?? {},
            'ticketStatusId',
            'TicketStatusId',
          )"
          :key="message"
          >{{ message }}</small
        >
      </label>

      <label>
        Priority
        <select v-model="form.ticketPriorityId">
          <option value="">Select priority</option>
          <option
            v-for="option in options.priorities"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(
            error?.fieldErrors ?? {},
            'ticketPriorityId',
            'TicketPriorityId',
          )"
          :key="message"
          >{{ message }}</small
        >
      </label>

      <label>
        Customer
        <select v-model="form.customerId" @change="onCustomerChanged">
          <option value="">Select customer</option>
          <option
            v-for="option in options.customers"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'customerId', 'CustomerId')"
          :key="message"
          >{{ message }}</small
        >
      </label>
      <label>
        Property
        <select v-model="form.propertyId" @change="onPropertyChanged">
          <option value="">Select property</option>
          <option
            v-for="option in options.properties"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'propertyId', 'PropertyId')"
          :key="message"
          >{{ message }}</small
        >
      </label>
      <label>
        Unit
        <select v-model="form.unitId" @change="refreshOptions">
          <option value="">Select unit</option>
          <option
            v-for="option in options.units"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'unitId', 'UnitId')"
          :key="message"
          >{{ message }}</small
        >
      </label>
      <label>
        Resident
        <select v-model="form.residentId" @change="refreshOptions">
          <option value="">Select resident</option>
          <option
            v-for="option in options.residents"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'residentId', 'ResidentId')"
          :key="message"
          >{{ message }}</small
        >
      </label>
      <label>
        Vendor
        <select v-model="form.vendorId">
          <option value="">Select vendor</option>
          <option
            v-for="option in options.vendors"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option>
        </select>
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'vendorId', 'VendorId')"
          :key="message"
          >{{ message }}</small
        >
      </label>
      <label>
        Due at
        <input v-model="form.dueAt" type="datetime-local" />
        <small
          v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'dueAt', 'DueAt')"
          :key="message"
          >{{ message }}</small
        >
      </label>

      <div class="actions full">
        <button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save ticket' }}</button>
        <RouterLink :to="`/companies/${params.companySlug.value}/tickets`">Cancel</RouterLink>
      </div>
    </form>
  </main>
</template>

<style scoped>
.operation-page {
  display: grid;
  gap: 1rem;
}
.eyebrow {
  margin: 0 0 0.25rem;
  color: #667085;
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
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.wide {
  grid-column: span 2;
}
.full {
  grid-column: 1 / -1;
}
label {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}
input,
select,
textarea,
button {
  border: 1px solid #98a2b3;
  border-radius: 6px;
  padding: 0.5rem 0.7rem;
  font: inherit;
}
small {
  color: #b42318;
}
button {
  background: #155eef;
  color: #fff;
  border-color: #155eef;
}
.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
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
@media (max-width: 800px) {
  .form-grid,
  .wide {
    grid-template-columns: 1fr;
    grid-column: 1 / -1;
  }
}
</style>
