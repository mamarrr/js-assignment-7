import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ApiError } from '@/api/errors'
import type { ApiRecord } from '@/types/api'

export const today = () => new Date().toISOString().slice(0, 10)

export const useRouteParam = (name: string) => {
  const route = useRoute()
  return computed(() => String(route.params[name] ?? ''))
}

export const useAsyncState = () => {
  const loading = ref(false)
  const pending = ref(false)
  const success = ref('')
  const error = ref<ApiError | Error | null>(null)

  const run = async <T>(action: () => Promise<T>, options?: { pending?: boolean; success?: string }) => {
    const pendingRef = options?.pending ? pending : loading
    pendingRef.value = true
    error.value = null
    success.value = ''
    try {
      const result = await action()
      if (options?.success) success.value = options.success
      return result
    } catch (caught) {
      error.value = caught as ApiError | Error
      throw caught
    } finally {
      pendingRef.value = false
    }
  }

  return { loading, pending, success, error, run }
}

export const apiMessage = (error: ApiError | Error | null) => {
  if (!error) return ''
  const apiError = error as ApiError
  return apiError.message || apiError.title || 'The request failed.'
}

export const fieldError = (error: ApiError | Error | null, field: string) => {
  const apiError = error as ApiError | null
  const errors = apiError?.fieldErrors?.[field] ?? apiError?.fieldErrors?.[field.charAt(0).toUpperCase() + field.slice(1)]
  return Array.isArray(errors) ? errors.join(' ') : ''
}

export const optionId = (option: ApiRecord, fallbacks: string[]) =>
  String(fallbacks.map((key) => option[key]).find((value) => value !== undefined && value !== null) ?? '')

export const optionLabel = (option: ApiRecord, fallbacks: string[]) =>
  String(fallbacks.map((key) => option[key]).find((value) => value !== undefined && value !== null) ?? '')

export const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : [])

export const createContactAssignmentForm = () =>
  reactive({
    contactId: '',
    validFrom: today(),
    validTo: '',
    confirmed: true,
    isPrimary: false,
    fullName: '',
    roleTitle: '',
  })

export const createNewContactForm = () =>
  reactive({
    contactTypeId: '',
    contactValue: '',
    contactNotes: '',
    validFrom: today(),
    validTo: '',
    confirmed: true,
    isPrimary: false,
    fullName: '',
    roleTitle: '',
  })

export const createLeaseForm = () =>
  reactive({
    residentId: '',
    propertyId: '',
    unitId: '',
    leaseRoleId: '',
    startDate: today(),
    endDate: '',
    notes: '',
  })
