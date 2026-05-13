<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { propertiesApi } from '@/api/portal/properties'
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
  { key: 'addressLine', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'postalCode', label: 'Postal code' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const form = ref<ApiRecord>({})
const deleteForm = ref<ApiRecord>({ deleteConfirmation: '' })
const companySlug = () => routeParam(route.params.companySlug)
const customerSlug = () => routeParam(route.params.customerSlug)
const propertySlug = () => routeParam(route.params.propertySlug)

onMounted(async () => {
  try {
    form.value = seedForm(
      fields,
      await propertiesApi.profile(companySlug(), customerSlug(), propertySlug()),
    )
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
      await propertiesApi.updateProfile(
        companySlug(),
        customerSlug(),
        propertySlug(),
        buildPayload(fields, form.value),
      ),
    )
    notifications.push({ tone: 'success', title: 'Property profile updated.' })
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
    await propertiesApi.deleteProfile(companySlug(), customerSlug(), propertySlug(), {
      deleteConfirmation: String(deleteForm.value.deleteConfirmation ?? ''),
    })
    notifications.push({ tone: 'success', title: 'Property deleted.' })
    await router.push(`/companies/${companySlug()}/customers/${customerSlug()}/properties`)
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
      <RecordForm
        v-model="form"
        title="Property profile"
        :fields="fields"
        :pending="pending"
        :error="error"
        submit-label="Save profile"
        @submit="save"
      />
      <RecordForm
        v-model="deleteForm"
        title="Delete property"
        :fields="[{ key: 'deleteConfirmation', label: 'Delete confirmation' }]"
        :pending="pending"
        :error="null"
        submit-label="Delete property"
        danger
        @submit="remove"
      />
    </div>
  </HierarchyState>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}
</style>
