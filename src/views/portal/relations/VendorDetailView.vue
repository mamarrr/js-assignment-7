<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { vendorsApi, type VendorProfileDto } from '@/api/portal/vendors'
import { apiMessage, fieldError, traceId, useAsyncState, useRouteParam } from './relationViewUtils'

const router = useRouter()
const companySlug = useRouteParam('companySlug')
const vendorId = useRouteParam('vendorId')
const state = useAsyncState()
const vendor = ref<VendorProfileDto | null>(null)
const deleteOpen = ref(false)
const deleteForm = reactive({ confirmationRegistryCode: '' })
const expectedRegistryCode = computed(() => String(vendor.value?.registryCode ?? ''))
const deleteConfirmationMatches = computed(() => {
  const typed = deleteForm.confirmationRegistryCode.trim()
  return expectedRegistryCode.value ? typed === expectedRegistryCode.value : typed.length > 0
})

const load = async () => {
  vendor.value = await state.run(() => vendorsApi.detail(companySlug.value, vendorId.value))
}

const deleteVendor = async () => {
  if (state.pending.value || !deleteConfirmationMatches.value) return
  await state.run(
    async () => {
      await vendorsApi.delete(companySlug.value, vendorId.value, {
        confirmationRegistryCode: deleteForm.confirmationRegistryCode.trim(),
      })
      await router.push(`/companies/${companySlug.value}/vendors`)
    },
    { pending: true, success: 'Vendor deleted.' },
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
        <h1>{{ vendor?.name || 'Vendor' }}</h1>
        <span>{{ vendor?.registryCode }}</span>
      </div>
      <nav class="actions">
        <RouterLink :to="`/companies/${companySlug}/vendors/${vendorId}/edit`">Edit</RouterLink>
        <RouterLink :to="`/companies/${companySlug}/vendors/${vendorId}/categories`">Categories</RouterLink>
        <RouterLink :to="`/companies/${companySlug}/vendors/${vendorId}/contacts`">Contacts</RouterLink>
      </nav>
    </header>

    <section class="relations-panel">
      <p v-if="state.loading.value">Loading vendor...</p>
      <div v-if="state.error.value" class="relations-alert danger">
        {{ apiMessage(state.error.value) }}
        <details v-if="traceId(state.error.value)">
          <summary>Technical details</summary>
          <span>Trace ID: {{ traceId(state.error.value) }}</span>
        </details>
      </div>
      <dl v-if="vendor">
        <dt>Name</dt>
        <dd>{{ vendor.name }}</dd>
        <dt>Registry code</dt>
        <dd>{{ vendor.registryCode || 'Not set' }}</dd>
        <dt>Notes</dt>
        <dd>{{ vendor.notes || 'No notes.' }}</dd>
      </dl>
    </section>

    <section v-if="vendor" class="relations-panel">
      <h2>Vendor workflow</h2>
      <div class="relations-stats">
        <div>
          <strong>{{ vendor.contactCount ?? 0 }}</strong>
          <span>Contacts</span>
        </div>
        <div>
          <strong>{{ vendor.activeCategoryCount ?? 0 }}</strong>
          <span>Category assignments</span>
        </div>
        <div>
          <strong>{{ vendor.assignedTicketCount ?? 0 }}</strong>
          <span>Tickets</span>
        </div>
        <div>
          <strong>{{ vendor.scheduledWorkCount ?? 0 }}</strong>
          <span>Scheduled work</span>
        </div>
      </div>
      <div class="actions">
        <RouterLink :to="`/companies/${companySlug}/vendors/${vendorId}/categories`">Manage categories</RouterLink>
        <RouterLink :to="`/companies/${companySlug}/vendors/${vendorId}/contacts`">Manage contacts</RouterLink>
        <RouterLink :to="`/companies/${companySlug}/tickets?vendorId=${vendorId}`">View tickets</RouterLink>
        <button class="danger" type="button" @click="deleteOpen = true">Delete vendor</button>
      </div>
    </section>

    <dialog :open="deleteOpen" class="relations-dialog">
      <form method="dialog" @submit.prevent="deleteVendor">
        <h2>Delete vendor</h2>
        <p>
          Confirm deletion of {{ vendor?.name }}. Vendors with tickets, scheduled work, contacts, or category
          assignments cannot be deleted.
        </p>
        <label>
          Confirmation registry code
          <input
            v-model="deleteForm.confirmationRegistryCode"
            :aria-invalid="Boolean(fieldError(state.error.value, 'confirmationRegistryCode'))"
            :placeholder="String(vendor?.registryCode || '')"
            required
          />
          <small v-if="expectedRegistryCode">Type {{ expectedRegistryCode }} to enable deletion.</small>
          <small>{{ fieldError(state.error.value, 'confirmationRegistryCode') }}</small>
        </label>
        <div v-if="state.error.value" class="relations-alert danger">{{ apiMessage(state.error.value) }}</div>
        <div class="actions">
          <button :disabled="state.pending.value || !deleteConfirmationMatches" class="danger" type="submit">
            {{ state.pending.value ? 'Deleting...' : 'Delete' }}
          </button>
          <button type="button" @click="deleteOpen = false">Cancel</button>
        </div>
      </form>
    </dialog>
  </main>
</template>

<style scoped src="./relations.css"></style>
