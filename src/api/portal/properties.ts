import { portalApi } from './generic'
import type {
  CreatePropertyDto,
  DeleteConfirmationDto,
  ManagementTicketsDto,
  PropertyDashboardDto,
  PropertyListItemDto,
  PropertyProfileDto,
  UpdatePropertyProfileDto,
} from '@/types/api'

const propertiesBase =
  '/api/v1/portal/companies/{companySlug}/customers/{customerSlug}/properties'
const propertyBase = `${propertiesBase}/{propertySlug}`

export const propertiesApi = {
  list: (companySlug: string, customerSlug: string, query?: Record<string, unknown>) =>
    portalApi.get<PropertyListItemDto[]>(propertiesBase, { companySlug, customerSlug }, query),
  create: (companySlug: string, customerSlug: string, body: CreatePropertyDto) =>
    portalApi.post<PropertyProfileDto>(propertiesBase, { companySlug, customerSlug }, body),
  dashboard: (companySlug: string, customerSlug: string, propertySlug: string) =>
    portalApi.get<PropertyDashboardDto>(`${propertyBase}/dashboard`, {
      companySlug,
      customerSlug,
      propertySlug,
    }),
  profile: (companySlug: string, customerSlug: string, propertySlug: string) =>
    portalApi.get<PropertyProfileDto>(`${propertyBase}/profile`, {
      companySlug,
      customerSlug,
      propertySlug,
    }),
  updateProfile: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    body: UpdatePropertyProfileDto,
  ) =>
    portalApi.put<PropertyProfileDto>(
      `${propertyBase}/profile`,
      { companySlug, customerSlug, propertySlug },
      body,
    ),
  deleteProfile: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    body: DeleteConfirmationDto,
  ) =>
    portalApi.delete<void>(
      `${propertyBase}/profile`,
      { companySlug, customerSlug, propertySlug },
      body,
    ),
  tickets: (
    companySlug: string,
    customerSlug: string,
    propertySlug: string,
    query?: Record<string, unknown>,
  ) =>
    portalApi.get<ManagementTicketsDto>(
      `${propertyBase}/tickets`,
      { companySlug, customerSlug, propertySlug },
      query,
    ),
}

