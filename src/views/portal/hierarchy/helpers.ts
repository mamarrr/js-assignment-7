import type { ApiRecord } from '@/types/api'

export interface FieldConfig {
  key: string
  label: string
  type?: 'text' | 'email' | 'date' | 'number' | 'textarea' | 'select'
  options?: ApiRecord[]
  optionValue?: string
  optionLabel?: string
}

export interface ColumnConfig {
  key: string
  label: string
}

export const asRecord = (value: unknown): ApiRecord =>
  typeof value === 'object' && value !== null ? (value as ApiRecord) : {}

export const asArray = <T = ApiRecord>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

export const pickFirstArray = <T = ApiRecord>(source: unknown, keys: string[]): T[] => {
  const record = asRecord(source)
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value as T[]
  }
  return Array.isArray(source) ? (source as T[]) : []
}

export const read = (source: unknown, key: string): unknown => asRecord(source)[key]

export const text = (source: unknown, keys: string[], fallback = '-'): string => {
  const record = asRecord(source)
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== '') return String(value)
  }
  return fallback
}

export const idText = (source: unknown, keys: string[]) => text(source, keys, '')

export const displayDate = (value: unknown) => {
  if (!value) return '-'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString()
}

export const displayValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return displayDate(value)
  return String(value)
}

export const routeParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? ''

export const buildPayload = (fields: FieldConfig[], form: ApiRecord) =>
  Object.fromEntries(fields.map((field) => [field.key, form[field.key] ?? '']))

export const seedForm = (fields: FieldConfig[], source?: ApiRecord): ApiRecord =>
  Object.fromEntries(fields.map((field) => [field.key, source?.[field.key] ?? '']))

export const labelForOption = (option: ApiRecord, valueKey = 'id', labelKey = 'label') => ({
  value: String(option[valueKey] ?? option.value ?? option.code ?? ''),
  label: String(option[labelKey] ?? option.name ?? option.text ?? option.code ?? option[valueKey] ?? ''),
})

