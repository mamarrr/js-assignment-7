<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'

const notifications = useNotificationStore()
</script>

<template>
  <aside
    v-if="notifications.items.length"
    class="notifications"
    aria-live="polite"
    aria-label="Notifications"
  >
    <article
      v-for="notification in notifications.items"
      :key="notification.id"
      class="notification"
      :class="`notification--${notification.tone}`"
    >
      <div>
        <strong>{{ notification.title }}</strong>
        <p v-if="notification.message">{{ notification.message }}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        @click="notifications.dismiss(notification.id)"
      >
        x
      </button>
    </article>
  </aside>
</template>
