<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { vendorsApi } from '@/api/portal/vendors'
import { apiMessage, useAsyncState, useRouteParam } from './relationViewUtils'

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
  await state.run(
    async () => {
      const body = {
        name: form.name,
        registryCode: form.registryCode || null,
        notes: form.notes || null,
      }
      const saved = isEdit.value
        ? await vendorsApi.update(companySlug.value, vendorId.value, body)
        : await vendorsApi.create(companySlug.value, body)
      await router.push(`/companies/${companySlug.value}/vendors/${saved.vendorId ?? vendorId.value}`)
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
        <h1>{{ isEdit ? 'Edit vendor' : 'New vendor' }}</h1>
      </div>
      <RouterLink :to="`/companies/${companySlug}/vendors`">Back to vendors</RouterLink>
    </header>

    <form class="relations-panel" @submit.prevent="submit">
      <div v-if="state.error.value" class="relations-alert danger">{{ apiMessage(state.error.value) }}</div>
      <label>Name <input v-model="form.name" required /></label>
      <label>Registry code <input v-model="form.registryCode" /></label>
      <label>Notes <textarea v-model="form.notes" rows="4" /></label>
      <button :disabled="state.pending.value" type="submit">{{ isEdit ? 'Save' : 'Create vendor' }}</button>
    </form>
  </main>
</template>

<style scoped src="./relations.css"></style>
