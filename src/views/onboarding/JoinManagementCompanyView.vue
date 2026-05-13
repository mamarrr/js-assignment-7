<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppFieldErrors from '@/components/AppFieldErrors.vue'
import AppFormActions from '@/components/AppFormActions.vue'
import AppLoading from '@/components/AppLoading.vue'
import { isApiError, type ApiError } from '@/api/errors'
import { onboardingApi } from '@/api/onboarding'
import { useNotificationStore } from '@/stores/notifications'
import type { LookupOptionDto } from '@/types/api'

const notifications = useNotificationStore()

const roles = ref<LookupOptionDto[]>([])
const loading = ref(true)
const pending = ref(false)
const summaryError = ref<ApiError | null>(null)
const successMessage = ref('')
const localErrors = reactive<Record<string, string[]>>({})

const form = reactive({
  registryCode: '',
  requestedRoleId: '',
  message: '',
})

const optionValue = (option: LookupOptionDto) =>
  String(option.id ?? option.value ?? option.key ?? option.lookupId ?? option.roleId ?? '')

const optionLabel = (option: LookupOptionDto) =>
  String(
    option.label ??
      option.name ??
      option.text ??
      option.displayName ??
      option.code ??
      optionValue(option),
  )

const selectableRoles = computed(() => roles.value.filter((role) => optionValue(role)))

const fieldErrors = (field: string) => {
  const apiErrors = summaryError.value?.fieldErrors ?? {}
  const pascalField = `${field.charAt(0).toUpperCase()}${field.slice(1)}`
  return localErrors[field] ?? apiErrors[field] ?? apiErrors[pascalField] ?? []
}

const validate = () => {
  localErrors.registryCode = []
  localErrors.requestedRoleId = []

  if (!form.registryCode.trim()) localErrors.registryCode.push('Registry code is required.')
  if (!form.requestedRoleId) localErrors.requestedRoleId.push('Requested role is required.')

  return !localErrors.registryCode.length && !localErrors.requestedRoleId.length
}

onMounted(async () => {
  try {
    roles.value = await onboardingApi.managementCompanyRoles()
  } catch (error) {
    summaryError.value = isApiError(error)
      ? error
      : {
          status: 0,
          title: 'Roles could not be loaded',
          message: 'Unable to load role options. Try again later.',
          fieldErrors: {},
          raw: error,
        }
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  summaryError.value = null
  successMessage.value = ''
  if (!validate()) return

  pending.value = true

  try {
    const result = await onboardingApi.joinManagementCompany({
      registryCode: form.registryCode.trim(),
      requestedRoleId: form.requestedRoleId,
      message: form.message.trim() || undefined,
    })

    successMessage.value = result.message ?? 'Your join request has been submitted.'
    notifications.push({
      tone: 'success',
      title: 'Join request submitted',
      message: successMessage.value,
    })
    form.registryCode = ''
    form.requestedRoleId = ''
    form.message = ''
  } catch (error) {
    summaryError.value = isApiError(error)
      ? error
      : {
          status: 0,
          title: 'Join request failed',
          message: 'Unable to submit the join request. Check the form and try again.',
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
    <section class="auth-card auth-card--wide" aria-labelledby="join-company-title">
      <div class="auth-card__header">
        <p class="eyebrow">Onboarding</p>
        <h1 id="join-company-title">Join an existing management company</h1>
        <p>Submit a request with the company registry code and the role you need.</p>
      </div>

      <AppLoading v-if="loading" label="Loading role options..." />
      <AppErrorAlert v-else-if="summaryError" :error="summaryError" />
      <section v-if="successMessage" class="alert alert--success" role="status">
        <strong>Request submitted</strong>
        <p>{{ successMessage }}</p>
      </section>

      <form v-if="!loading" class="auth-form" novalidate @submit.prevent="submit">
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
          <span>Requested role</span>
          <select
            v-model="form.requestedRoleId"
            :aria-invalid="fieldErrors('requestedRoleId').length > 0"
          >
            <option value="">Select role</option>
            <option
              v-for="role in selectableRoles"
              :key="optionValue(role)"
              :value="optionValue(role)"
            >
              {{ optionLabel(role) }}
            </option>
          </select>
          <AppFieldErrors :errors="fieldErrors('requestedRoleId')" />
        </label>

        <label class="field">
          <span>Message</span>
          <textarea
            v-model="form.message"
            rows="4"
            :aria-invalid="fieldErrors('message').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('message')" />
        </label>

        <AppFormActions
          submit-label="Submit join request"
          pending-label="Submitting..."
          :pending="pending"
        >
          <RouterLink class="button button--secondary" to="/onboarding">Cancel</RouterLink>
        </AppFormActions>
      </form>
    </section>
  </main>
</template>
