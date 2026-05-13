import { apiRequest } from '../client'
import { resolvePortalPath, type PortalParams } from './paths'
import type { ApiRecord } from '@/types/api'

export interface EndpointSet {
  list?: string
  detail?: string
  create?: string
  update?: string
  delete?: string
  form?: string
  actions?: Record<string, string>
}

export const portalApi = {
  get: <T = unknown>(template: string, params: PortalParams, query?: Record<string, unknown>) =>
    apiRequest<T>(resolvePortalPath(template, params, query)),
  post: <T = unknown>(template: string, params: PortalParams, body?: ApiRecord) =>
    apiRequest<T>(resolvePortalPath(template, params), { method: 'POST', body: body ?? {} }),
  put: <T = unknown>(template: string, params: PortalParams, body?: ApiRecord) =>
    apiRequest<T>(resolvePortalPath(template, params), { method: 'PUT', body: body ?? {} }),
  delete: <T = unknown>(template: string, params: PortalParams, body?: ApiRecord) =>
    apiRequest<T>(resolvePortalPath(template, params), { method: 'DELETE', body: body ?? {} }),
}

