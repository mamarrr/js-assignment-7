<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  pending?: boolean
  destructive?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="dialog-backdrop" role="presentation" @click.self="emit('cancel')">
    <section class="dialog" role="dialog" aria-modal="true" :aria-labelledby="`${title}-title`">
      <h2 :id="`${title}-title`">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="dialog__actions">
        <button class="button button--secondary" type="button" :disabled="pending" @click="emit('cancel')">
          {{ cancelLabel ?? 'Cancel' }}
        </button>
        <button
          class="button"
          :class="{ 'button--danger': destructive }"
          type="button"
          :disabled="pending"
          @click="emit('confirm')"
        >
          {{ pending ? 'Working...' : (confirmLabel ?? 'Confirm') }}
        </button>
      </div>
    </section>
  </div>
</template>
