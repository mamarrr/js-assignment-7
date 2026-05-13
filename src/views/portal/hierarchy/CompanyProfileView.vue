<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { companyApi } from '@/api/portal/resources'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import { buildPayload, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const router = useRouter()
const fields: FieldConfig[] = [
  { key: 'name', label: 'Name' },
  { key: 'registryCode', label: 'Registry code' },
  { key: 'vatNumber', label: 'VAT number' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
]

const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const success = ref('')
const form = ref<ApiRecord>({})
const deleteForm = ref<ApiRecord>({ deleteConfirmation: '' })
const confirm = ref('')
const companySlug = () => routeParam(route.params.companySlug)

onMounted(async () => {
  try {
    const profile = await companyApi.profile(companySlug())
    form.value = seedForm(fields, profile)
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
    const profile = await companyApi.updateProfile(companySlug(), buildPayload(fields, form.value))
    form.value = seedForm(fields, profile)
    success.value = 'Company profile updated.'
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    pending.value = false
  }
}

const remove = async () => {
  confirm.value = String(deleteForm.value.deleteConfirmation ?? '')
  if (confirm.value !== 'DELETE') return
  pending.value = true
  try {
    await companyApi.deleteCompany(companySlug(), { deleteConfirmation: confirm.value })
    await router.push('/workspaces')
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <HierarchyState :loading="loading" :error="error">
    <div class="profile-grid">
      <p v-if="success" class="success" role="status">{{ success }}</p>
      <RecordForm
        v-model="form"
        title="Company profile"
        description="Update company contact and billing identity details."
        :fields="fields"
        :pending="pending"
        :error="error"
        submit-label="Save profile"
        @submit="save"
      />
      <RecordForm
        v-model="deleteForm"
        title="Delete company"
        description="Type DELETE to confirm this destructive action."
        :fields="[{ key: 'deleteConfirmation', label: 'Confirmation' }]"
        :pending="pending"
        :error="null"
        submit-label="Delete company"
        danger
        @submit="remove"
      />
    </div>
  </HierarchyState>
</template>

<style scoped>
.profile-grid {
  display: grid;
  gap: 1rem;
}

.success {
  border: 1px solid #9bd8b4;
  border-radius: 8px;
  padding: 0.75rem;
  background: #f0fff5;
}
</style>
