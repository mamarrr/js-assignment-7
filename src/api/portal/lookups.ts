import { apiRequest } from '../client'
import type { LookupOptionDto } from '@/types/api'

export const lookupsApi = {
  leaseRoles: () => apiRequest<LookupOptionDto[]>('/api/v1/portal/lookups/lease-roles'),
  propertyTypes: () => apiRequest<LookupOptionDto[]>('/api/v1/portal/lookups/property-types'),
}

