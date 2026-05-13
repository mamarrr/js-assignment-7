<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { scheduledWorkApi, type ScheduledWorkFormDto } from '@/api/portal/scheduledWork'
import { emptyToNull, fromDateTimeLocal, optionLabel, optionValue, toDateTimeLocal, useOperationState, usePortalRouteParams } from './operationView'

const router = useRouter()
const params = usePortalRouteParams()
const { loading, saving, error, capture } = useOperationState()
const isEdit = computed(() => Boolean(params.scheduledWorkId.value))
let bootstrap: ScheduledWorkFormDto = {}
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
  bootstrap = dto
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
        ? await scheduledWorkApi.editForm(params.companySlug.value, params.ticketId.value, params.scheduledWorkId.value)
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
    const body = {
      vendorId: form.vendorId,
      workStatusId: form.workStatusId,
      scheduledStart: fromDateTimeLocal(form.scheduledStart) ?? undefined,
      scheduledEnd: fromDateTimeLocal(form.scheduledEnd),
      realStart: fromDateTimeLocal(form.realStart),
      realEnd: fromDateTimeLocal(form.realEnd),
      notes: emptyToNull(form.notes),
    }
    const saved = isEdit.value
      ? await scheduledWorkApi.update(params.companySlug.value, params.ticketId.value, params.scheduledWorkId.value, body)
      : await scheduledWorkApi.create(params.companySlug.value, params.ticketId.value, body)
    await router.push(`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work/${saved.scheduledWorkId ?? params.scheduledWorkId.value}`)
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
    <section v-if="error" class="alert danger"><strong>{{ error.title }}</strong><p>{{ error.message }}</p></section>
    <p v-if="loading">Loading scheduled work form...</p>
    <form v-else class="panel form-grid" @submit.prevent="submit">
      <label>Vendor<select v-model="form.vendorId" required><option value="">Select vendor</option><option v-for="option in bootstrap.vendors" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select></label>
      <label>Work status<select v-model="form.workStatusId"><option value="">Select status</option><option v-for="option in bootstrap.workStatuses" :key="optionValue(option)" :value="optionValue(option)">{{ optionLabel(option) }}</option></select></label>
      <label>Scheduled start<input v-model="form.scheduledStart" type="datetime-local" required /></label>
      <label>Scheduled end<input v-model="form.scheduledEnd" type="datetime-local" /></label>
      <label>Actual start<input v-model="form.realStart" type="datetime-local" /></label>
      <label>Actual end<input v-model="form.realEnd" type="datetime-local" /></label>
      <label class="full">Notes<textarea v-model="form.notes" rows="4" maxlength="4000" /></label>
      <div class="actions full">
        <button type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save scheduled work' }}</button>
        <RouterLink :to="`/companies/${params.companySlug.value}/tickets/${params.ticketId.value}/scheduled-work`">Cancel</RouterLink>
      </div>
    </form>
  </main>
</template>

<style scoped>
.operation-page { display: grid; gap: 1rem; }
.eyebrow, .muted { color: #667085; }
.eyebrow { margin: 0 0 .25rem; text-transform: uppercase; font-size: .75rem; font-weight: 700; }
.panel { border: 1px solid #d0d5dd; border-radius: 8px; padding: 1rem; background: #fff; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.full { grid-column: 1 / -1; }
label { display: grid; gap: .35rem; font-weight: 600; }
input, select, textarea, button { border: 1px solid #98a2b3; border-radius: 6px; padding: .5rem .7rem; font: inherit; }
button { background: #155eef; color: #fff; border-color: #155eef; }
.actions { display: flex; gap: .75rem; align-items: center; }
.alert { border-radius: 8px; padding: .8rem; }
.danger { background: #fef3f2; border: 1px solid #fecdca; }
@media (max-width: 800px) { .form-grid { grid-template-columns: 1fr; } }
</style>
