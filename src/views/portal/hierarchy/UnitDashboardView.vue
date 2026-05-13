<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { unitsApi } from '@/api/portal/units'
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
const propertySlug = () => routeParam(route.params.propertySlug)
const unitSlug = () => routeParam(route.params.unitSlug)

onMounted(async () => {
  try {
    dashboard.value = await unitsApi.dashboard(
      companySlug(),
      customerSlug(),
      propertySlug(),
      unitSlug(),
    )
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
      :title="text(dashboard.context ?? dashboard, ['unitNr', 'unitName', 'name'], unitSlug())"
      :links="[
        {
          label: 'Profile',
          to: `/companies/${companySlug()}/customers/${customerSlug()}/properties/${propertySlug()}/units/${unitSlug()}/profile`,
        },
        {
          label: 'Leases',
          to: `/companies/${companySlug()}/customers/${customerSlug()}/properties/${propertySlug()}/units/${unitSlug()}/leases`,
        },
        {
          label: 'Tickets',
          to: `/companies/${companySlug()}/customers/${customerSlug()}/properties/${propertySlug()}/units/${unitSlug()}/tickets`,
        },
      ]"
    />
  </HierarchyState>
</template>
