<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppFieldErrors from '@/components/AppFieldErrors.vue'
import { scheduledWorkApi, type ScheduledWorkFormDto } from '@/api/portal/scheduledWork'
import {
  emptyToNull,
  fieldErrors,
  fromDateTimeLocal,
  optionLabel,
  optionValue,
  summaryErrors,
  toDateTimeLocal,
  useOperationState,
  usePortalRouteParams,
} from './operationView'

const router = useRouter()
const params = usePortalRouteParams()
const { loading, saving, error, capture, notifySuccess } = useOperationState()
const isEdit = computed(() => Boolean(params.scheduledWorkId.value))
const bootstrap = ref<ScheduledWorkFormDto>({})
const fieldErrorMap = computed(() => error.value?.fieldErrors ?? {})
const summary = computed(() => summaryErrors(error.value?.fieldErrors))
const form = reactive({
  vendorId: '',
  workStatusId: '',
  scheduledStart: '',
  scheduledEnd: '',
  realStart: '',
  realEnd: '',
  notes: '',
})

const fill = (dto: ScheduledWorkFormDto) => {
  bootstrap.value = dto
  form.vendorId = dto.vendorId ?? ''
  form.workStatusId = dto.workStatusId ?? ''
  form.scheduledStart = toDateTimeLocal(dto.scheduledStart)
  form.scheduledEnd = toDateTimeLocal(dto.scheduledEnd)
  form.realStart = toDateTimeLocal(dto.realStart)
  form.realEnd = toDateTimeLocal(dto.realEnd)
  form.notes = dto.notes ?? ''
}

const load = async () => {
  loading.value = true
  error.value = undefined
  try {
    fill(
      isEdit.value
        ? await scheduledWorkApi.editForm(
            params.companySlug.value,
            params.ticketId.value,
            params.scheduledWorkId.value,
          )
        : await scheduledWorkApi.form(params.companySlug.value, params.ticketId.value),
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
    const scheduledStart = fromDateTimeLocal(form.scheduledStart)
    if (!scheduledStart) {
      error.value = {
        status: 0,
        title: 'Validation failed',
        message: 'Review the highlighted fields and try again.',
        fieldErrors: { scheduledStart: ['Scheduled start is required.'] },
        raw: null,
      }
      return
    }
    const body = {
      vendorId: emptyToNull(form.vendorId) ?? undefined,
      workStatusId: emptyToNull(form.workStatusId) ?? undefined,
      scheduledStart,
      scheduledEnd: fromDateTimeLocal(form.scheduledEnd),
      realStart: fromDateTimeLocal(form.realStart),
      realEnd: fromDateTimeLocal(form.realEnd),
      notes: emptyToNull(form.notes),
    }
    const saved = isEdit.value
      ? await scheduledWorkApi.update(
          params.companySlug.value,
          params.ticketId.value,
          params.scheduledWorkId.value,
          body,
        )
      : await scheduledWorkApi.create(params.companySlug.value, params.ticketId.value, body)
    notifySuccess(isEdit.value ? 'Scheduled work updated.' : 'Scheduled work created.')
    await router.push(
      `/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${saved.scheduledWorkId ?? params.scheduledWorkId.value}`,
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
      <h1>{{ isEdit ? 'Edit scheduled work' : 'Create scheduled work' }}</h1>
      <p class="muted">{{ bootstrap.ticketTitle }}</p>
    </header>
    <AppErrorAlert v-if="error" :error="error" />
    <p v-if="loading">Loading scheduled work form...</p>
    <form v-else class="panel form-grid" @submit.prevent="submit">
      <ul v-if="summary.length > 0" class="alert danger full">
        <li v-for="message in summary" :key="message">{{ message }}</li>
      </ul>
      <label
        >Vendor<select
          v-model="form.vendorId"
          :aria-invalid="fieldErrors(fieldErrorMap, 'vendorId', 'VendorId').length > 0"
        >
          <option value="">Select vendor</option>
          <option
            v-for="option in bootstrap.vendors"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option></select
        ><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'vendorId', 'VendorId')"
      /></label>
      <label
        >Work status<select
          v-model="form.workStatusId"
          :aria-invalid="fieldErrors(fieldErrorMap, 'workStatusId', 'WorkStatusId').length > 0"
        >
          <option value="">Select status</option>
          <option
            v-for="option in bootstrap.workStatuses"
            :key="optionValue(option)"
            :value="optionValue(option)"
          >
            {{ optionLabel(option) }}
          </option></select
        ><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'workStatusId', 'WorkStatusId')"
      /></label>
      <label
        >Scheduled start<input
          v-model="form.scheduledStart"
          type="datetime-local"
          required
          :aria-invalid="
            fieldErrors(fieldErrorMap, 'scheduledStart', 'ScheduledStart').length > 0
          " /><AppFieldErrors
          :errors="fieldErrors(fieldErrorMap, 'scheduledStart', 'ScheduledStart')"
      /></label>
      <label
        >Scheduled end<input
          v-model="form.scheduledEnd"
          type="datetime-local"
          :aria-invalid="
            fieldErrors(fieldErrorMap, 'scheduledEnd', 'ScheduledEnd').length > 0
          " /><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'scheduledEnd', 'ScheduledEnd')"
      /></label>
      <label
        >Actual start<input
          v-model="form.realStart"
          type="datetime-local"
          :aria-invalid="
            fieldErrors(fieldErrorMap, 'realStart', 'RealStart').length > 0
          " /><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'realStart', 'RealStart')"
      /></label>
      <label
        >Actual end<input
          v-model="form.realEnd"
          type="datetime-local"
          :aria-invalid="
            fieldErrors(fieldErrorMap, 'realEnd', 'RealEnd').length > 0
          " /><AppFieldErrors :errors="fieldErrors(fieldErrorMap, 'realEnd', 'RealEnd')"
      /></label>
      <label class="full"
        >Notes<textarea
          v-model="form.notes"
          rows="4"
          maxlength="4000"
          :aria-invalid="fieldErrors(fieldErrorMap, 'notes', 'Notes').length > 0" /><AppFieldErrors
          :errors="fieldErrors(fieldErrorMap, 'notes', 'Notes')"
      /></label>
      <div class="actions full">
        <button type="submit" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save scheduled work' }}
        </button>
        <RouterLink
          :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work`"
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
select,
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
