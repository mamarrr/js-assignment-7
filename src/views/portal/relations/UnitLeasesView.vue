<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { unitLeasesApi, type LeaseDto, type LeaseRoleOptionDto } from '@/api/portal/leases'
import { lookupsApi } from '@/api/portal/lookups'
import type { LeaseResidentSearchItemDto } from '@/types/api'
import {
  apiMessage,
  asArray,
  createLeaseForm,
  fieldError,
  optionId,
  optionLabel,
  roleOptions,
  today,
  traceId,
  useAsyncState,
  useRouteParam,
} from './relationViewUtils'

const companySlug = useRouteParam('companySlug')
const customerSlug = useRouteParam('customerSlug')
const propertySlug = useRouteParam('propertySlug')
const unitSlug = useRouteParam('unitSlug')
const state = useAsyncState()
const leases = ref<LeaseDto[]>([])
const roles = ref<LeaseRoleOptionDto[]>([])
const residentResults = ref<LeaseResidentSearchItemDto[]>([])
const editing = ref<LeaseDto | null>(null)
const deleteTarget = ref<LeaseDto | null>(null)
const form = createLeaseForm()
const search = ref('')

const scope = computed(() => ({
  companySlug: companySlug.value,
  customerSlug: customerSlug.value,
  propertySlug: propertySlug.value,
  unitSlug: unitSlug.value,
}))

const residentLabel = (resident: LeaseResidentSearchItemDto) => {
  const name = optionLabel(resident, ['fullName', 'residentName', 'name'])
  return resident.idCode ? `${name} (${resident.idCode})` : name
}

const load = async () => {
  await state.run(async () => {
    leases.value = asArray<LeaseDto>(await unitLeasesApi.list(scope.value))
    try {
      roles.value = roleOptions(await unitLeasesApi.roles(scope.value))
    } catch {
      roles.value = roleOptions(await lookupsApi.leaseRoles())
    }
  })
}

const searchResidents = async () => {
  await state.run(async () => {
    const result = await unitLeasesApi.searchResidents(scope.value, search.value)
    residentResults.value = asArray<LeaseResidentSearchItemDto>(result.residents)
  }, { pending: true })
}

const resetForm = () => {
  editing.value = null
  form.residentId = ''
  form.leaseRoleId = ''
  form.startDate = today()
  form.endDate = ''
  form.notes = ''
}

const startEdit = (lease: LeaseDto) => {
  editing.value = lease
  form.residentId = String(lease.residentId ?? '')
  form.leaseRoleId = String(lease.leaseRoleId ?? '')
  form.startDate = String(lease.startDate ?? '')
  form.endDate = String(lease.endDate ?? '')
  form.notes = String(lease.notes ?? '')
}

const submit = async () => {
  await state.run(
    async () => {
      if (editing.value?.leaseId) {
        await unitLeasesApi.update(scope.value, editing.value.leaseId, {
          leaseRoleId: form.leaseRoleId,
          startDate: form.startDate,
          endDate: form.endDate || null,
          notes: form.notes || null,
        })
      } else {
        await unitLeasesApi.create(scope.value, {
          residentId: form.residentId,
          leaseRoleId: form.leaseRoleId,
          startDate: form.startDate,
          endDate: form.endDate || null,
          notes: form.notes || null,
        })
      }
      resetForm()
      leases.value = asArray<LeaseDto>(await unitLeasesApi.list(scope.value))
    },
    { pending: true, success: editing.value ? 'Lease updated.' : 'Lease created.' },
  )
}

const deleteLease = async () => {
  if (!deleteTarget.value?.leaseId) return
  await state.run(
    async () => {
      await unitLeasesApi.delete(scope.value, deleteTarget.value!.leaseId!)
      deleteTarget.value = null
      leases.value = asArray<LeaseDto>(await unitLeasesApi.list(scope.value))
    },
    { pending: true, success: 'Lease deleted.' },
  )
}

onMounted(() => {
  void load()
})
</script>

