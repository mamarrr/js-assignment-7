import { apiRequest } from '../client'
import { portalApi } from './generic'
import type { LeaseRoleOptionsDto, LookupOptionDto, TicketOptionSetDto } from '@/types/api'

export const lookupsApi = {
  leaseRoles: () => apiRequest<LeaseRoleOptionsDto>('/api/v1/portal/lookups/lease-roles'),
  propertyTypes: () => apiRequest<LookupOptionDto[]>('/api/v1/portal/lookups/property-types'),
  ticketOptions: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<TicketOptionSetDto>(
      '/api/v1/portal/companies/{companySlug}/lookups/ticket-options',
      { companySlug },
      query,
    ),
}
