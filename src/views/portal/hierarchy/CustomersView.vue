<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { customersApi } from '@/api/portal/customers'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import RecordTable from './RecordTable.vue'
import { buildPayload, pickFirstArray, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const notifications = useNotificationStore()
const fields: FieldConfig[] = [
  { key: 'name', label: 'Name' },
  { key: 'registryCode', label: 'Registry code' },
  { key: 'billingEmail', label: 'Billing email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'billingAddress', label: 'Billing address' },
]
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const rows = ref<ApiRecord[]>([])
const form = ref(seedForm(fields))
const companySlug = () => routeParam(route.params.companySlug)

const load = async () => {
  rows.value = pickFirstArray(await customersApi.list(companySlug()), ['customers', 'items', 'results'])
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
    await customersApi.create(companySlug(), buildPayload(fields, form.value))
    form.value = seedForm(fields)
    notifications.push({ tone: 'success', title: 'Customer created.' })
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
        title="Add customer"
        description="Create a customer account under the selected management company."
        :fields="fields"
        :pending="pending"
        :error="error"
        submit-label="Add customer"
        @submit="create"
      />
      <RecordTable
        title="Current customers"
        description="Open a customer to manage properties, profile details, and tickets."
        :rows="rows"
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'registryCode', label: 'Registry code' },
          { key: 'billingEmail', label: 'Billing email' },
          { key: 'phone', label: 'Phone' },
        ]"
        :row-to="(row) => `/companies/${companySlug()}/customers/${row.customerSlug ?? row.slug}`"
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
