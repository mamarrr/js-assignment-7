import { portalApi } from './generic'
import type {
  ApiRecord,
  ScheduledWorkActionDto,
  ScheduledWorkDetailsDto,
  ScheduledWorkFormDto,
  ScheduledWorkListDto,
  ScheduledWorkRequestDto,
} from '@/types/api'

export type { ScheduledWorkActionDto, ScheduledWorkDetailsDto, ScheduledWorkFormDto, ScheduledWorkListDto, ScheduledWorkRequestDto }

const scheduledWorkBase =
  '/api/v1/portal/companies/{companySlug}/tickets/{ticketId}/scheduled-work'
const scheduledWorkItemBase = `${scheduledWorkBase}/{scheduledWorkId}`

export const scheduledWorkApi = {
  list: (companySlug: string, ticketId: string) =>
    portalApi.get<ScheduledWorkListDto>(scheduledWorkBase, { companySlug, ticketId }),
  form: (companySlug: string, ticketId: string) =>
    portalApi.get<ScheduledWorkFormDto>(`${scheduledWorkBase}/form`, { companySlug, ticketId }),
  create: (companySlug: string, ticketId: string, body: ScheduledWorkRequestDto) =>
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
  update: (companySlug: string, ticketId: string, scheduledWorkId: string, body: ScheduledWorkRequestDto) =>
    portalApi.put<ScheduledWorkDetailsDto>(
      scheduledWorkItemBase,
      { companySlug, ticketId, scheduledWorkId },
      body,
    ),
  delete: (companySlug: string, ticketId: string, scheduledWorkId: string) =>
    portalApi.delete<ApiRecord>(scheduledWorkItemBase, { companySlug, ticketId, scheduledWorkId }),
  start: (companySlug: string, ticketId: string, scheduledWorkId: string, body: ScheduledWorkActionDto) =>
    portalApi.post<ApiRecord>(
      `${scheduledWorkItemBase}/start`,
      { companySlug, ticketId, scheduledWorkId },
      body,
    ),
  complete: (companySlug: string, ticketId: string, scheduledWorkId: string, body: ScheduledWorkActionDto) =>
    portalApi.post<ApiRecord>(
      `${scheduledWorkItemBase}/complete`,
      { companySlug, ticketId, scheduledWorkId },
      body,
    ),
  cancel: (companySlug: string, ticketId: string, scheduledWorkId: string) =>
    portalApi.post<ApiRecord>(`${scheduledWorkItemBase}/cancel`, { companySlug, ticketId, scheduledWorkId }),
}
