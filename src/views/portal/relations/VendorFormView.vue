<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { vendorsApi } from '@/api/portal/vendors'
import { apiMessage, fieldError, traceId, useAsyncState, useRouteParam } from './relationViewUtils'

const router = useRouter()
const companySlug = useRouteParam('companySlug')
const vendorId = useRouteParam('vendorId')
const state = useAsyncState()
const isEdit = computed(() => Boolean(vendorId.value))
const form = reactive({
  name: '',
  registryCode: '',
  notes: '',
})

const load = async () => {
  if (!isEdit.value) return
  const vendor = await state.run(() => vendorsApi.detail(companySlug.value, vendorId.value))
  form.name = String(vendor.name ?? '')
  form.registryCode = String(vendor.registryCode ?? '')
  form.notes = String(vendor.notes ?? '')
}

const submit = async () => {
  if (state.pending.value) return
  await state.run(
    async () => {
      const body = {
        name: form.name || null,
        registryCode: form.registryCode || null,
        notes: form.notes || null,
      }
      const saved = isEdit.value
        ? await vendorsApi.update(companySlug.value, vendorId.value, body)
        : await vendorsApi.create(companySlug.value, body)
      await router.push(`/companies/${companySlug.value}/vendors/${saved.id ?? saved.vendorId ?? vendorId.value}`)
    },
    { pending: true, success: isEdit.value ? 'Vendor updated.' : 'Vendor created.' },
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
        <h1>{{ isEdit ? 'Edit vendor' : 'New vendor' }}</h1>
      </div>
      <RouterLink :to="`/companies/${companySlug}/vendors`">Back to vendors</RouterLink>
    </header>

    <form class="relations-panel" @submit.prevent="submit">
      <p v-if="state.loading.value">Loading vendor...</p>
      <div v-if="state.error.value" class="relations-alert danger">
        {{ apiMessage(state.error.value) }}
        <details v-if="traceId(state.error.value)">
          <summary>Technical details</summary>
          <span>Trace ID: {{ traceId(state.error.value) }}</span>
        </details>
      </div>
      <label>
        Name
        <input v-model="form.name" :aria-invalid="Boolean(fieldError(state.error.value, 'name'))" required />
        <small>{{ fieldError(state.error.value, 'name') }}</small>
      </label>
      <label>
        Registry code
        <input v-model="form.registryCode" :aria-invalid="Boolean(fieldError(state.error.value, 'registryCode'))" />
        <small>{{ fieldError(state.error.value, 'registryCode') }}</small>
      </label>
      <label>
        Notes
        <textarea v-model="form.notes" :aria-invalid="Boolean(fieldError(state.error.value, 'notes'))" rows="4" />
        <small>{{ fieldError(state.error.value, 'notes') }}</small>
      </label>
      <button :disabled="state.pending.value || state.loading.value" type="submit">
        {{ state.pending.value ? 'Saving...' : isEdit ? 'Save' : 'Create vendor' }}
      </button>
    </form>
  </main>
</template>

<style scoped src="./relations.css"></style>
