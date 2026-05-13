<script setup lang="ts">
defineProps<{
  submitLabel?: string
  cancelLabel?: string
  pending?: boolean
  destructive?: boolean
  showCancel?: boolean
}>()

const emit = defineEmits<{
  cancel: []
}>()
</script>

<template>
  <div class="form-actions">
    <button class="button" :class="{ 'button--danger': destructive }" type="submit" :disabled="pending">
      {{ pending ? 'Saving...' : (submitLabel ?? 'Save') }}
    </button>
    <button
      v-if="showCancel"
      class="button button--secondary"
      type="button"
      :disabled="pending"
      @click="emit('cancel')"
    >
      {{ cancelLabel ?? 'Cancel' }}
    </button>
    <slot />
  </div>
</template>
