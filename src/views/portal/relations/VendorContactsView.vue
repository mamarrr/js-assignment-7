<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  vendorContactsApi,
  type VendorContactItemDto,
  type VendorContactListDto,
} from '@/api/portal/vendorContacts'
import {
  apiMessage,
  asArray,
  createContactAssignmentForm,
  createNewContactForm,
  optionId,
  optionLabel,
  useAsyncState,
  useRouteParam,
} from './relationViewUtils'

const companySlug = useRouteParam('companySlug')
const vendorId = useRouteParam('vendorId')
const state = useAsyncState()
const page = ref<VendorContactListDto | null>(null)
const editing = ref<VendorContactItemDto | null>(null)
const deleteTarget = ref<VendorContactItemDto | null>(null)
const attachForm = createContactAssignmentForm()
const createForm = createNewContactForm()
const editForm = createContactAssignmentForm()

const scope = computed(() => ({ companySlug: companySlug.value, vendorId: vendorId.value }))
const contacts = computed(() => asArray<VendorContactItemDto>(page.value?.contacts))
const existingOptions = computed(() => asArray(page.value?.existingContactOptions))
const contactTypes = computed(() => asArray(page.value?.contactTypeOptions))

const load = async () => {
  page.value = await state.run(() => vendorContactsApi.list(scope.value))
}

const attachExisting = async () => {
  await state.run(
    async () => {
      page.value = await vendorContactsApi.attachExisting(scope.value, {
        contactId: attachForm.contactId,
        validFrom: attachForm.validFrom,
        validTo: attachForm.validTo || null,
        confirmed: attachForm.confirmed,
        isPrimary: attachForm.isPrimary,
        fullName: attachForm.fullName || null,
        roleTitle: attachForm.roleTitle || null,
      })
      attachForm.contactId = ''
    },
    { pending: true, success: 'Contact attached.' },
  )
}

const createAndAttach = async () => {
  await state.run(
    async () => {
      page.value = await vendorContactsApi.createAndAttach(scope.value, {
        contactTypeId: createForm.contactTypeId,
        contactValue: createForm.contactValue,
        contactNotes: createForm.contactNotes || null,
        validFrom: createForm.validFrom,
        validTo: createForm.validTo || null,
        confirmed: createForm.confirmed,
        isPrimary: createForm.isPrimary,
        fullName: createForm.fullName || null,
        roleTitle: createForm.roleTitle || null,
      })
      createForm.contactTypeId = ''
      createForm.contactValue = ''
      createForm.contactNotes = ''
      createForm.fullName = ''
      createForm.roleTitle = ''
    },
    { pending: true, success: 'Contact created and attached.' },
  )
}

const startEdit = (contact: VendorContactItemDto) => {
  editing.value = contact
  editForm.contactId = String(contact.contactId ?? '')
  editForm.validFrom = String(contact.validFrom ?? '')
  editForm.validTo = String(contact.validTo ?? '')
  editForm.confirmed = Boolean(contact.confirmed)
  editForm.isPrimary = Boolean(contact.isPrimary)
  editForm.fullName = String(contact.fullName ?? '')
  editForm.roleTitle = String(contact.roleTitle ?? '')
}

const saveEdit = async () => {
  if (!editing.value?.vendorContactId) return
  await state.run(
    async () => {
      page.value = await vendorContactsApi.updateAssignment(scope.value, editing.value!.vendorContactId!, {
        contactId: editForm.contactId,
        validFrom: editForm.validFrom,
        validTo: editForm.validTo || null,
        confirmed: editForm.confirmed,
        isPrimary: editForm.isPrimary,
        fullName: editForm.fullName || null,
        roleTitle: editForm.roleTitle || null,
      })
      editing.value = null
    },
    { pending: true, success: 'Contact assignment updated.' },
  )
}

const perform = async (action: () => Promise<VendorContactListDto>, message: string) => {
  await state.run(
    async () => {
      page.value = await action()
    },
    { pending: true, success: message },
  )
}

