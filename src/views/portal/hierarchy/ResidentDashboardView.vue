<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { residentsApi } from '@/api/portal/residents'
import type { ApiRecord } from '@/types/api'
import DashboardSummary from './DashboardSummary.vue'
import HierarchyState from './HierarchyState.vue'
import { routeParam, text } from './helpers'

const route = useRoute()
const loading = ref(true)
const error = ref<ApiError | null>(null)
const dashboard = ref<ApiRecord>({})
const companySlug = () => routeParam(route.params.companySlug)
const residentIdCode = () => routeParam(route.params.residentIdCode)

onMounted(async () => {
  try {
    dashboard.value = await residentsApi.dashboard(companySlug(), residentIdCode())
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
      :title="text(dashboard.context ?? dashboard, ['residentName', 'fullName', 'name'], residentIdCode())"
      :links="[
        { label: 'Profile', to: `/companies/${companySlug()}/residents/${residentIdCode()}/profile` },
        { label: 'Contacts', to: `/companies/${companySlug()}/residents/${residentIdCode()}/contacts` },
        { label: 'Leases', to: `/companies/${companySlug()}/residents/${residentIdCode()}/leases` },
        { label: 'Tickets', to: `/companies/${companySlug()}/residents/${residentIdCode()}/tickets` },
      ]"
    />
  </HierarchyState>
</template>

