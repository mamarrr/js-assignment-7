import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { isApiError, type ApiError, type FieldErrors } from '@/api/errors'
import { useNotificationStore } from '@/stores/notifications'
import type { LookupOptionDto } from '@/types/api'

export const asRouteString = (value: unknown) =>
  Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

export const usePortalRouteParams = () => {
  const route = useRoute()
  return {
    companySlug: computed(() => asRouteString(route.params.companySlug)),
    customerSlug: computed(() => asRouteString(route.params.customerSlug)),
    propertySlug: computed(() => asRouteString(route.params.propertySlug)),
    unitSlug: computed(() => asRouteString(route.params.unitSlug)),
    residentIdCode: computed(() => asRouteString(route.params.residentIdCode)),
    ticketId: computed(() => asRouteString(route.params.ticketId)),
    scheduledWorkId: computed(() => asRouteString(route.params.scheduledWorkId)),
    workLogId: computed(() => asRouteString(route.params.workLogId)),
  }
}

export const useOperationState = () => {
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<ApiError | undefined>()
  const success = ref('')
  const notifications = useNotificationStore()

  const capture = (caught: unknown) => {
    error.value = isApiError(caught)
      ? caught
      : {
          status: 0,
          title: 'Request failed',
          message:
            caught instanceof Error ? caught.message : 'The operation could not be completed.',
          fieldErrors: {},
          raw: caught,
        }
  }

  const notifySuccess = (title: string) => {
    success.value = title
    notifications.push({ tone: 'success', title })
  }

  return { loading, saving, error, success, capture, notifySuccess }
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export const toDateTimeLocal = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

export const fromDateTimeLocal = (value?: string | null) =>
  value ? new Date(value).toISOString() : null

export const formatMoney = (value?: number | null) =>
  typeof value === 'number'
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(value)
    : '-'

export const formatNumber = (value?: number | null) =>
  typeof value === 'number' ? String(value) : '-'

export const fieldErrors = (errors: FieldErrors, ...names: string[]) =>
  names.flatMap((name) => {
    const normalized = name.toLowerCase()
    const matches = Object.entries(errors).filter(([key]) => {
      const keyNormalized = key.toLowerCase()
      return (
        key === name ||
        key === `$.${name}` ||
        keyNormalized === normalized ||
        keyNormalized === `$.${normalized}` ||
        keyNormalized.endsWith(`.${normalized}`)
      )
    })
    return matches.flatMap(([, value]) => value)
  })

export const summaryErrors = (errors?: FieldErrors) =>
  fieldErrors(errors ?? {}, '', '$', 'model', 'Model', 'Form')

export const optionValue = (option: LookupOptionDto) =>
  String(option.id ?? option.value ?? option.key ?? option.code ?? option.lookupId ?? '')

export const optionLabel = (option: LookupOptionDto) =>
  String(
    option.label ??
      option.name ??
      option.text ??
      option.displayName ??
      option.code ??
      optionValue(option),
  )

export const emptyToNull = (value: string | null | undefined) =>
  value && value.length > 0 ? value : null
