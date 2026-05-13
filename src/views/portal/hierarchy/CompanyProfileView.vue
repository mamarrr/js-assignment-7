<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { companyApi } from '@/api/portal/resources'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import { buildPayload, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const router = useRouter()
const notifications = useNotificationStore()
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
const deleteError = ref<ApiError | null>(null)
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
    notifications.push({ tone: 'success', title: 'Company profile updated.' })
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    pending.value = false
  }
}

const remove = async () => {
  confirm.value = String(deleteForm.value.deleteConfirmation ?? '')
  if (confirm.value !== 'DELETE') {
    deleteError.value = {
      status: 400,
      title: 'Confirmation required',
      message: 'Type DELETE to confirm this action.',
      fieldErrors: { deleteConfirmation: ['Type DELETE to confirm this action.'] },
      raw: null,
    }
    return
  }
  pending.value = true
  deleteError.value = null
  try {
    await companyApi.deleteCompany(companySlug())
    notifications.push({ tone: 'success', title: 'Company deleted.' })
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
        :error="deleteError"
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
</style>
