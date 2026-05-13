import { portalApi } from './generic'
import type { ApiRecord, LeaseDto, LeaseRoleOptionDto, LeaseRoleOptionsDto } from '@/types/api'

export type { LeaseDto, LeaseRoleOptionDto, LeaseRoleOptionsDto }

export interface UnitLeaseScope extends Record<string, string> {
  companySlug: string
  customerSlug: string
  propertySlug: string
  unitSlug: string
}

export interface ResidentLeaseScope extends Record<string, string> {
  companySlug: string
  residentIdCode: string
}

const unitLeasesBase =
  '/api/v1/portal/companies/{companySlug}/customers/{customerSlug}/properties/{propertySlug}/units/{unitSlug}/leases'
const residentLeasesBase =
  '/api/v1/portal/companies/{companySlug}/residents/{residentIdCode}/leases'

export const unitLeasesApi = {
  list: (scope: UnitLeaseScope) => portalApi.get<LeaseDto[]>(unitLeasesBase, scope),
  create: (scope: UnitLeaseScope, body: ApiRecord) =>
    portalApi.post<LeaseDto>(unitLeasesBase, scope, body),
  update: (scope: UnitLeaseScope, leaseId: string, body: ApiRecord) =>
    portalApi.put<LeaseDto>(`${unitLeasesBase}/{leaseId}`, { ...scope, leaseId }, body),
  delete: (scope: UnitLeaseScope, leaseId: string) =>
    portalApi.delete<void>(`${unitLeasesBase}/{leaseId}`, { ...scope, leaseId }),
  searchResidents: (scope: UnitLeaseScope, search?: string) =>
    portalApi.get<ApiRecord>(`${unitLeasesBase}/resident-search`, scope, { search }),
  roles: (scope: UnitLeaseScope) =>
    portalApi.get<LeaseRoleOptionsDto>(`${unitLeasesBase}/roles`, scope),
}

export const residentLeasesApi = {
  list: (scope: ResidentLeaseScope) => portalApi.get<LeaseDto[]>(residentLeasesBase, scope),
  create: (scope: ResidentLeaseScope, body: ApiRecord) =>
    portalApi.post<LeaseDto>(residentLeasesBase, scope, body),
  update: (scope: ResidentLeaseScope, leaseId: string, body: ApiRecord) =>
    portalApi.put<LeaseDto>(`${residentLeasesBase}/{leaseId}`, { ...scope, leaseId }, body),
  delete: (scope: ResidentLeaseScope, leaseId: string) =>
    portalApi.delete<void>(`${residentLeasesBase}/{leaseId}`, { ...scope, leaseId }),
  searchProperties: (scope: ResidentLeaseScope, search?: string) =>
    portalApi.get<ApiRecord>(`${residentLeasesBase}/property-search`, scope, { search }),
  unitsForProperty: (scope: ResidentLeaseScope, propertyId: string) =>
    portalApi.get<ApiRecord>(`${residentLeasesBase}/properties/{propertyId}/units`, {
      ...scope,
      propertyId,
    }),
  roles: (scope: ResidentLeaseScope) =>
    portalApi.get<LeaseRoleOptionsDto>(`${residentLeasesBase}/roles`, scope),
}
