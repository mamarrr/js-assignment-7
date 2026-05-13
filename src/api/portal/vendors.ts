import { portalApi } from './generic'
import type {
  VendorDeleteConfirmationDto,
  VendorListItemDto,
  VendorProfileDto,
  VendorRequestDto,
} from '@/types/api'

export type { VendorDeleteConfirmationDto, VendorListItemDto, VendorProfileDto, VendorRequestDto }

const vendorsBase = '/api/v1/portal/companies/{companySlug}/vendors'
const vendorBase = `${vendorsBase}/{vendorId}`

export const vendorsApi = {
  list: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<VendorListItemDto[]>(vendorsBase, { companySlug }, query),
  create: (companySlug: string, body: VendorRequestDto) =>
    portalApi.post<VendorProfileDto>(vendorsBase, { companySlug }, body),
  detail: (companySlug: string, vendorId: string) =>
    portalApi.get<VendorProfileDto>(vendorBase, { companySlug, vendorId }),
  update: (companySlug: string, vendorId: string, body: VendorRequestDto) =>
    portalApi.put<VendorProfileDto>(vendorBase, { companySlug, vendorId }, body),
  delete: (companySlug: string, vendorId: string, body: VendorDeleteConfirmationDto) =>
    portalApi.delete<void>(vendorBase, { companySlug, vendorId }, body),
}
