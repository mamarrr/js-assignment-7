<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  vendorCategoriesApi,
  type VendorCategoryAssignmentDto,
  type VendorCategoryAssignmentListDto,
} from '@/api/portal/vendorCategories'
import {
  apiMessage,
  asArray,
  fieldError,
  optionId,
  optionLabel,
  traceId,
  useAsyncState,
  useRouteParam,
} from './relationViewUtils'

const companySlug = useRouteParam('companySlug')
const vendorId = useRouteParam('vendorId')
const state = useAsyncState()
const page = ref<VendorCategoryAssignmentListDto | null>(null)
const editing = ref<VendorCategoryAssignmentDto | null>(null)
const deleteTarget = ref<VendorCategoryAssignmentDto | null>(null)
const form = reactive({ ticketCategoryId: '', notes: '' })
const editForm = reactive({ notes: '' })

const scope = computed(() => ({ companySlug: companySlug.value, vendorId: vendorId.value }))
const categories = computed(() => asArray<VendorCategoryAssignmentDto>(page.value?.assignments))
const availableCategories = computed(() => asArray(page.value?.availableCategories))

const load = async () => {
  page.value = await state.run(() => vendorCategoriesApi.list(scope.value))
}

const assign = async () => {
  if (state.pending.value) return
  await state.run(
    async () => {
      page.value = await vendorCategoriesApi.assign(scope.value, {
        ticketCategoryId: form.ticketCategoryId,
        notes: form.notes || null,
      })
      form.ticketCategoryId = ''
      form.notes = ''
    },
    { pending: true, success: 'Category assigned.' },
  )
}

const startEdit = (category: VendorCategoryAssignmentDto) => {
  editing.value = category
  editForm.notes = String(category.notes ?? '')
}

const saveEdit = async () => {
  const categoryId = String(editing.value?.ticketCategoryId ?? '')
  if (state.pending.value || !categoryId) return
  await state.run(
    async () => {
      page.value = await vendorCategoriesApi.update(scope.value, categoryId, { notes: editForm.notes || null })
      editing.value = null
    },
    { pending: true, success: 'Category assignment updated.' },
  )
}

const deleteAssignment = async () => {
  const categoryId = String(deleteTarget.value?.ticketCategoryId ?? '')
  if (state.pending.value || !categoryId) return
  await state.run(
    async () => {
      await vendorCategoriesApi.delete(scope.value, categoryId)
      deleteTarget.value = null
      page.value = await vendorCategoriesApi.list(scope.value)
    },
    { pending: true, success: 'Category assignment deleted.' },
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
        <p>Vendors</p>
        <h1>Vendor categories</h1>
        <span>{{ page?.vendorName || vendorId }}</span>
      </div>
      <RouterLink :to="`/companies/${companySlug}/vendors/${vendorId}`">Back to vendor</RouterLink>
    </header>

    <section v-if="state.loading.value" class="relations-panel">Loading categories...</section>
    <section v-else class="relations-grid">
      <form class="relations-panel" @submit.prevent="assign">
        <h2>Assign category</h2>
        <div v-if="state.error.value" class="relations-alert danger">
          {{ apiMessage(state.error.value) }}
          <details v-if="traceId(state.error.value)">
            <summary>Technical details</summary>
            <span>Trace ID: {{ traceId(state.error.value) }}</span>
          </details>
        </div>
        <label>
          Category
          <select v-model="form.ticketCategoryId" required>
            <option value="">Select category</option>
            <option
              v-for="category in availableCategories"
              :key="optionId(category, ['ticketCategoryId', 'id', 'value'])"
              :value="optionId(category, ['ticketCategoryId', 'id', 'value'])"
            >
              {{ optionLabel(category, ['label', 'name', 'text', 'categoryLabel']) }}
            </option>
          </select>
          <small>{{ fieldError(state.error.value, 'ticketCategoryId') }}</small>
        </label>
        <label>
          Notes
          <textarea v-model="form.notes" rows="3" />
          <small>{{ fieldError(state.error.value, 'notes') }}</small>
        </label>
        <button :disabled="state.pending.value" type="submit">
          {{ state.pending.value ? 'Assigning...' : 'Assign category' }}
        </button>
      </form>

      <section class="relations-panel">
        <div v-if="state.success.value" class="relations-alert success">{{ state.success.value }}</div>
        <h2>Assigned categories</h2>
        <p v-if="categories.length === 0" class="muted">No categories are assigned yet.</p>
        <table v-else>
          <thead>
            <tr>
              <th>Category</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.ticketCategoryId">
              <td>
                <strong>{{ category.categoryLabel || category.ticketCategoryLabel || 'Category' }}</strong>
                <span>{{ category.categoryCode }}</span>
              </td>
              <td>{{ category.notes || '-' }}</td>
              <td class="actions">
                <button :disabled="state.pending.value" type="button" @click="startEdit(category)">Edit</button>
                <button :disabled="state.pending.value" type="button" class="danger" @click="deleteTarget = category">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>

    <dialog :open="Boolean(editing)" class="relations-dialog">
      <form method="dialog" @submit.prevent="saveEdit">
        <h2>Edit category assignment</h2>
        <div v-if="state.error.value" class="relations-alert danger">{{ apiMessage(state.error.value) }}</div>
        <label>
          Notes
          <textarea v-model="editForm.notes" rows="3" />
          <small>{{ fieldError(state.error.value, 'notes') }}</small>
        </label>
        <div class="actions">
          <button :disabled="state.pending.value" type="submit">
            {{ state.pending.value ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" @click="editing = null">Cancel</button>
        </div>
      </form>
    </dialog>

    <dialog :open="Boolean(deleteTarget)" class="relations-dialog">
      <form method="dialog" @submit.prevent="deleteAssignment">
        <h2>Delete category assignment</h2>
        <p>This removes the vendor from this ticket category.</p>
        <div class="actions">
          <button :disabled="state.pending.value" class="danger" type="submit">
            {{ state.pending.value ? 'Deleting...' : 'Delete' }}
          </button>
          <button type="button" @click="deleteTarget = null">Cancel</button>
        </div>
      </form>
    </dialog>
  </main>
</template>

<style scoped src="./relations.css"></style>
