import { queryString } from '../client'

export type PortalParams = Record<string, string | number | undefined>

const value = (params: PortalParams, key: string) => encodeURIComponent(String(params[key] ?? ''))

export const portalBase = (companySlug: string | number | undefined) =>
  `/api/v1/portal/companies/${encodeURIComponent(String(companySlug ?? ''))}`

export const resolvePortalPath = (
  template: string,
  params: PortalParams,
  query?: Record<string, unknown>,
) => {
  const path = template.replace(/\{(\w+)\}/g, (_, key: string) => value(params, key))
  return `${path}${query ? queryString(query) : ''}`
}
