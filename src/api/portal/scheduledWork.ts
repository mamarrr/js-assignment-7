import { portalApi } from './generic'
import type {
  ApiRecord,
  ScheduledWorkDetailsDto,
  ScheduledWorkFormDto,
  ScheduledWorkListDto,
} from '@/types/api'

export type { ScheduledWorkDetailsDto, ScheduledWorkFormDto, ScheduledWorkListDto }

const scheduledWorkBase =
  '/api/v1/portal/companies/{companySlug}/tickets/{ticketId}/scheduled-work'
const scheduledWorkItemBase = `${scheduledWorkBase}/{scheduledWorkId}`

export const scheduledWorkApi = {
  list: (companySlug: string, ticketId: string) =>
    portalApi.get<ScheduledWorkListDto>(scheduledWorkBase, { companySlug, ticketId }),
  form: (companySlug: string, ticketId: string) =>
    portalApi.get<ScheduledWorkFormDto>(`${scheduledWorkBase}/form`, { companySlug, ticketId }),
  create: (companySlug: string, ticketId: string, body: ApiRecord) =>
    portalApi.post<ScheduledWorkDetailsDto>(scheduledWorkBase, { companySlug, ticketId }, body),
  detail: (companySlug: string, ticketId: string, scheduledWorkId: string) =>
    portalApi.get<ScheduledWorkDetailsDto>(scheduledWorkItemBase, {
      companySlug,
      ticketId,
      scheduledWorkId,
    }),
  editForm: (companySlug: string, ticketId: string, scheduledWorkId: string) =>
    portalApi.get<ScheduledWorkFormDto>(`${scheduledWorkItemBase}/form`, {
      companySlug,
      ticketId,
      scheduledWorkId,
    }),
  update: (companySlug: string, ticketId: string, scheduledWorkId: string, body: ApiRecord) =>
    portalApi.put<ScheduledWorkDetailsDto>(
      scheduledWorkItemBase,
      { companySlug, ticketId, scheduledWorkId },
      body,
    ),
  delete: (companySlug: string, ticketId: string, scheduledWorkId: string, body?: ApiRecord) =>
    portalApi.delete<void>(scheduledWorkItemBase, { companySlug, ticketId, scheduledWorkId }, body),
  start: (companySlug: string, ticketId: string, scheduledWorkId: string, body?: ApiRecord) =>
    portalApi.post<ScheduledWorkDetailsDto>(
      `${scheduledWorkItemBase}/start`,
      { companySlug, ticketId, scheduledWorkId },
      body,
    ),
  complete: (companySlug: string, ticketId: string, scheduledWorkId: string, body?: ApiRecord) =>
    portalApi.post<ScheduledWorkDetailsDto>(
      `${scheduledWorkItemBase}/complete`,
      { companySlug, ticketId, scheduledWorkId },
      body,
    ),
  cancel: (companySlug: string, ticketId: string, scheduledWorkId: string, body?: ApiRecord) =>
    portalApi.post<ScheduledWorkDetailsDto>(
      `${scheduledWorkItemBase}/cancel`,
      { companySlug, ticketId, scheduledWorkId },
      body,
    ),
}
