<script setup lang="ts">
import type { ApiError } from '@/api/errors'
import type { ApiRecord } from '@/types/api'
import type { FieldConfig } from './helpers'
import { labelForOption } from './helpers'

defineProps<{
  title: string
  description?: string
  fields: FieldConfig[]
  modelValue: ApiRecord
  pending?: boolean
  error?: ApiError | null
  submitLabel: string
  danger?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ApiRecord]
  submit: []
}>()

const update = (modelValue: ApiRecord, key: string, value: string) => {
  emit('update:modelValue', { ...modelValue, [key]: value })
}
</script>

<template>
  <form class="hierarchy-card hierarchy-form" @submit.prevent="emit('submit')">
    <div>
      <h2>{{ title }}</h2>
      <p v-if="description" class="hierarchy-muted">{{ description }}</p>
    </div>

    <div v-if="error" class="hierarchy-alert hierarchy-alert-error" role="alert">
      <strong>{{ error.title }}</strong>
      <p>{{ error.message }}</p>
    </div>

    <label v-for="field in fields" :key="field.key" class="hierarchy-field">
      <span>{{ field.label }}</span>
      <textarea
        v-if="field.type === 'textarea'"
        :value="String(modelValue[field.key] ?? '')"
        :disabled="pending"
        @input="update(modelValue, field.key, ($event.target as HTMLTextAreaElement).value)"
      />
      <select
        v-else-if="field.type === 'select'"
        :value="String(modelValue[field.key] ?? '')"
        :disabled="pending"
        @change="update(modelValue, field.key, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Select...</option>
        <option
          v-for="option in field.options ?? []"
          :key="labelForOption(option, field.optionValue, field.optionLabel).value"
          :value="labelForOption(option, field.optionValue, field.optionLabel).value"
        >
          {{ labelForOption(option, field.optionValue, field.optionLabel).label }}
        </option>
      </select>
      <input
        v-else
        :type="field.type ?? 'text'"
        :value="String(modelValue[field.key] ?? '')"
        :disabled="pending"
        @input="update(modelValue, field.key, ($event.target as HTMLInputElement).value)"
      />
      <small v-if="error?.fieldErrors?.[field.key]?.length" class="hierarchy-field-error">
        {{ error.fieldErrors[field.key].join(' ') }}
      </small>
    </label>

    <button class="hierarchy-button" :class="{ danger }" type="submit" :disabled="pending">
      {{ pending ? 'Saving...' : submitLabel }}
    </button>
  </form>
</template>

<style scoped>
.hierarchy-card {
  display: grid;
  gap: 1rem;
  border: 1px solid #d6dde8;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}

.hierarchy-form {
  align-content: start;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
}

.hierarchy-muted {
  margin: 0.25rem 0 0;
  color: #5d687a;
}

.hierarchy-alert {
  border: 1px solid #f3b9b9;
  border-radius: 8px;
  padding: 0.75rem;
  background: #fff5f5;
}

.hierarchy-field {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #b9c3d0;
  border-radius: 6px;
  padding: 0.6rem 0.7rem;
  font: inherit;
}

textarea {
  min-height: 5rem;
}

.hierarchy-field-error {
  color: #b42318;
}

.hierarchy-button {
  justify-self: start;
  border: 0;
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  background: #155eef;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.hierarchy-button.danger {
  background: #b42318;
}

.hierarchy-button:disabled {
  cursor: wait;
  opacity: 0.65;
}
</style>

