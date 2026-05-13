import { apiRequest } from '../client'
import { portalBase } from './paths'
import type { ApiRecord, DeleteConfirmationDto } from '@/types/api'

export const companyApi = {
  dashboard: (companySlug: string) => apiRequest<ApiRecord>(`${portalBase(companySlug)}/dashboard`),
  profile: (companySlug: string) => apiRequest<ApiRecord>(`${portalBase(companySlug)}/profile`),
  updateProfile: (companySlug: string, body: ApiRecord) =>
    apiRequest<ApiRecord>(`${portalBase(companySlug)}/profile`, { method: 'PUT', body }),
  deleteCompany: (companySlug: string, body: DeleteConfirmationDto) =>
    apiRequest<void>(`${portalBase(companySlug)}`, { method: 'DELETE', body }),
}

