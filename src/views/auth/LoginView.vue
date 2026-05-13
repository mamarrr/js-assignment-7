<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppFieldErrors from '@/components/AppFieldErrors.vue'
import AppFormActions from '@/components/AppFormActions.vue'
import { isApiError, type ApiError } from '@/api/errors'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const pending = ref(false)
const summaryError = ref<ApiError | null>(null)
const localErrors = reactive<Record<string, string[]>>({})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/workspaces'
})

const fieldErrors = (field: string) => {
  const apiErrors = summaryError.value?.fieldErrors ?? {}
  const pascalField = `${field.charAt(0).toUpperCase()}${field.slice(1)}`
  return localErrors[field] ?? apiErrors[field] ?? apiErrors[pascalField] ?? []
}

const validate = () => {
  localErrors.email = []
  localErrors.password = []

  if (!form.email.trim()) localErrors.email.push('Email is required.')
  if (!form.password) localErrors.password.push('Password is required.')

  return !localErrors.email.length && !localErrors.password.length
}

const submit = async () => {
  summaryError.value = null
  if (!validate()) return

  pending.value = true

  try {
    await authStore.login({
      email: form.email.trim(),
      password: form.password,
    })
    await router.replace(redirectTarget.value)
  } catch (error) {
    summaryError.value = isApiError(error)
      ? error
      : {
          status: 0,
          title: 'Sign in failed',
          message: 'Unable to sign in. Check your details and try again.',
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
    <section class="auth-card" aria-labelledby="login-title">
      <div class="auth-card__header">
        <p class="eyebrow">Property operations</p>
        <h1 id="login-title">Sign in</h1>
      </div>

      <AppErrorAlert v-if="summaryError" :error="summaryError" />

      <form class="auth-form" novalidate @submit.prevent="submit">
        <label class="field">
          <span>Email</span>
          <input
            v-model="form.email"
            type="email"
            autocomplete="email"
            :aria-invalid="fieldErrors('email').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('email')" />
        </label>

        <label class="field">
          <span>Password</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            :aria-invalid="fieldErrors('password').length > 0"
          />
          <AppFieldErrors :errors="fieldErrors('password')" />
        </label>

        <AppFormActions :pending="pending" submit-label="Sign in" pending-label="Signing in..." />
      </form>

      <p class="auth-card__footer">
        Need an account?
        <RouterLink to="/auth/register">Create one</RouterLink>
      </p>
    </section>
  </main>
</template>
