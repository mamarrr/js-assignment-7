<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppFieldErrors from '@/components/AppFieldErrors.vue'
import AppFormActions from '@/components/AppFormActions.vue'
import { isApiError, type ApiError } from '@/api/errors'
import { onboardingApi } from '@/api/onboarding'
import { useNotificationStore } from '@/stores/notifications'
import { useWorkspaceStore } from '@/stores/workspace'

const router = useRouter()
const notifications = useNotificationStore()
const workspaceStore = useWorkspaceStore()

const form = reactive({
  name: '',
  registryCode: '',
  vatNumber: '',
  email: '',
  phone: '',
  address: '',
})

const pending = ref(false)
const summaryError = ref<ApiError | null>(null)
const localErrors = reactive<Record<string, string[]>>({})

const fieldErrors = (field: string) => {
  const apiErrors = summaryError.value?.fieldErrors ?? {}
  const pascalField = `${field.charAt(0).toUpperCase()}${field.slice(1)}`
  return localErrors[field] ?? apiErrors[field] ?? apiErrors[pascalField] ?? []
}

const validate = () => {
  localErrors.name = []
  localErrors.registryCode = []
  localErrors.email = []

  if (!form.name.trim()) localErrors.name.push('Company name is required.')
  if (!form.registryCode.trim()) localErrors.registryCode.push('Registry code is required.')
  if (form.email && !form.email.includes('@'))
    localErrors.email.push('Enter a valid email address.')

  return !localErrors.name.length && !localErrors.registryCode.length && !localErrors.email.length
}

const submit = async () => {
  summaryError.value = null
  if (!validate()) return

  pending.value = true

  try {
    const created = await onboardingApi.createManagementCompany({
      name: form.name.trim(),
      registryCode: form.registryCode.trim(),
      vatNumber: form.vatNumber.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
    })

    await workspaceStore.loadStartup()
    notifications.push({
      tone: 'success',
      title: 'Management company created',
      message: created.name
        ? `${created.name} is ready.`
        : 'The workspace catalog has been updated.',
    })
    await router.replace(created.path ?? workspaceStore.defaultPath ?? '/workspaces')
  } catch (error) {
    summaryError.value = isApiError(error)
      ? error
      : {
          status: 0,
          title: 'Company creation failed',
          message: 'Unable to create the management company. Check the form and try again.',
          fieldErrors: {},
          raw: error,
        }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card auth-card--wide" aria-labelledby="new-company-title">
      <div class="auth-card__header">
        <p class="eyebrow">Onboarding</p>
        <h1 id="new-company-title">Create your management company</h1>
        <p>Enter the company details used for the management workspace.</p>
      </div>

      <AppErrorAlert v-if="summaryError" :error="summaryError" />

      <form class="auth-form" novalidate @submit.prevent="submit">
        <label class="field">
          <span>Company name</span>
          <input
            v-model="form.name"
            type="text"
            autocomplete="organization"
            :aria-invalid="fieldErrors('name').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('name')" />
        </label>

        <label class="field">
          <span>Registry code</span>
          <input
            v-model="form.registryCode"
            type="text"
            :aria-invalid="fieldErrors('registryCode').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('registryCode')" />
        </label>

        <label class="field">
          <span>VAT number</span>
          <input
            v-model="form.vatNumber"
            type="text"
            :aria-invalid="fieldErrors('vatNumber').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('vatNumber')" />
        </label>

        <label class="field">
          <span>Email</span>
          <input
            v-model="form.email"
            type="email"
            :aria-invalid="fieldErrors('email').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('email')" />
        </label>

        <label class="field">
          <span>Phone</span>
          <input v-model="form.phone" type="tel" :aria-invalid="fieldErrors('phone').length > 0" />
          <AppFieldErrors :errors="fieldErrors('phone')" />
        </label>

        <label class="field">
          <span>Address</span>
          <input
            v-model="form.address"
            type="text"
            :aria-invalid="fieldErrors('address').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('address')" />
        </label>

        <AppFormActions
          submit-label="Create and continue"
          pending-label="Creating..."
          :pending="pending"
        >
          <RouterLink class="button button--secondary" to="/onboarding">Cancel</RouterLink>
        </AppFormActions>
      </form>
    </section>
  </main>
</template>
