<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ticketsApi, type TicketFormDto } from '@/api/portal/tickets'
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
const params = usePortalRouteParams()
const { loading, saving, error, success, capture } = useOperationState()
const isEdit = computed(() => Boolean(params.ticketId.value))
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
let bootstrap: TicketFormDto = {}

const options = computed(() => bootstrap.options ?? {})

const fill = (dto: TicketFormDto) => {
  bootstrap = dto
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

    success.value = isEdit.value ? 'Ticket updated.' : 'Ticket created.'
    await router.push(`/companies/${params.companySlug.value}/tickets/${saved.ticketId ?? params.ticketId.value}`)
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

    <p v-if="success" class="alert success">{{ success }}</p>
    <section v-if="error" class="alert danger" role="alert">
      <strong>{{ error.title }}</strong>
      <p>{{ error.message }}</p>
    </section>
    <p v-if="loading">Loading ticket form...</p>

    <form v-else class="panel form-grid" @submit.prevent="submit">
      <label>Ticket number<input v-model="form.ticketNr" /></label>
      <label class="wide">Title<input v-model="form.title" /></label>
      <label class="full">Description<textarea v-model="form.description" rows="5" /></label>

      <label>
        Category
        <select v-model="form.ticketCategoryId">
          <option value="">Select category</option>
          <option v-for="option in options.categories" :key="optionValue(option)" :value="optionValue(option)">
            {{ optionLabel(option) }}
          </option>
        </select>
        <small v-for="message in fieldErrors(error?.fieldErrors ?? {}, 'ticketCategoryId', 'TicketCategoryId')" :key="message">{{ message }}</small>
      </label>

      <label v-if="isEdit">
        Status
        <select v-model="form.ticketStatusId">
          <option value="">Select status</option>
          <option v-for="option in options.statuses" :key="optionValue(option)" :value="optionValue(option)">
            {{ optionLabel(option) }}
          </option>
        </select>
      </label>

      <label>
        Priority
        <select v-model="form.ticketPriorityId">
          <option value="">Select priority</option>
          <option v-for="option in options.priorities" :key="optionValue(option)" :value="optionValue(option)">
            {{ optionLabel(option) }}
          </option>
        </select>
      </label>

      <label>Customer<select v-model="form.customerId"><option value="">Select customer</option><option v-for="option in options.customers" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select></label>
      <label>Property<select v-model="form.propertyId"><option value="">Select property</option><option v-for="option in options.properties" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select></label>
      <label>Unit<select v-model="form.unitId"><option value="">Select unit</option><option v-for="option in options.units" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select></label>
      <label>Resident<select v-model="form.residentId"><option value="">Select resident</option><option v-for="option in options.residents" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select></label>
      <label>Vendor<select v-model="form.vendorId"><option value="">Select vendor</option><option v-for="option in options.vendors" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select></label>
      <label>Due at<input v-model="form.dueAt" type="datetime-local" /></label>

      <div class="actions full">
        <button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save ticket' }}</button>
        <RouterLink :to="`/companies/${params.companySlug.value}/tickets`">Cancel</RouterLink>
      </div>
    </form>
  </main>
</template>

<style scoped>
.operation-page { display: grid; gap: 1rem; }
.eyebrow { margin: 0 0 .25rem; color: #667085; text-transform: uppercase; font-size: .75rem; font-weight: 700; }
.panel { border: 1px solid #d0d5dd; border-radius: 8px; padding: 1rem; background: #fff; }
.form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.wide { grid-column: span 2; }
.full { grid-column: 1 / -1; }
label { display: grid; gap: .35rem; font-weight: 600; }
input, select, textarea, button { border: 1px solid #98a2b3; border-radius: 6px; padding: .5rem .7rem; font: inherit; }
small { color: #b42318; }
button { background: #155eef; color: #fff; border-color: #155eef; }
.actions { display: flex; gap: .75rem; align-items: center; }
.alert { border-radius: 8px; padding: .8rem; }
.danger { background: #fef3f2; border: 1px solid #fecdca; }
.success { background: #ecfdf3; border: 1px solid #abefc6; }
@media (max-width: 800px) { .form-grid, .wide { grid-template-columns: 1fr; grid-column: 1 / -1; } }
</style>
