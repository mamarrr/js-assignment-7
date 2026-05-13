<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { companyUsersApi } from '@/api/portal/companyUsers'
import { useNotificationStore } from '@/stores/notifications'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import RecordTable from './RecordTable.vue'
import { buildPayload, pickFirstArray, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const notifications = useNotificationStore()
const fields = ref<FieldConfig[]>([
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'roleId', label: 'Role', type: 'select', options: [] },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'validFrom', label: 'Valid from', type: 'date' },
  { key: 'validTo', label: 'Valid to', type: 'date' },
])
const loading = ref(true)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const page = ref<ApiRecord>({})
const form = ref(seedForm(fields.value))
const companySlug = () => routeParam(route.params.companySlug)
const members = () => pickFirstArray(page.value, ['members', 'users', 'items'])
const requests = () => pickFirstArray(page.value, ['pendingRequests', 'accessRequests'])

const load = async () => {
  page.value = await companyUsersApi.list(companySlug())
}

onMounted(async () => {
  try {
    const roles = await companyUsersApi.roles(companySlug())
    fields.value = fields.value.map((field) =>
      field.key === 'roleId' ? { ...field, options: roles } : field,
    )
    await load()
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    loading.value = false
  }
})

const add = async () => {
  pending.value = true
  error.value = null
  try {
    await companyUsersApi.add(companySlug(), buildPayload(fields.value, form.value))
    form.value = seedForm(fields.value)
    notifications.push({ tone: 'success', title: 'Company user added.' })
    await load()
  } catch (caught) {
    error.value = isApiError(caught) ? caught : null
  } finally {
    pending.value = false
  }
}

const decide = async (requestId: unknown, approved: boolean) => {
  pending.value = true
  try {
    if (approved) await companyUsersApi.approveAccessRequest(companySlug(), String(requestId))
    else await companyUsersApi.rejectAccessRequest(companySlug(), String(requestId))
    notifications.push({
      tone: 'success',
      title: approved ? 'Access request approved.' : 'Access request rejected.',
    })
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
        title="Add company user"
        :fields="fields"
        :pending="pending"
        :error="error"
        submit-label="Add user"
        @submit="add"
      />
      <RecordTable
        title="Pending access requests"
        :rows="requests()"
        :columns="[
          { key: 'requesterName', label: 'Name' },
          { key: 'requesterEmail', label: 'Email' },
          { key: 'requestedRoleLabel', label: 'Requested role' },
          { key: 'message', label: 'Message' },
        ]"
      />
      <div v-if="requests().length" class="request-actions">
        <button
          v-for="request in requests()"
          :key="String(request.requestId)"
          :disabled="pending"
          @click="decide(request.requestId, true)"
        >
          Approve {{ request.requesterEmail }}
        </button>
        <button
          v-for="request in requests()"
          :key="`${request.requestId}-reject`"
          :disabled="pending"
          @click="decide(request.requestId, false)"
        >
          Reject {{ request.requesterEmail }}
        </button>
      </div>
      <RouterLink
        class="transfer-link"
        :to="`/companies/${companySlug()}/users/transfer-ownership`"
      >
        Transfer ownership
      </RouterLink>
      <RecordTable
        title="Current users"
        :rows="members()"
        :columns="[
          { key: 'fullName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'roleLabel', label: 'Role' },
          { key: 'jobTitle', label: 'Job title' },
        ]"
        :row-to="(row) => `/companies/${companySlug()}/users/${row.membershipId ?? row.id}`"
        action-label="Edit"
      />
    </div>
  </HierarchyState>
</template>

<style scoped>
.grid,
.request-actions {
  display: grid;
  gap: 1rem;
}

.request-actions {
  grid-template-columns: repeat(auto-fit, minmax(12rem, max-content));
}

.transfer-link {
  justify-self: start;
  border: 1px solid #b9c3d0;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  text-decoration: none;
  font-weight: 700;
}
</style>
