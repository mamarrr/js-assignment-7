<script setup lang="ts">
import { ref } from 'vue'
import AppConfirmationDialog from '@/components/AppConfirmationDialog.vue'
import AppEmptyState from '@/components/AppEmptyState.vue'
import AppErrorAlert from '@/components/AppErrorAlert.vue'
import AppFieldErrors from '@/components/AppFieldErrors.vue'
import AppFormActions from '@/components/AppFormActions.vue'
import AppLoading from '@/components/AppLoading.vue'
import OperationalLayout from '@/layouts/OperationalLayout.vue'
import { useNotificationStore } from '@/stores/notifications'

const notifications = useNotificationStore()
const showConfirmation = ref(false)
const pending = ref(false)

const confirmAction = () => {
  pending.value = true
  window.setTimeout(() => {
    pending.value = false
    showConfirmation.value = false
    notifications.push({
      tone: 'success',
      title: 'Action confirmed',
      message: 'The shell notification area is ready for feature flows.',
    })
  }, 300)
}
</script>

<template>
  <OperationalLayout
    eyebrow="Frontend foundation"
    title="Operational app shell"
    description="The Vue router, Pinia, shared UI primitives, and responsive shell are ready for feature phases."
    :breadcrumbs="[{ label: 'Foundation' }]"
  >
    <template #actions>
      <button class="button" type="button" @click="notifications.push({ tone: 'info', title: 'Notification ready' })">
        Show notification
      </button>
    </template>

    <section class="content-grid content-grid--two">
      <article class="panel">
        <h2>Page states</h2>
        <AppLoading label="Loading page data..." />
        <AppEmptyState title="No records yet" message="Feature pages can use this state before data exists." />
      </article>

      <article class="panel">
        <h2>Validation and errors</h2>
        <AppErrorAlert title="Request failed" message="Feature pages can show a page-level error here." />
        <label class="field">
          <span>Example field</span>
          <input type="text" value="" aria-invalid="true" />
          <AppFieldErrors :errors="['This field is required.']" />
        </label>
      </article>

      <article class="panel panel--wide">
        <h2>Form actions and confirmation</h2>
        <form @submit.prevent="showConfirmation = true">
          <AppFormActions submit-label="Open confirmation" show-cancel />
        </form>
      </article>
    </section>

    <AppConfirmationDialog
      :open="showConfirmation"
      title="Confirm action"
      message="This shared dialog will be used by destructive and high-impact flows."
      confirm-label="Confirm"
      :pending="pending"
      @cancel="showConfirmation = false"
      @confirm="confirmAction"
    />
  </OperationalLayout>
</template>
