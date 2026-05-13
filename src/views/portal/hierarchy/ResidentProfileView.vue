<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { residentsApi } from '@/api/portal/residents'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import { buildPayload, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const router = useRouter()
const fields: FieldConfig[] = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'idCode', label: 'ID code' },
  { key: 'preferredLanguage', label: 'Preferred language' },
]
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const form = ref<ApiRecord>({})
const deleteForm = ref<ApiRecord>({ deleteConfirmation: '' })
const companySlug = () => routeParam(route.params.companySlug)
const residentIdCode = () => routeParam(route.params.residentIdCode)

onMounted(async () => {
  try {
    form.value = seedForm(fields, await residentsApi.profile(companySlug(), residentIdCode()))
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    loading.value = false
  }
})

const save = async () => {
  pending.value = true
  error.value = null
  try {
    form.value = seedForm(
      fields,
      await residentsApi.updateProfile(companySlug(), residentIdCode(), buildPayload(fields, form.value)),
    )
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    pending.value = false
  }
}

const remove = async () => {
  pending.value = true
  error.value = null
  try {
    await residentsApi.deleteProfile(companySlug(), residentIdCode(), {
      deleteConfirmation: String(deleteForm.value.deleteConfirmation ?? ''),
    })
    await router.push(`/companies/${companySlug()}/residents`)
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <HierarchyState :loading="loading" :error="error">
    <div class="grid">
      <RecordForm v-model="form" title="Resident profile" :fields="fields" :pending="pending" :error="error" submit-label="Save profile" @submit="save" />
      <RecordForm v-model="deleteForm" title="Delete resident" :fields="[{ key: 'deleteConfirmation', label: 'Delete confirmation' }]" :pending="pending" :error="null" submit-label="Delete resident" danger @submit="remove" />
    </div>
  </HierarchyState>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}
</style>

