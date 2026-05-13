import { portalApi } from './generic'
import type {
  DeleteConfirmationDto,
  LeasePropertySearchResultDto,
  LeaseUnitOptionsDto,
  ManagementTicketsDto,
  ResidentDashboardDto,
  ResidentListItemDto,
  ResidentProfileDto,
  ResidentRequestDto,
} from '@/types/api'

const residentsBase = '/api/v1/portal/companies/{companySlug}/residents'
const residentBase = `${residentsBase}/{residentIdCode}`

export const residentsApi = {
  list: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<ResidentListItemDto[]>(residentsBase, { companySlug }, query),
  create: (companySlug: string, body: ResidentRequestDto) =>
    portalApi.post<ResidentProfileDto>(residentsBase, { companySlug }, body),
  dashboard: (companySlug: string, residentIdCode: string) =>
    portalApi.get<ResidentDashboardDto>(`${residentBase}/dashboard`, {
      companySlug,
      residentIdCode,
    }),
  profile: (companySlug: string, residentIdCode: string) =>
    portalApi.get<ResidentProfileDto>(`${residentBase}/profile`, { companySlug, residentIdCode }),
  updateProfile: (companySlug: string, residentIdCode: string, body: ResidentRequestDto) =>
    portalApi.put<ResidentProfileDto>(
      `${residentBase}/profile`,
      { companySlug, residentIdCode },
      body,
    ),
  deleteProfile: (companySlug: string, residentIdCode: string, body: DeleteConfirmationDto) =>
    portalApi.delete<void>(`${residentBase}/profile`, { companySlug, residentIdCode }, body),
  tickets: (companySlug: string, residentIdCode: string, query?: Record<string, unknown>) =>
    portalApi.get<ManagementTicketsDto>(
      `${residentBase}/tickets`,
      { companySlug, residentIdCode },
      query,
    ),
  propertySearch: (companySlug: string, residentIdCode: string, query?: Record<string, unknown>) =>
    portalApi.get<LeasePropertySearchResultDto>(
      `${residentBase}/property-search`,
      { companySlug, residentIdCode },
      query,
    ),
  leaseUnitOptions: (companySlug: string, residentIdCode: string, propertyId: string) =>
    portalApi.get<LeaseUnitOptionsDto>(`${residentBase}/leases/properties/{propertyId}/units`, {
      companySlug,
      residentIdCode,
      propertyId,
    }),
}
