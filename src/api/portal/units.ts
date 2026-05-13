import { portalApi } from './generic'
import type {
  DeleteConfirmationDto,
  LeaseResidentSearchResultDto,
  ManagementTicketsDto,
  UnitDashboardDto,
  UnitListItemDto,
  UnitProfileDto,
  UnitRequestDto,
} from '@/types/api'

const unitsBase =
  '/api/v1/portal/companies/{companySlug}/customers/{customerSlug}/properties/{propertySlug}/units'
const unitBase = `${unitsBase}/{unitSlug}`

export const unitsApi = {
  list: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    query?: Record<string, unknown>,
  ) => portalApi.get<UnitListItemDto[]>(unitsBase, { companySlug, customerSlug, propertySlug }, query),
  create: (companySlug: string, customerSlug: string, propertySlug: string, body: UnitRequestDto) =>
    portalApi.post<UnitProfileDto>(unitsBase, { companySlug, customerSlug, propertySlug }, body),
  dashboard: (companySlug: string, customerSlug: string, propertySlug: string, unitSlug: string) =>
    portalApi.get<UnitDashboardDto>(`${unitBase}/dashboard`, {
      companySlug,
      customerSlug,
      propertySlug,
      unitSlug,
    }),
  profile: (companySlug: string, customerSlug: string, propertySlug: string, unitSlug: string) =>
    portalApi.get<UnitProfileDto>(`${unitBase}/profile`, {
      companySlug,
      customerSlug,
      propertySlug,
      unitSlug,
    }),
  updateProfile: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    unitSlug: string,
    body: UnitRequestDto,
  ) =>
    portalApi.put<UnitProfileDto>(
      `${unitBase}/profile`,
      { companySlug, customerSlug, propertySlug, unitSlug },
      body,
    ),
  deleteProfile: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    unitSlug: string,
    body: DeleteConfirmationDto,
  ) =>
    portalApi.delete<void>(
      `${unitBase}/profile`,
      { companySlug, customerSlug, propertySlug, unitSlug },
      body,
    ),
  tickets: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    unitSlug: string,
    query?: Record<string, unknown>,
  ) =>
    portalApi.get<ManagementTicketsDto>(
      `${unitBase}/tickets`,
      { companySlug, customerSlug, propertySlug, unitSlug },
      query,
    ),
  residentSearch: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    unitSlug: string,
    query?: Record<string, unknown>,
  ) =>
    portalApi.get<LeaseResidentSearchResultDto>(
      `${unitBase}/resident-search`,
      { companySlug, customerSlug, propertySlug, unitSlug },
      query,
    ),
}

