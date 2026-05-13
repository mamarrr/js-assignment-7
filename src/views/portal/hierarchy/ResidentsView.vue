<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { residentsApi } from '@/api/portal/residents'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import RecordTable from './RecordTable.vue'
import { buildPayload, pickFirstArray, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const notifications = useNotificationStore()
const fields: FieldConfig[] = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'idCode', label: 'ID code' },
  { key: 'preferredLanguage', label: 'Preferred language' },
]
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const rows = ref<ApiRecord[]>([])
const form = ref(seedForm(fields))
const companySlug = () => routeParam(route.params.companySlug)

const load = async () => {
  rows.value = pickFirstArray(await residentsApi.list(companySlug()), ['residents', 'items', 'results'])
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
    await residentsApi.create(companySlug(), buildPayload(fields, form.value))
    form.value = seedForm(fields)
    notifications.push({ tone: 'success', title: 'Resident created.' })
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
      <RecordForm v-model="form" title="Add resident" :fields="fields" :pending="pending" :error="error" submit-label="Add resident" @submit="create" />
      <RecordTable
        title="Residents"
        :rows="rows"
        :columns="[
          { key: 'fullName', label: 'Name' },
          { key: 'idCode', label: 'ID code' },
          { key: 'preferredLanguage', label: 'Language' },
        ]"
        :row-to="(row) => `/companies/${companySlug()}/residents/${row.residentIdCode ?? row.idCode}`"
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
