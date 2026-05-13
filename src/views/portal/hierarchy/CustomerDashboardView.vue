<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { customersApi } from '@/api/portal/customers'
import type { ApiRecord } from '@/types/api'
import DashboardSummary from './DashboardSummary.vue'
import HierarchyState from './HierarchyState.vue'
import { routeParam, text } from './helpers'

const route = useRoute()
const loading = ref(true)
const error = ref<ApiError | null>(null)
const dashboard = ref<ApiRecord>({})
const companySlug = () => routeParam(route.params.companySlug)
const customerSlug = () => routeParam(route.params.customerSlug)

onMounted(async () => {
  try {
    dashboard.value = await customersApi.dashboard(companySlug(), customerSlug())
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <HierarchyState :loading="loading" :error="error">
    <DashboardSummary
      :dashboard="dashboard"
      :title="text(dashboard.context ?? dashboard, ['customerName', 'name'], customerSlug())"
      :links="[
        { label: 'Profile', to: `/companies/${companySlug()}/customers/${customerSlug()}/profile` },
        { label: 'Properties', to: `/companies/${companySlug()}/customers/${customerSlug()}/properties` },
        { label: 'Tickets', to: `/companies/${companySlug()}/customers/${customerSlug()}/tickets` },
      ]"
    />
  </HierarchyState>
</template>

