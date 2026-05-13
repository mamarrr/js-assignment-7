<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  residentContactsApi,
  type ResidentContactItemDto,
  type ResidentContactListDto,
} from '@/api/portal/residentContacts'
import {
  apiMessage,
  asArray,
  createContactAssignmentForm,
  createNewContactForm,
  fieldError,
  optionId,
  optionLabel,
  useAsyncState,
  useRouteParam,
} from './relationViewUtils'

const companySlug = useRouteParam('companySlug')
const residentIdCode = useRouteParam('residentIdCode')
const state = useAsyncState()
const page = ref<ResidentContactListDto | null>(null)
const editing = ref<ResidentContactItemDto | null>(null)
const deleteTarget = ref<ResidentContactItemDto | null>(null)
const editForm = createContactAssignmentForm()
const attachForm = createContactAssignmentForm()
const createForm = createNewContactForm()

const scope = computed(() => ({
  companySlug: companySlug.value,
  residentIdCode: residentIdCode.value,
}))

const contacts = computed(() => asArray<ResidentContactItemDto>(page.value?.contacts))
const existingOptions = computed(() => asArray(page.value?.existingContactOptions))
const contactTypes = computed(() => asArray(page.value?.contactTypeOptions))

const load = async () => {
  page.value = await state.run(() => residentContactsApi.list(scope.value))
}

const resetContactForm = () => {
  createForm.contactTypeId = ''
  createForm.contactValue = ''
  createForm.contactNotes = ''
  createForm.validTo = ''
  createForm.confirmed = true
  createForm.isPrimary = false
}

const attachExisting = async () => {
  await state.run(
    async () => {
      page.value = await residentContactsApi.attachExisting(scope.value, {
        contactId: attachForm.contactId,
        validFrom: attachForm.validFrom,
        validTo: attachForm.validTo || null,
        confirmed: attachForm.confirmed,
        isPrimary: attachForm.isPrimary,
      })
      attachForm.contactId = ''
    },
    { pending: true, success: 'Contact attached.' },
  )
}

const createAndAttach = async () => {
  await state.run(
    async () => {
      page.value = await residentContactsApi.createAndAttach(scope.value, {
        contactTypeId: createForm.contactTypeId,
        contactValue: createForm.contactValue,
        contactNotes: createForm.contactNotes || null,
        validFrom: createForm.validFrom,
        validTo: createForm.validTo || null,
        confirmed: createForm.confirmed,
        isPrimary: createForm.isPrimary,
      })
      resetContactForm()
    },
    { pending: true, success: 'Contact created and attached.' },
  )
}

const startEdit = (contact: ResidentContactItemDto) => {
  editing.value = contact
  editForm.contactId = String(contact.contactId ?? '')
  editForm.validFrom = String(contact.validFrom ?? '')
  editForm.validTo = String(contact.validTo ?? '')
  editForm.confirmed = Boolean(contact.confirmed)
  editForm.isPrimary = Boolean(contact.isPrimary)
}

const saveEdit = async () => {
  if (!editing.value?.residentContactId) return
  await state.run(
    async () => {
      page.value = await residentContactsApi.updateAssignment(scope.value, editing.value!.residentContactId!, {
        contactId: editForm.contactId,
        validFrom: editForm.validFrom,
        validTo: editForm.validTo || null,
        confirmed: editForm.confirmed,
        isPrimary: editForm.isPrimary,
      })
      editing.value = null
    },
    { pending: true, success: 'Contact assignment updated.' },
  )
}

const perform = async (action: () => Promise<ResidentContactListDto>, message: string) => {
  await state.run(
    async () => {
      page.value = await action()
    },
    { pending: true, success: message },
  )
}

