export interface FieldErrors {
  [field: string]: string[]
}

export interface ApiError {
  status: number
  title: string
  message: string
  errorCode?: string
  traceId?: string
  fieldErrors: FieldErrors
  raw: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined

const normalizeFieldErrors = (payload: unknown): FieldErrors => {
  if (!isRecord(payload)) return {}
  const source = isRecord(payload.errors)
    ? payload.errors
    : isRecord(payload.Errors)
      ? payload.Errors
      : undefined
  if (!source) return {}

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(String) : [String(value)],
    ]),
  )
}

export const normalizeApiError = (status: number, payload: unknown): ApiError => {
  const record = isRecord(payload) ? payload : {}
  const title =
    asString(record.title) ??
    asString(record.error) ??
    asString(record.message) ??
    `Request failed (${status})`
  const detail = asString(record.detail) ?? asString(record.message) ?? title

  return {
    status,
    title,
    message: detail,
    errorCode: asString(record.errorCode),
    traceId: asString(record.traceId) ?? asString(record.TraceId),
    fieldErrors: normalizeFieldErrors(payload),
    raw: payload,
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  isRecord(error) && typeof error.status === 'number' && typeof error.title === 'string'

export const isUnauthorized = (error: unknown) => isApiError(error) && error.status === 401
export const isForbidden = (error: unknown) => isApiError(error) && error.status === 403
export const isNotFound = (error: unknown) => isApiError(error) && error.status === 404
