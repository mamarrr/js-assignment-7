import { apiRequest } from './client'
import type { ApiRecord, LookupOptionDto, OnboardingStatusDto } from '@/types/api'

export const onboardingApi = {
  status: () => apiRequest<OnboardingStatusDto>('/api/v1/onboarding/status'),
  createManagementCompany: (body: ApiRecord) =>
    apiRequest<ApiRecord>('/api/v1/onboarding/management-companies', { method: 'POST', body }),
  managementCompanyRoles: () =>
    apiRequest<LookupOptionDto[]>('/api/v1/onboarding/management-company-roles'),
  joinManagementCompany: (body: ApiRecord) =>
    apiRequest<ApiRecord>('/api/v1/onboarding/management-company-join-requests', { method: 'POST', body }),
}

