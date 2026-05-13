<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { unitsApi } from '@/api/portal/units'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import { buildPayload, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const router = useRouter()
const notifications = useNotificationStore()
const fields: FieldConfig[] = [
  { key: 'unitNr', label: 'Unit number' },
  { key: 'floorNr', label: 'Floor', type: 'number' },
  { key: 'sizeM2', label: 'Size m2', type: 'number' },
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
const unitSlug = () => routeParam(route.params.unitSlug)

onMounted(async () => {
  try {
    form.value = seedForm(fields, await unitsApi.profile(companySlug(), customerSlug(), propertySlug(), unitSlug()))
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
      await unitsApi.updateProfile(companySlug(), customerSlug(), propertySlug(), unitSlug(), buildPayload(fields, form.value)),
    )
    notifications.push({ tone: 'success', title: 'Unit profile updated.' })
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
    await unitsApi.deleteProfile(companySlug(), customerSlug(), propertySlug(), unitSlug(), {
      deleteConfirmation: String(deleteForm.value.deleteConfirmation ?? ''),
    })
    notifications.push({ tone: 'success', title: 'Unit deleted.' })
    await router.push(`/companies/${companySlug()}/customers/${customerSlug()}/properties/${propertySlug()}/units`)
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
      <RecordForm v-model="form" title="Unit profile" :fields="fields" :pending="pending" :error="error" submit-label="Save profile" @submit="save" />
      <RecordForm v-model="deleteForm" title="Delete unit" :fields="[{ key: 'deleteConfirmation', label: 'Delete confirmation' }]" :pending="pending" :error="null" submit-label="Delete unit" danger @submit="remove" />
    </div>
  </HierarchyState>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}
</style>
