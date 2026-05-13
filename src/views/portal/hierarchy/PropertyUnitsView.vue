<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { unitsApi } from '@/api/portal/units'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import RecordTable from './RecordTable.vue'
import { buildPayload, pickFirstArray, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
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
const rows = ref<ApiRecord[]>([])
const form = ref(seedForm(fields))
const companySlug = () => routeParam(route.params.companySlug)
const customerSlug = () => routeParam(route.params.customerSlug)
const propertySlug = () => routeParam(route.params.propertySlug)

const load = async () => {
  rows.value = pickFirstArray(await unitsApi.list(companySlug(), customerSlug(), propertySlug()), [
    'units',
    'items',
    'results',
  ])
}

onMounted(async () => {
  try {
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
    await unitsApi.create(
      companySlug(),
      customerSlug(),
      propertySlug(),
      buildPayload(fields, form.value),
    )
    form.value = seedForm(fields)
    notifications.push({ tone: 'success', title: 'Unit created.' })
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
        title="Add unit"
        :fields="fields"
        :pending="pending"
        :error="error"
        submit-label="Add unit"
        @submit="create"
      />
      <RecordTable
        title="Units"
        :rows="rows"
        :columns="[
          { key: 'unitNr', label: 'Unit' },
          { key: 'floorNr', label: 'Floor' },
          { key: 'sizeM2', label: 'Size m2' },
          { key: 'currentResidentName', label: 'Current resident' },
        ]"
        :row-to="
          (row) =>
            `/companies/${companySlug()}/customers/${customerSlug()}/properties/${propertySlug()}/units/${row.unitSlug ?? row.slug}`
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
