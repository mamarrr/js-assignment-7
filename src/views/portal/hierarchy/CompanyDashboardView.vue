<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { companyApi } from '@/api/portal/resources'
import type { ApiRecord } from '@/types/api'
import DashboardSummary from './DashboardSummary.vue'
import HierarchyState from './HierarchyState.vue'
import { routeParam, text } from './helpers'

const route = useRoute()
const loading = ref(true)
const error = ref<ApiError | null>(null)
const dashboard = ref<ApiRecord>({})
const companySlug = () => routeParam(route.params.companySlug)

onMounted(async () => {
  try {
    dashboard.value = await companyApi.dashboard(companySlug())
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
      :title="text(dashboard, ['companyName', 'name'], companySlug())"
      :subtitle="`Current role: ${text(dashboard, ['roleCode', 'roleLabel'])}`"
      :links="[
        { label: 'Profile', to: `/companies/${companySlug()}/profile` },
        { label: 'Customers', to: `/companies/${companySlug()}/customers` },
        { label: 'Residents', to: `/companies/${companySlug()}/residents` },
        { label: 'Tickets', to: `/companies/${companySlug()}/tickets` },
      ]"
    />
  </HierarchyState>
</template>
