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
import { buildPayload, routeParam, seedForm, text, type FieldConfig } from './helpers'

const route = useRoute()
const router = useRouter()
const notifications = useNotificationStore()
const fields = ref<FieldConfig[]>([
  { key: 'roleId', label: 'Role', type: 'select', options: [] },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'validFrom', label: 'Valid from', type: 'date' },
  { key: 'validTo', label: 'Valid to', type: 'date' },
])
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const form = ref<ApiRecord>({})
const details = ref<ApiRecord>({})
const confirmRemoveOpen = ref(false)
const companySlug = () => routeParam(route.params.companySlug)
const membershipId = () => routeParam(route.params.membershipId)

onMounted(async () => {
  try {
    const roles = await companyUsersApi.roles(companySlug())
    fields.value = fields.value.map((field) => (field.key === 'roleId' ? { ...field, options: roles } : field))
    details.value = await companyUsersApi.edit(companySlug(), membershipId())
    form.value = seedForm(fields.value, details.value)
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
      fields.value,
      await companyUsersApi.update(companySlug(), membershipId(), buildPayload(fields.value, form.value)),
    )
    notifications.push({ tone: 'success', title: 'Company user updated.' })
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
    await companyUsersApi.remove(companySlug(), membershipId())
    notifications.push({ tone: 'success', title: 'Company user removed.' })
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
    <div class="grid">
      <section class="detail-card">
        <p class="eyebrow">Company membership</p>
        <h1>{{ text(details, ['fullName', 'name'], 'Company user') }}</h1>
        <p class="muted">{{ text(details, ['email']) }}</p>
        <p v-if="details.protectedReason" class="info">{{ details.protectedReason }}</p>
        <RouterLink
          v-if="details.canTransferOwnership"
          :to="`/companies/${companySlug()}/users/transfer-ownership`"
        >
          Transfer ownership
        </RouterLink>
      </section>
      <RecordForm v-model="form" title="Edit company user" :fields="fields" :pending="pending" :error="error" submit-label="Save user" @submit="save" />
      <section class="danger-card">
        <h2>Remove user</h2>
        <p>Removing a user revokes their company access.</p>
        <button :disabled="pending" @click="confirmRemoveOpen = true">Remove user</button>
      </section>
      <AppConfirmationDialog
        :open="confirmRemoveOpen"
        title="Remove company user"
        message="This will revoke this user's access to the company workspace."
        confirm-label="Remove user"
        destructive
        :pending="pending"
        @cancel="confirmRemoveOpen = false"
        @confirm="remove"
      />
    </div>
  </HierarchyState>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}

.detail-card,
.danger-card {
  border: 1px solid #f3b9b9;
  border-radius: 8px;
  padding: 1rem;
  background: #fff5f5;
}

.detail-card {
  display: grid;
  gap: 0.35rem;
  border-color: #d6dde8;
  background: #fff;
}

.eyebrow,
h1,
.muted {
  margin: 0;
}

.eyebrow {
  color: #155eef;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  font-size: 1.2rem;
}

.muted {
  color: #5d687a;
}

.info {
  border: 1px solid #b9c3d0;
  border-radius: 6px;
  padding: 0.65rem;
  background: #f8fafc;
}

button {
  border: 0;
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  background: #b42318;
  color: #fff;
  font-weight: 700;
}
</style>