<template>
  <main class="relations-page">
    <header class="relations-header">
      <div>
        <p>Units</p>
        <h1>Unit leases</h1>
        <span>{{ unitSlug }}</span>
      </div>
      <RouterLink :to="`/companies/${companySlug}/customers/${customerSlug}/properties/${propertySlug}/units/${unitSlug}`">
        Back to unit
      </RouterLink>
    </header>

    <section v-if="state.loading.value" class="relations-panel">Loading leases...</section>
    <section v-else class="relations-grid">
      <form class="relations-panel" @submit.prevent="submit">
        <div v-if="state.error.value" class="relations-alert danger">
          {{ apiMessage(state.error.value) }}
          <details v-if="traceId(state.error.value)">
            <summary>Technical details</summary>
            <span>Trace ID: {{ traceId(state.error.value) }}</span>
          </details>
        </div>
        <h2>{{ editing ? 'Edit lease' : 'Create lease' }}</h2>
        <label v-if="!editing">
          Resident search
          <span class="relations-inline">
            <input v-model="search" placeholder="Search residents" />
            <button :disabled="state.pending.value" type="button" @click="searchResidents">Search</button>
          </span>
        </label>
        <label v-if="!editing">
          Resident
          <select v-model="form.residentId" :disabled="Boolean(editing)" required>
            <option value="">Select resident</option>
            <option
              v-for="resident in residentResults"
              :key="optionId(resident, ['residentId', 'id'])"
              :value="optionId(resident, ['residentId', 'id'])"
            >
              {{ residentLabel(resident) }}
            </option>
          </select>
          <small>{{ fieldError(state.error.value, 'residentId') }}</small>
        </label>
        <label>
          Lease role
          <select v-model="form.leaseRoleId" required>
            <option value="">Select role</option>
            <option
              v-for="role in roles"
              :key="optionId(role, ['leaseRoleId', 'id'])"
              :value="optionId(role, ['leaseRoleId', 'id'])"
            >
              {{ optionLabel(role, ['label', 'name']) }}
            </option>
          </select>
          <small>{{ fieldError(state.error.value, 'leaseRoleId') }}</small>
        </label>
        <div class="relations-inline">
          <label>
            Start date
            <input v-model="form.startDate" type="date" required />
            <small>{{ fieldError(state.error.value, 'startDate') }}</small>
          </label>
          <label>
            End date
            <input v-model="form.endDate" type="date" />
            <small>{{ fieldError(state.error.value, 'endDate') }}</small>
          </label>
        </div>
        <label>
          Notes
          <textarea v-model="form.notes" rows="3" />
          <small>{{ fieldError(state.error.value, 'notes') }}</small>
        </label>
        <div class="actions">
          <button :disabled="state.pending.value" type="submit">{{ editing ? 'Save' : 'Create lease' }}</button>
          <button v-if="editing" type="button" @click="resetForm">Cancel</button>
        </div>
      </form>

      <section class="relations-panel">
        <div v-if="state.success.value" class="relations-alert success">{{ state.success.value }}</div>
        <h2>Current leases</h2>
        <p v-if="leases.length === 0" class="muted">No leases are linked yet.</p>
        <table v-else>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Role</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lease in leases" :key="lease.leaseId">
              <td>{{ lease.residentFullName || lease.residentName || lease.residentIdCode }}</td>
              <td>{{ lease.leaseRoleLabel }}</td>
              <td>{{ lease.startDate }} <span v-if="lease.endDate">- {{ lease.endDate }}</span></td>
              <td class="actions">
                <button type="button" @click="startEdit(lease)">Edit</button>
                <button type="button" class="danger" @click="deleteTarget = lease">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>

    <dialog :open="Boolean(deleteTarget)" class="relations-dialog">
      <form method="dialog" @submit.prevent="deleteLease">
        <h2>Delete lease</h2>
        <p>This permanently removes the lease assignment for this unit.</p>
        <div class="actions">
          <button :disabled="state.pending.value" class="danger" type="submit">Delete</button>
          <button type="button" @click="deleteTarget = null">Cancel</button>
        </div>
      </form>
    </dialog>
  </main>
</template>

<style scoped src="./relations.css"></style>
