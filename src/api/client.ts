import { normalizeApiError, type ApiError } from './errors'

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
  retryOnUnauthorized?: boolean
}

type TokenGetter = () => string | undefined
type RefreshHandler = () => Promise<boolean>
type UnauthorizedHandler = () => void

let getToken: TokenGetter = () => undefined
let refreshHandler: RefreshHandler | undefined
let unauthorizedHandler: UnauthorizedHandler | undefined
let refreshPromise: Promise<boolean> | undefined

export const configureApiClient = (options: {
  getToken?: TokenGetter
  refresh?: RefreshHandler
  onUnauthorized?: UnauthorizedHandler
}) => {
  getToken = options.getToken ?? getToken
  refreshHandler = options.refresh
  unauthorizedHandler = options.onUnauthorized
}

const baseUrl = () => (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const buildUrl = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl()}${normalized}`
}

const parsePayload = async (response: Response) => {
  if (response.status === 204) return undefined
  const text = await response.text()
  if (!text) return undefined
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return JSON.parse(text)
  return text
}

const execute = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (options.body !== undefined && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json')

  const token = options.auth === false ? undefined : getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = await parsePayload(response)
  if (response.ok) return payload as T

  throw normalizeApiError(response.status, payload)
}

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  try {
    return await execute<T>(path, options)
  } catch (error) {
    const apiError = error as ApiError
    const shouldRefresh =
      apiError.status === 401 &&
      options.auth !== false &&
      options.retryOnUnauthorized !== false &&
      refreshHandler

    if (!shouldRefresh) throw error

    refreshPromise ??= refreshHandler!().finally(() => {
      refreshPromise = undefined
    })

    const refreshed = await refreshPromise
    if (!refreshed) {
      unauthorizedHandler?.()
      throw error
    }

    return execute<T>(path, { ...options, retryOnUnauthorized: false })
  }
}

export const queryString = (params: Record<string, unknown>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}
