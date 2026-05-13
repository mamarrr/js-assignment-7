import { portalApi } from './generic'
import type {
  CustomerDashboardDto,
  CustomerListItemDto,
  CustomerProfileDto,
  CustomerRequestDto,
  DeleteConfirmationDto,
  ManagementTicketsDto,
} from '@/types/api'

const customersBase = '/api/v1/portal/companies/{companySlug}/customers'
const customerBase = `${customersBase}/{customerSlug}`

export const customersApi = {
  list: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<CustomerListItemDto[]>(customersBase, { companySlug }, query),
  create: (companySlug: string, body: CustomerRequestDto) =>
    portalApi.post<CustomerProfileDto>(customersBase, { companySlug }, body),
  dashboard: (companySlug: string, customerSlug: string) =>
    portalApi.get<CustomerDashboardDto>(`${customerBase}/dashboard`, { companySlug, customerSlug }),
  profile: (companySlug: string, customerSlug: string) =>
    portalApi.get<CustomerProfileDto>(`${customerBase}/profile`, { companySlug, customerSlug }),
  updateProfile: (companySlug: string, customerSlug: string, body: CustomerRequestDto) =>
    portalApi.put<CustomerProfileDto>(`${customerBase}/profile`, { companySlug, customerSlug }, body),
  deleteProfile: (companySlug: string, customerSlug: string, body: DeleteConfirmationDto) =>
    portalApi.delete<void>(`${customerBase}/profile`, { companySlug, customerSlug }, body),
  tickets: (companySlug: string, customerSlug: string, query?: Record<string, unknown>) =>
    portalApi.get<ManagementTicketsDto>(`${customerBase}/tickets`, { companySlug, customerSlug }, query),
}

