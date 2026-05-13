import { portalApi } from './generic'
import type {
  AssignVendorCategoryDto,
  UpdateVendorCategoryDto,
  VendorCategoryAssignmentDto,
  VendorCategoryAssignmentListDto,
} from '@/types/api'

export type {
  AssignVendorCategoryDto,
  UpdateVendorCategoryDto,
  VendorCategoryAssignmentDto,
  VendorCategoryAssignmentListDto,
}

export interface VendorCategoryScope extends Record<string, string> {
  companySlug: string
  vendorId: string
}

const vendorCategoriesBase = '/api/v1/portal/companies/{companySlug}/vendors/{vendorId}/categories'
const vendorCategoryBase = `${vendorCategoriesBase}/{ticketCategoryId}`

export const vendorCategoriesApi = {
  list: (scope: VendorCategoryScope) =>
    portalApi.get<VendorCategoryAssignmentListDto>(vendorCategoriesBase, scope),
  assign: (scope: VendorCategoryScope, body: AssignVendorCategoryDto) =>
    portalApi.post<VendorCategoryAssignmentListDto>(vendorCategoriesBase, scope, body),
  update: (scope: VendorCategoryScope, ticketCategoryId: string, body: UpdateVendorCategoryDto) =>
    portalApi.put<VendorCategoryAssignmentListDto>(
      vendorCategoryBase,
      { ...scope, ticketCategoryId },
      body,
    ),
  delete: (scope: VendorCategoryScope, ticketCategoryId: string) =>
    portalApi.delete<void>(vendorCategoryBase, { ...scope, ticketCategoryId }),
}
