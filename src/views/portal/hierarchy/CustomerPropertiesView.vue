<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { propertiesApi } from '@/api/portal/properties'
import { lookupsApi } from '@/api/portal/lookups'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import RecordTable from './RecordTable.vue'
import { buildPayload, pickFirstArray, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const notifications = useNotificationStore()
const fields = ref<FieldConfig[]>([
  { key: 'name', label: 'Name' },
  { key: 'propertyTypeId', label: 'Property type', type: 'select', options: [] },
  { key: 'addressLine', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'postalCode', label: 'Postal code' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
])
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const rows = ref<ApiRecord[]>([])
const form = ref(seedForm(fields.value))
const companySlug = () => routeParam(route.params.companySlug)
const customerSlug = () => routeParam(route.params.customerSlug)

const load = async () => {
  rows.value = pickFirstArray(await propertiesApi.list(companySlug(), customerSlug()), [
    'properties',
    'items',
    'results',
  ])
}

onMounted(async () => {
  try {
    const propertyTypeField = fields.value[1]
    if (propertyTypeField)
      fields.value[1] = { ...propertyTypeField, options: await lookupsApi.propertyTypes() }
    await load()
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    loading.value = false
  }
})

const create = async () => {
  pending.value = true
  error.value = null
  try {
    await propertiesApi.create(
      companySlug(),
      customerSlug(),
      buildPayload(fields.value, form.value),
    )
    form.value = seedForm(fields.value)
    notifications.push({ tone: 'success', title: 'Property created.' })
    await load()
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
        title="Add property"
        :fields="fields"
        :pending="pending"
        :error="error"
        submit-label="Add property"
        @submit="create"
      />
      <RecordTable
        title="Properties"
        :rows="rows"
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'propertyTypeLabel', label: 'Type' },
          { key: 'addressLine', label: 'Address' },
          { key: 'city', label: 'City' },
        ]"
        :row-to="
          (row) =>
            `/companies/${companySlug()}/customers/${customerSlug()}/properties/${row.propertySlug ?? row.slug}`
        "
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
