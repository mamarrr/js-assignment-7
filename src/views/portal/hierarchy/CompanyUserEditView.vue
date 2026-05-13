<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/errors'
import { isApiError } from '@/api/errors'
import { companyUsersApi } from '@/api/portal/companyUsers'
import type { ApiRecord } from '@/types/api'
import HierarchyState from './HierarchyState.vue'
import RecordForm from './RecordForm.vue'
import { buildPayload, routeParam, seedForm, type FieldConfig } from './helpers'

const route = useRoute()
const router = useRouter()
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
const companySlug = () => routeParam(route.params.companySlug)
const membershipId = () => routeParam(route.params.membershipId)

onMounted(async () => {
  try {
    const roles = await companyUsersApi.roles(companySlug())
    fields.value = fields.value.map((field) => (field.key === 'roleId' ? { ...field, options: roles } : field))
    form.value = seedForm(fields.value, await companyUsersApi.edit(companySlug(), membershipId()))
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
      <RecordForm v-model="form" title="Edit company user" :fields="fields" :pending="pending" :error="error" submit-label="Save user" @submit="save" />
      <section class="danger-card">
        <h2>Remove user</h2>
        <p>Removing a user revokes their company access.</p>
        <button :disabled="pending" @click="remove">Remove user</button>
      </section>
    </div>
  </HierarchyState>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}

.danger-card {
  border: 1px solid #f3b9b9;
  border-radius: 8px;
  padding: 1rem;
  background: #fff5f5;
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

