import { portalApi } from './generic'
import type {
  ApiRecord,
  NewContactAssignmentDto,
  ResidentContactItemDto,
  ResidentContactListDto,
} from '@/types/api'

export type { ResidentContactItemDto, ResidentContactListDto }

export interface ResidentContactScope extends Record<string, string> {
  companySlug: string
  residentIdCode: string
}

const residentContactsBase =
  '/api/v1/portal/companies/{companySlug}/residents/{residentIdCode}/contacts'
const residentContactItemBase = `${residentContactsBase}/{residentContactId}`

export const residentContactsApi = {
  list: (scope: ResidentContactScope) =>
    portalApi.get<ResidentContactListDto>(residentContactsBase, scope),
  attachExisting: (scope: ResidentContactScope, body: ApiRecord) =>
    portalApi.post<ResidentContactListDto>(`${residentContactsBase}/attach`, scope, body),
  createAndAttach: (scope: ResidentContactScope, body: NewContactAssignmentDto) =>
    portalApi.post<ResidentContactListDto>(`${residentContactsBase}/create`, scope, body),
  updateAssignment: (scope: ResidentContactScope, residentContactId: string, body: ApiRecord) =>
    portalApi.put<ResidentContactListDto>(
      residentContactItemBase,
      { ...scope, residentContactId },
      body,
    ),
  deleteAssignment: (scope: ResidentContactScope, residentContactId: string) =>
    portalApi.delete<ResidentContactListDto>(residentContactItemBase, {
      ...scope,
      residentContactId,
    }),
  setPrimary: (scope: ResidentContactScope, residentContactId: string) =>
    portalApi.post<ResidentContactListDto>(`${residentContactItemBase}/set-primary`, {
      ...scope,
      residentContactId,
    }),
  confirm: (scope: ResidentContactScope, residentContactId: string) =>
    portalApi.post<ResidentContactListDto>(`${residentContactItemBase}/confirm`, {
      ...scope,
      residentContactId,
    }),
  unconfirm: (scope: ResidentContactScope, residentContactId: string) =>
    portalApi.post<ResidentContactListDto>(`${residentContactItemBase}/unconfirm`, {
      ...scope,
      residentContactId,
    }),
}
