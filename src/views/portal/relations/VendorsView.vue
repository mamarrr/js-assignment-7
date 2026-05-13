<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { vendorsApi, type VendorListItemDto } from '@/api/portal/vendors'
import { apiMessage, asArray, traceId, useAsyncState, useRouteParam } from './relationViewUtils'

const companySlug = useRouteParam('companySlug')
const state = useAsyncState()
const vendors = ref<VendorListItemDto[]>([])

const load = async () => {
  vendors.value = await state.run(() => vendorsApi.list(companySlug.value))
}

onMounted(() => {
  void load()
})
</script>

<template>
  <main class="relations-page">
    <header class="relations-header">
      <div>
        <p>Vendor registry</p>
        <h1>Vendors</h1>
        <span>Manage maintenance providers for this company.</span>
      </div>
      <RouterLink :to="`/companies/${companySlug}/vendors/new`">New vendor</RouterLink>
    </header>

    <section class="relations-panel">
      <div v-if="state.error.value" class="relations-alert danger">
        {{ apiMessage(state.error.value) }}
        <details v-if="traceId(state.error.value)">
          <summary>Technical details</summary>
          <span>Trace ID: {{ traceId(state.error.value) }}</span>
        </details>
      </div>
      <p v-if="state.loading.value">Loading vendors...</p>
      <div v-else-if="asArray(vendors).length === 0" class="relations-empty">
        <strong>No vendors found</strong>
        <p class="muted">Create the first vendor before assigning providers to tickets or scheduled work.</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Name</th>
            <th>Registry code</th>
            <th>Categories</th>
            <th>Tickets</th>
            <th>Contacts</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vendor in vendors" :key="vendor.vendorId">
            <td>
              <RouterLink :to="`/companies/${companySlug}/vendors/${vendor.vendorId}`">
                {{ vendor.name }}
              </RouterLink>
            </td>
            <td>{{ vendor.registryCode || '-' }}</td>
            <td>{{ vendor.activeCategoryCount ?? 0 }}</td>
            <td>{{ vendor.assignedTicketCount ?? 0 }}</td>
            <td>{{ vendor.contactCount ?? 0 }}</td>
            <td class="actions">
              <RouterLink :to="`/companies/${companySlug}/vendors/${vendor.vendorId}/edit`">Edit</RouterLink>
              <RouterLink :to="`/companies/${companySlug}/vendors/${vendor.vendorId}/categories`">Categories</RouterLink>
              <RouterLink :to="`/companies/${companySlug}/vendors/${vendor.vendorId}/contacts`">Contacts</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style scoped src="./relations.css"></style>