const deleteAssignment = async () => {
  if (!deleteTarget.value?.vendorContactId) return
  await state.run(
    async () => {
      page.value = await vendorContactsApi.deleteAssignment(scope.value, deleteTarget.value!.vendorContactId!)
      deleteTarget.value = null
    },
    { pending: true, success: 'Contact assignment deleted.' },
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
        <h1>Vendor contacts</h1>
        <span>{{ page?.vendorName || vendorId }}</span>
      </div>
      <RouterLink :to="`/companies/${companySlug}/vendors/${vendorId}`">Back to vendor</RouterLink>
    </header>

    <section v-if="state.loading.value" class="relations-panel">Loading contacts...</section>
    <section v-else>
      <div v-if="state.success.value" class="relations-alert success">{{ state.success.value }}</div>
      <div v-if="state.error.value" class="relations-alert danger">{{ apiMessage(state.error.value) }}</div>

      <div class="relations-grid">
        <form class="relations-panel" @submit.prevent="attachExisting">
          <h2>Attach existing contact</h2>
          <label>
            Contact
            <select v-model="attachForm.contactId" required>
              <option value="">Select contact</option>
              <option
                v-for="option in existingOptions"
                :key="optionId(option, ['contactId', 'id'])"
                :value="optionId(option, ['contactId', 'id'])"
              >
                {{ optionLabel(option, ['contactValue', 'label', 'name']) }}
              </option>
            </select>
          </label>
          <label>Full name <input v-model="attachForm.fullName" /></label>
          <label>Role <input v-model="attachForm.roleTitle" /></label>
          <div class="relations-inline">
            <label>Valid from <input v-model="attachForm.validFrom" type="date" required /></label>
            <label>Valid to <input v-model="attachForm.validTo" type="date" /></label>
          </div>
          <label class="relations-check"><input v-model="attachForm.confirmed" type="checkbox" /> Confirmed</label>
          <label class="relations-check"><input v-model="attachForm.isPrimary" type="checkbox" /> Primary</label>
          <button :disabled="state.pending.value" type="submit">Attach contact</button>
        </form>

        <form class="relations-panel" @submit.prevent="createAndAttach">
          <h2>Create and attach contact</h2>
          <label>
            Contact type
            <select v-model="createForm.contactTypeId" required>
              <option value="">Select contact type</option>
              <option
                v-for="option in contactTypes"
                :key="optionId(option, ['contactTypeId', 'id', 'value'])"
                :value="optionId(option, ['contactTypeId', 'id', 'value'])"
              >
                {{ optionLabel(option, ['label', 'name', 'text']) }}
              </option>
            </select>
          </label>
          <label>Contact value <input v-model="createForm.contactValue" required /></label>
          <label>Notes <textarea v-model="createForm.contactNotes" rows="3" /></label>
          <label>Full name <input v-model="createForm.fullName" /></label>
          <label>Role <input v-model="createForm.roleTitle" /></label>
          <div class="relations-inline">
            <label>Valid from <input v-model="createForm.validFrom" type="date" required /></label>
            <label>Valid to <input v-model="createForm.validTo" type="date" /></label>
          </div>
          <label class="relations-check"><input v-model="createForm.confirmed" type="checkbox" /> Confirmed</label>
          <label class="relations-check"><input v-model="createForm.isPrimary" type="checkbox" /> Primary</label>
          <button :disabled="state.pending.value" type="submit">Create and attach contact</button>
        </form>
      </div>

      <section class="relations-panel">
        <h2>Current contacts</h2>
        <p v-if="contacts.length === 0" class="muted">No contacts are linked yet.</p>
        <table v-else>
          <thead>
            <tr>
              <th>Contact</th>
              <th>Full name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Valid from</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contact in contacts" :key="contact.vendorContactId">
              <td>
                <strong>{{ contact.contactValue }}</strong>
                <span>{{ contact.contactTypeLabel }}</span>
              </td>
              <td>{{ contact.fullName }}</td>
              <td>{{ contact.roleTitle }}</td>
              <td>
                <mark v-if="contact.isPrimary">Primary</mark>
                <mark :class="{ inactive: !contact.confirmed }">{{ contact.confirmed ? 'Active' : 'Inactive' }}</mark>
              </td>
              <td>{{ contact.validFrom }} <span v-if="contact.validTo">- {{ contact.validTo }}</span></td>
              <td class="actions">
                <button type="button" @click="startEdit(contact)">Edit</button>
                <button
                  v-if="!contact.isPrimary && contact.vendorContactId"
                  type="button"
                  @click="perform(() => vendorContactsApi.setPrimary(scope, contact.vendorContactId!), 'Primary contact updated.')"
                >
                  Set primary
                </button>
                <button
                  v-if="contact.vendorContactId"
                  type="button"
                  @click="
                    perform(
                      () =>
                        contact.confirmed
                          ? vendorContactsApi.unconfirm(scope, contact.vendorContactId!)
                          : vendorContactsApi.confirm(scope, contact.vendorContactId!),
                      contact.confirmed ? 'Contact unconfirmed.' : 'Contact confirmed.',
                    )
                  "
                >
                  {{ contact.confirmed ? 'Unconfirm' : 'Confirm' }}
                </button>
                <button type="button" class="danger" @click="deleteTarget = contact">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>

    <dialog :open="Boolean(editing)" class="relations-dialog">
      <form method="dialog" @submit.prevent="saveEdit">
        <h2>Edit contact assignment</h2>
        <label>Full name <input v-model="editForm.fullName" /></label>
        <label>Role <input v-model="editForm.roleTitle" /></label>
        <div class="relations-inline">
          <label>Valid from <input v-model="editForm.validFrom" type="date" required /></label>
          <label>Valid to <input v-model="editForm.validTo" type="date" /></label>
        </div>
        <label class="relations-check"><input v-model="editForm.confirmed" type="checkbox" /> Confirmed</label>
        <label class="relations-check"><input v-model="editForm.isPrimary" type="checkbox" /> Primary</label>
        <div class="actions">
          <button :disabled="state.pending.value" type="submit">Save</button>
          <button type="button" @click="editing = null">Cancel</button>
        </div>
      </form>
    </dialog>

    <dialog :open="Boolean(deleteTarget)" class="relations-dialog">
      <form method="dialog" @submit.prevent="deleteAssignment">
        <h2>Delete contact assignment</h2>
        <p>This removes the contact from this vendor. The contact record itself is not deleted.</p>
        <div class="actions">
          <button :disabled="state.pending.value" class="danger" type="submit">Delete</button>
          <button type="button" @click="deleteTarget = null">Cancel</button>
        </div>
      </form>
    </dialog>
  </main>
</template>

<style scoped src="./relations.css"></style>
