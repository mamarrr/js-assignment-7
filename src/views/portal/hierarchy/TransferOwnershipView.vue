<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { companyUsersApi } from '@/api/portal/companyUsers'
import AppConfirmationDialog from '@/components/AppConfirmationDialog.vue'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import { routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const router = useRouter()
const notifications = useNotificationStore()
const fields = ref<FieldConfig[]>([
  {
    key: 'targetMembershipId',
    label: 'New owner',
    type: 'select',
    options: [],
    optionValue: 'membershipId',
    optionLabel: 'fullName',
  },
])
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const form = ref<ApiRecord>(seedForm(fields.value))
const confirmOpen = ref(false)
const companySlug = () => routeParam(route.params.companySlug)

onMounted(async () => {
  try {
    const firstField = fields.value[0]
    fields.value = firstField
      ? [
          {
            ...firstField,
            options: await companyUsersApi.ownershipTransferCandidates(companySlug()),
          },
        ]
      : fields.value
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    loading.value = false
  }
})

const transfer = async () => {
  pending.value = true
  error.value = null
  try {
    await companyUsersApi.transferOwnership(companySlug(), {
      targetMembershipId: String(form.value.targetMembershipId ?? ''),
    })
    notifications.push({ tone: 'success', title: 'Company ownership transferred.' })
    await router.push(`/companies/${companySlug()}/users`)
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <HierarchyState :loading="loading" :error="error">
    <RecordForm
      v-model="form"
      title="Transfer ownership"
      description="Choose the member who should become the new company owner."
      :fields="fields"
      :pending="pending"
      :error="error"
      submit-label="Transfer ownership"
      danger
      @submit="confirmOpen = true"
    />
    <AppConfirmationDialog
      :open="confirmOpen"
      title="Transfer ownership"
      message="This will make the selected member the new company owner."
      confirm-label="Transfer ownership"
      destructive
      :pending="pending"
      @cancel="confirmOpen = false"
      @confirm="transfer"
    />
  </HierarchyState>
</template>
