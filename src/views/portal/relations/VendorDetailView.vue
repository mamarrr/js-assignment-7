<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { vendorsApi, type VendorProfileDto } from '@/api/portal/vendors'
import { apiMessage, useAsyncState, useRouteParam } from './relationViewUtils'

const router = useRouter()
const companySlug = useRouteParam('companySlug')
const vendorId = useRouteParam('vendorId')
const state = useAsyncState()
const vendor = ref<VendorProfileDto | null>(null)
const deleteOpen = ref(false)
const deleteForm = reactive({ confirmationRegistryCode: '' })

const load = async () => {
  vendor.value = await state.run(() => vendorsApi.detail(companySlug.value, vendorId.value))
}

const deleteVendor = async () => {
  if (!deleteForm.confirmationRegistryCode) return
  await state.run(
    async () => {
      await vendorsApi.delete(companySlug.value, vendorId.value, {
        confirmationRegistryCode: deleteForm.confirmationRegistryCode,
      })
      await router.push(`/companies/${companySlug.value}/vendors`)
    },
    { pending: true },
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
      <div v-if="state.error.value" class="relations-alert danger">{{ apiMessage(state.error.value) }}</div>
      <dl v-if="vendor">
        <dt>Name</dt>
        <dd>{{ vendor.name }}</dd>
        <dt>Registry code</dt>
        <dd>{{ vendor.registryCode || 'Not set' }}</dd>
        <dt>Notes</dt>
        <dd>{{ vendor.notes || 'No notes.' }}</dd>
      </dl>
      <button class="danger" type="button" @click="deleteOpen = true">Delete vendor</button>
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
          <input v-model="deleteForm.confirmationRegistryCode" :placeholder="vendor?.registryCode || ''" required />
        </label>
        <div class="actions">
          <button :disabled="state.pending.value" class="danger" type="submit">Delete</button>
          <button type="button" @click="deleteOpen = false">Cancel</button>
        </div>
      </form>
    </dialog>
  </main>
</template>

<style scoped src="./relations.css"></style>
