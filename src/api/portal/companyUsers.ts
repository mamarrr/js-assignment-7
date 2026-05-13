import { portalApi } from './generic'
import type {
  AddCompanyUserDto,
  CompanyUserEditDto,
  CompanyUserRoleOptionDto,
  CompanyUsersPageDto,
  OwnershipTransferCandidateDto,
  OwnershipTransferResultDto,
  TransferOwnershipDto,
  UpdateCompanyUserDto,
} from '@/types/api'

const base = '/api/v1/portal/companies/{companySlug}/users'

export const companyUsersApi = {
  list: (companySlug: string) => portalApi.get<CompanyUsersPageDto>(base, { companySlug }),
  add: (companySlug: string, body: AddCompanyUserDto) =>
    portalApi.post<CompanyUserEditDto>(base, { companySlug }, body),
  edit: (companySlug: string, membershipId: string) =>
    portalApi.get<CompanyUserEditDto>(`${base}/{membershipId}`, { companySlug, membershipId }),
  update: (companySlug: string, membershipId: string, body: UpdateCompanyUserDto) =>
    portalApi.put<CompanyUserEditDto>(
      `${base}/{membershipId}`,
      { companySlug, membershipId },
      body,
    ),
  remove: (companySlug: string, membershipId: string) =>
    portalApi.delete<void>(`${base}/{membershipId}`, { companySlug, membershipId }),
  roles: (companySlug: string) =>
    portalApi.get<CompanyUserRoleOptionDto[]>(`${base}/roles`, { companySlug }),
  ownershipTransferCandidates: (companySlug: string) =>
    portalApi.get<OwnershipTransferCandidateDto[]>(`${base}/ownership-transfer-candidates`, {
      companySlug,
    }),
  transferOwnership: (companySlug: string, body: TransferOwnershipDto) =>
    portalApi.post<OwnershipTransferResultDto>(`${base}/transfer-ownership`, { companySlug }, body),
  approveAccessRequest: (companySlug: string, requestId: string) =>
    portalApi.post<CompanyUsersPageDto>(`${base}/access-requests/{requestId}/approve`, {
      companySlug,
      requestId,
    }),
  rejectAccessRequest: (companySlug: string, requestId: string) =>
    portalApi.post<CompanyUsersPageDto>(`${base}/access-requests/{requestId}/reject`, {
      companySlug,
      requestId,
    }),
}
