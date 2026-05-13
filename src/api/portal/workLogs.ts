import { portalApi } from './generic'
import type { ApiRecord, WorkLogDeleteModelDto, WorkLogFormDto, WorkLogListDto, WorkLogRequestDto } from '@/types/api'

export type { WorkLogDeleteModelDto, WorkLogFormDto, WorkLogListDto, WorkLogRequestDto }

const workLogsBase =
  '/api/v1/portal/companies/{companySlug}/tickets/{ticketId}/scheduled-work/{scheduledWorkId}/work-logs'
const workLogItemBase = `${workLogsBase}/{workLogId}`

export const workLogsApi = {
  list: (companySlug: string, ticketId: string, scheduledWorkId: string) =>
    portalApi.get<WorkLogListDto>(workLogsBase, { companySlug, ticketId, scheduledWorkId }),
  form: (companySlug: string, ticketId: string, scheduledWorkId: string) =>
    portalApi.get<WorkLogFormDto>(`${workLogsBase}/form`, { companySlug, ticketId, scheduledWorkId }),
  create: (companySlug: string, ticketId: string, scheduledWorkId: string, body: WorkLogRequestDto) =>
    portalApi.post<ApiRecord>(workLogsBase, { companySlug, ticketId, scheduledWorkId }, body),
  editForm: (companySlug: string, ticketId: string, scheduledWorkId: string, workLogId: string) =>
    portalApi.get<WorkLogFormDto>(`${workLogItemBase}/form`, {
      companySlug,
      ticketId,
      scheduledWorkId,
      workLogId,
    }),
  deleteModel: (companySlug: string, ticketId: string, scheduledWorkId: string, workLogId: string) =>
    portalApi.get<WorkLogDeleteModelDto>(`${workLogItemBase}/delete-model`, {
      companySlug,
      ticketId,
      scheduledWorkId,
      workLogId,
    }),
  update: (
    companySlug: string,
    ticketId: string,
    scheduledWorkId: string,
    workLogId: string,
    body: WorkLogRequestDto,
  ) =>
    portalApi.put<ApiRecord>(
      workLogItemBase,
      { companySlug, ticketId, scheduledWorkId, workLogId },
      body,
    ),
  delete: (companySlug: string, ticketId: string, scheduledWorkId: string, workLogId: string) =>
    portalApi.delete<void>(workLogItemBase, { companySlug, ticketId, scheduledWorkId, workLogId }),
}
