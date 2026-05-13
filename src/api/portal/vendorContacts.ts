import { portalApi } from './generic'
import type {
  ApiRecord,
  NewContactAssignmentDto,
  VendorContactItemDto,
  VendorContactListDto,
} from '@/types/api'

export type { VendorContactItemDto, VendorContactListDto }

export interface VendorContactScope extends Record<string, string> {
  companySlug: string
  vendorId: string
}

const vendorContactsBase = '/api/v1/portal/companies/{companySlug}/vendors/{vendorId}/contacts'
const vendorContactItemBase = `${vendorContactsBase}/{vendorContactId}`

export const vendorContactsApi = {
  list: (scope: VendorContactScope) =>
    portalApi.get<VendorContactListDto>(vendorContactsBase, scope),
  attachExisting: (scope: VendorContactScope, body: ApiRecord) =>
    portalApi.post<VendorContactListDto>(`${vendorContactsBase}/attach`, scope, body),
  createAndAttach: (scope: VendorContactScope, body: NewContactAssignmentDto) =>
    portalApi.post<VendorContactListDto>(`${vendorContactsBase}/create`, scope, body),
  updateAssignment: (scope: VendorContactScope, vendorContactId: string, body: ApiRecord) =>
    portalApi.put<VendorContactListDto>(vendorContactItemBase, { ...scope, vendorContactId }, body),
  deleteAssignment: (scope: VendorContactScope, vendorContactId: string) =>
    portalApi.delete<VendorContactListDto>(vendorContactItemBase, { ...scope, vendorContactId }),
  setPrimary: (scope: VendorContactScope, vendorContactId: string) =>
    portalApi.post<VendorContactListDto>(`${vendorContactItemBase}/set-primary`, {
      ...scope,
      vendorContactId,
    }),
  confirm: (scope: VendorContactScope, vendorContactId: string) =>
    portalApi.post<VendorContactListDto>(`${vendorContactItemBase}/confirm`, {
      ...scope,
      vendorContactId,
    }),
  unconfirm: (scope: VendorContactScope, vendorContactId: string) =>
    portalApi.post<VendorContactListDto>(`${vendorContactItemBase}/unconfirm`, {
      ...scope,
      vendorContactId,
    }),
}
