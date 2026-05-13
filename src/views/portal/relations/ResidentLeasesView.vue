<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { residentLeasesApi, type LeaseDto, type LeaseRoleOptionDto } from '@/api/portal/leases'
import {
  apiMessage,
  asArray,
  createLeaseForm,
  optionId,
  optionLabel,
  useAsyncState,
  useRouteParam,
} from './relationViewUtils'

const companySlug = useRouteParam('companySlug')
const residentIdCode = useRouteParam('residentIdCode')
const state = useAsyncState()
const leases = ref<LeaseDto[]>([])
const roles = ref<LeaseRoleOptionDto[]>([])
const propertyResults = ref<LeaseDto[]>([])
const unitOptions = ref<LeaseDto[]>([])
const editing = ref<LeaseDto | null>(null)
const deleteTarget = ref<LeaseDto | null>(null)
const form = createLeaseForm()
const search = ref('')

const scope = computed(() => ({ companySlug: companySlug.value, residentIdCode: residentIdCode.value }))

const load = async () => {
  await state.run(async () => {
    leases.value = asArray<LeaseDto>(await residentLeasesApi.list(scope.value))
    const roleResult = await residentLeasesApi.roles(scope.value)
    roles.value = asArray<LeaseRoleOptionDto>(roleResult.roles ?? roleResult.leaseRoles)
  })
}

const searchProperties = async () => {
  const result = await residentLeasesApi.searchProperties(scope.value, search.value)
  propertyResults.value = asArray<LeaseDto>(result.items ?? result.results)
}

const loadUnits = async () => {
  if (!form.propertyId) return
  const result = await residentLeasesApi.unitsForProperty(scope.value, form.propertyId)
  unitOptions.value = asArray<LeaseDto>(result.units ?? result.options)
}

const resetForm = () => {
  editing.value = null
  form.propertyId = ''
  form.unitId = ''
  form.leaseRoleId = ''
  form.endDate = ''
  form.notes = ''
}

const startEdit = (lease: LeaseDto) => {
  editing.value = lease
  form.unitId = String(lease.unitId ?? '')
  form.leaseRoleId = String(lease.leaseRoleId ?? '')
  form.startDate = String(lease.startDate ?? '')
  form.endDate = String(lease.endDate ?? '')
  form.notes = String(lease.notes ?? '')
}

const submit = async () => {
  await state.run(
    async () => {
      if (editing.value?.leaseId) {
        await residentLeasesApi.update(scope.value, editing.value.leaseId, {
          leaseRoleId: form.leaseRoleId,
          startDate: form.startDate,
          endDate: form.endDate || null,
          notes: form.notes || null,
        })
      } else {
        await residentLeasesApi.create(scope.value, {
          unitId: form.unitId,
          leaseRoleId: form.leaseRoleId,
          startDate: form.startDate,
          endDate: form.endDate || null,
          notes: form.notes || null,
        })
      }
      resetForm()
      leases.value = asArray<LeaseDto>(await residentLeasesApi.list(scope.value))
    },
    { pending: true, success: editing.value ? 'Lease updated.' : 'Lease created.' },
  )
}

const deleteLease = async () => {
  if (!deleteTarget.value?.leaseId) return
  await state.run(
    async () => {
      await residentLeasesApi.delete(scope.value, deleteTarget.value!.leaseId!)
      deleteTarget.value = null
      leases.value = asArray<LeaseDto>(await residentLeasesApi.list(scope.value))
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
        <p>Residents</p>
        <h1>Resident leases</h1>
        <span>{{ residentIdCode }}</span>
      </div>
      <RouterLink :to="`/companies/${companySlug}/residents/${residentIdCode}`">Back to resident</RouterLink>
    </header>

    <section v-if="state.loading.value" class="relations-panel">Loading leases...</section>
    <section v-else class="relations-grid">
      <form class="relations-panel" @submit.prevent="submit">
        <h2>{{ editing ? 'Edit lease' : 'Create lease' }}</h2>
        <template v-if="!editing">
          <label>
            Property search
            <span class="relations-inline">
              <input v-model="search" placeholder="Search properties" />
              <button type="button" @click="searchProperties">Search</button>
            </span>
          </label>
          <label>
            Property
            <select v-model="form.propertyId" required @change="loadUnits">
              <option value="">Select property</option>
              <option
                v-for="property in propertyResults"
                :key="optionId(property, ['propertyId', 'id'])"
                :value="optionId(property, ['propertyId', 'id'])"
              >
                {{ optionLabel(property, ['propertyName', 'name']) }}
              </option>
            </select>
          </label>
          <label>
            Unit
            <select v-model="form.unitId" required>
              <option value="">Select unit</option>
              <option
                v-for="unit in unitOptions"
                :key="optionId(unit, ['unitId', 'id'])"
                :value="optionId(unit, ['unitId', 'id'])"
              >
                {{ optionLabel(unit, ['unitName', 'label', 'name']) }}
              </option>
            </select>
          </label>
        </template>
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
        </label>
        <div class="relations-inline">
          <label>Start date <input v-model="form.startDate" type="date" required /></label>
          <label>End date <input v-model="form.endDate" type="date" /></label>
        </div>
        <label>Notes <textarea v-model="form.notes" rows="3" /></label>
        <div class="actions">
          <button :disabled="state.pending.value" type="submit">{{ editing ? 'Save' : 'Create lease' }}</button>
          <button v-if="editing" type="button" @click="resetForm">Cancel</button>
        </div>
      </form>

      <section class="relations-panel">
        <div v-if="state.success.value" class="relations-alert success">{{ state.success.value }}</div>
        <div v-if="state.error.value" class="relations-alert danger">{{ apiMessage(state.error.value) }}</div>
        <h2>Current leases</h2>
        <p v-if="leases.length === 0" class="muted">No leases are linked yet.</p>
        <table v-else>
          <thead>
            <tr>
              <th>Unit</th>
              <th>Role</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lease in leases" :key="lease.leaseId">
              <td>{{ lease.unitName || lease.unitSlug }}</td>
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
        <p>This permanently removes the lease assignment for this resident.</p>
        <div class="actions">
          <button :disabled="state.pending.value" class="danger" type="submit">Delete</button>
          <button type="button" @click="deleteTarget = null">Cancel</button>
        </div>
      </form>
    </dialog>
  </main>
</template>

<style scoped src="./relations.css"></style>
