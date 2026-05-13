<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppFieldErrors from '@/components/AppFieldErrors.vue'
import { workLogsApi, type WorkLogFormDto } from '@/api/portal/workLogs'
import {
  emptyToNull,
  fieldErrors,
  fromDateTimeLocal,
  summaryErrors,
  toDateTimeLocal,
  useOperationState,
  usePortalRouteParams,
} from './operationView'

const router = useRouter()
const params = usePortalRouteParams()
const { loading, saving, error, capture, notifySuccess } = useOperationState()
const isEdit = computed(() => Boolean(params.workLogId.value))
const bootstrap = ref<WorkLogFormDto>({})
const fieldErrorMap = computed(() => error.value?.fieldErrors ?? {})
const summary = computed(() => summaryErrors(error.value?.fieldErrors))
const form = reactive({
  workStart: '',
  workEnd: '',
  hours: '',
  materialCost: '',
  laborCost: '',
  description: '',
})

const fill = (dto: WorkLogFormDto) => {
  bootstrap.value = dto
  form.workStart = toDateTimeLocal(dto.workStart)
  form.workEnd = toDateTimeLocal(dto.workEnd)
  form.hours = dto.hours == null ? '' : String(dto.hours)
  form.materialCost = dto.materialCost == null ? '' : String(dto.materialCost)
  form.laborCost = dto.laborCost == null ? '' : String(dto.laborCost)
  form.description = dto.description ?? ''
}

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    fill(
      isEdit.value
        ? await workLogsApi.editForm(
            params.companySlug.value,
            params.ticketId.value,
            params.scheduledWorkId.value,
            params.workLogId.value,
          )
        : await workLogsApi.form(
            params.companySlug.value,
            params.ticketId.value,
            params.scheduledWorkId.value,
          ),
    )
  } catch (caught) {
    capture(caught)
  } finally {
    loading.value = false
  }
}

const toNumber = (value: string) => (value === '' ? null : Number(value))

const submit = async () => {
  saving.value = true
  error.value = undefined
  try {
    const body = {
      workStart: fromDateTimeLocal(form.workStart),
      workEnd: fromDateTimeLocal(form.workEnd),
      hours: toNumber(form.hours),
      materialCost: bootstrap.value.canViewCosts ? toNumber(form.materialCost) : null,
      laborCost: bootstrap.value.canViewCosts ? toNumber(form.laborCost) : null,
      description: emptyToNull(form.description),
    }
    if (isEdit.value) {
      await workLogsApi.update(
        params.companySlug.value,
        params.ticketId.value,
        params.scheduledWorkId.value,
        params.workLogId.value,
        body,
      )
    } else {
      await workLogsApi.create(
        params.companySlug.value,
        params.ticketId.value,
        params.scheduledWorkId.value,
        body,
      )
    }
    notifySuccess(isEdit.value ? 'Work log updated.' : 'Work log created.')
    await router.push(
      `/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/work-logs`,
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
      <p class="eyebrow">{{ bootstrap.ticketNr }}</p>
      <h1>{{ isEdit ? 'Edit work log' : 'Add work log' }}</h1>
      <p class="muted">{{ bootstrap.vendorName }}</p>
    </header>
    <AppErrorAlert v-if="error" :error="error" />
    <p v-if="loading">Loading work log form...</p>
    <form v-else class="panel form-grid" @submit.prevent="submit">
      <ul v-if="summary.length > 0" class="alert danger full">
        <li v-for="message in summary" :key="message">{{ message }}</li>
      </ul>
      <label
        >Work start<input
          v-model="form.workStart"
          type="datetime-local"
          :aria-invalid="
            fieldErrors(fieldErrorMap, 'workStart', 'WorkStart').length > 0
          " /><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'workStart', 'WorkStart')"
      /></label>
      <label
        >Work end<input
          v-model="form.workEnd"
          type="datetime-local"
          :aria-invalid="
            fieldErrors(fieldErrorMap, 'workEnd', 'WorkEnd').length > 0
          " /><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'workEnd', 'WorkEnd')"
      /></label>
      <label :class="{ full: !bootstrap.canViewCosts }"
        >Hours<input
          v-model="form.hours"
          type="number"
          min="0"
          step="0.25"
          :aria-invalid="fieldErrors(fieldErrorMap, 'hours', 'Hours').length > 0" /><AppFieldErrors
          :errors="fieldErrors(fieldErrorMap, 'hours', 'Hours')"
      /></label>
      <template v-if="bootstrap.canViewCosts">
        <label
          >Material cost<input
            v-model="form.materialCost"
            type="number"
            min="0"
            step="0.01"
            :aria-invalid="
              fieldErrors(fieldErrorMap, 'materialCost', 'MaterialCost').length > 0
            " /><AppFieldErrors
            :errors="fieldErrors(fieldErrorMap, 'materialCost', 'MaterialCost')"
        /></label>
        <label
          >Labor cost<input
            v-model="form.laborCost"
            type="number"
            min="0"
            step="0.01"
            :aria-invalid="
              fieldErrors(fieldErrorMap, 'laborCost', 'LaborCost').length > 0
            " /><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'laborCost', 'LaborCost')"
        /></label>
      </template>
      <label class="full"
        >Description<textarea
          v-model="form.description"
          rows="4"
          :aria-invalid="
            fieldErrors(fieldErrorMap, 'description', 'Description').length > 0
          " /><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'description', 'Description')"
      /></label>
      <div class="actions full">
        <button type="submit" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save work log' }}
        </button>
        <RouterLink
          :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${params.scheduledWorkId.value}/work-logs`"
          >Cancel</RouterLink
        >
      </div>
    </form>
  </main>
</template>

<style scoped>
.operation-page {
  display: grid;
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
.panel {
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
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
textarea,
button {
  border: 1px solid #98a2b3;
  border-radius: 6px;
  padding: 0.5rem 0.7rem;
  font: inherit;
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
@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
