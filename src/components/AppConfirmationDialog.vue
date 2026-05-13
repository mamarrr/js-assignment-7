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

const confirm = (pending?: boolean) => {
  if (!pending) emit('confirm')
}

const cancel = (pending?: boolean) => {
  if (!pending) emit('cancel')
}
</script>

<template>
  <div v-if="open" class="dialog-backdrop" role="presentation" @click.self="cancel(pending)">
    <section class="dialog" role="dialog" aria-modal="true" :aria-labelledby="`${title}-title`">
      <h2 :id="`${title}-title`">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="dialog__actions">
        <button
          class="button button--secondary"
          type="button"
          :disabled="pending"
          @click="cancel(pending)"
        >
          {{ cancelLabel ?? 'Cancel' }}
        </button>
        <button
          class="button"
          :class="{ 'button--danger': destructive }"
          type="button"
          :disabled="pending"
          @click="confirm(pending)"
        >
          {{ pending ? 'Working...' : (confirmLabel ?? 'Confirm') }}
        </button>
      </div>
    </section>
  </div>
</template>
