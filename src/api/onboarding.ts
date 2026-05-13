import { apiRequest } from './client'
import type {
  CreateManagementCompanyDto,
  CreatedManagementCompanyDto,
  JoinManagementCompanyRequestDto,
  JoinRequestResultDto,
  LookupOptionDto,
  OnboardingStatusDto,
} from '@/types/api'

export const onboardingApi = {
  status: () => apiRequest<OnboardingStatusDto>('/api/v1/onboarding/status'),
  createManagementCompany: (body: CreateManagementCompanyDto) =>
    apiRequest<CreatedManagementCompanyDto>('/api/v1/onboarding/management-companies', { method: 'POST', body }),
  managementCompanyRoles: () =>
    apiRequest<LookupOptionDto[]>('/api/v1/onboarding/management-company-roles'),
  joinManagementCompany: (body: JoinManagementCompanyRequestDto) =>
    apiRequest<JoinRequestResultDto>('/api/v1/onboarding/management-company-join-requests', { method: 'POST', body }),
}