const deleteAssignment = async () => {
  if (!deleteTarget.value?.residentContactId) return
  await state.run(
    async () => {
      page.value = await residentContactsApi.deleteAssignment(scope.value, deleteTarget.value!.residentContactId!)
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
        <p>Residents</p>
        <h1>Resident contacts</h1>
        <span>{{ page?.residentName || residentIdCode }}</span>
      </div>
      <RouterLink :to="`/companies/${companySlug}/residents/${residentIdCode}`">Back to resident</RouterLink>
    </header>

    <section v-if="state.loading.value" class="relations-panel">Loading contacts...</section>
    <section v-else>
      <div v-if="state.success.value" class="relations-alert success">{{ state.success.value }}</div>
      <div v-if="state.error.value" class="relations-alert danger">
        {{ apiMessage(state.error.value) }}
      </div>

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
            <small>{{ fieldError(state.error.value, 'contactId') }}</small>
          </label>
          <div class="relations-inline">
            <label>
              Valid from
              <input v-model="attachForm.validFrom" type="date" required />
            </label>
            <label>
              Valid to
              <input v-model="attachForm.validTo" type="date" />
            </label>
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
          <label>
            Contact value
            <input v-model="createForm.contactValue" required />
          </label>
          <label>
            Notes
            <textarea v-model="createForm.contactNotes" rows="3" />
          </label>
          <div class="relations-inline">
            <label>
              Valid from
              <input v-model="createForm.validFrom" type="date" required />
            </label>
            <label>
              Valid to
              <input v-model="createForm.validTo" type="date" />
            </label>
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
              <th>Status</th>
              <th>Valid from</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contact in contacts" :key="contact.residentContactId">
              <td>
                <strong>{{ contact.contactValue }}</strong>
                <span>{{ contact.contactTypeLabel }}</span>
              </td>
              <td>
                <mark v-if="contact.isPrimary">Primary</mark>
                <mark :class="{ inactive: !contact.confirmed }">
                  {{ contact.confirmed ? 'Active' : 'Inactive' }}
                </mark>
              </td>
              <td>{{ contact.validFrom }} <span v-if="contact.validTo">- {{ contact.validTo }}</span></td>
              <td class="actions">
                <button type="button" @click="startEdit(contact)">Edit</button>
                <button
                  v-if="!contact.isPrimary && contact.residentContactId"
                  type="button"
                  @click="perform(() => residentContactsApi.setPrimary(scope, contact.residentContactId!), 'Primary contact updated.')"
                >
                  Set primary
                </button>
                <button
                  v-if="contact.residentContactId"
                  type="button"
                  @click="
                    perform(
                      () =>
                        contact.confirmed
                          ? residentContactsApi.unconfirm(scope, contact.residentContactId!)
                          : residentContactsApi.confirm(scope, contact.residentContactId!),
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
        <div class="relations-inline">
          <label>
            Valid from
            <input v-model="editForm.validFrom" type="date" required />
          </label>
          <label>
            Valid to
            <input v-model="editForm.validTo" type="date" />
          </label>
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
        <p>This removes the contact from this resident. The contact record itself is not deleted.</p>
        <div class="actions">
          <button :disabled="state.pending.value" class="danger" type="submit">Delete</button>
          <button type="button" @click="deleteTarget = null">Cancel</button>
        </div>
      </form>
    </dialog>
  </main>
</template>

<style scoped>
.relations-page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}
.relations-header,
.relations-panel {
  border: 1px solid #d8dee8;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}
.relations-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.relations-header p {
  margin: 0 0 0.25rem;
  color: #536273;
  text-transform: uppercase;
}
.relations-header h1,
.relations-panel h2 {
  margin: 0 0 0.5rem;
}
.relations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
label {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}
input,
select,
textarea {
  border: 1px solid #bcc7d5;
  border-radius: 6px;
  padding: 0.55rem;
}
button,
a {
  border: 1px solid #8da0b6;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  background: #fff;
  color: #1f344c;
  text-decoration: none;
}
button[type='submit'] {
  background: #1f5f8b;
  color: #fff;
}
.danger {
  border-color: #b3261e;
  color: #b3261e;
}
button.danger[type='submit'] {
  background: #b3261e;
  color: #fff;
}
.relations-inline,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.relations-check {
  align-items: center;
  display: flex;
}
.relations-alert {
  border-radius: 6px;
  margin-bottom: 1rem;
  padding: 0.75rem;
}
.success {
  background: #e6f4ea;
}
.danger.relations-alert {
  background: #fce8e6;
}
.muted,
td span {
  color: #536273;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  border-top: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
  vertical-align: top;
}
td:first-child {
  display: grid;
}
mark {
  border-radius: 999px;
  background: #e6f4ea;
  margin-right: 0.35rem;
  padding: 0.15rem 0.45rem;
}
mark.inactive {
  background: #f1f5f9;
}
.relations-dialog {
  border: 1px solid #bcc7d5;
  border-radius: 8px;
  max-width: 520px;
  padding: 1rem;
}
small {
  color: #b3261e;
}
</style>
