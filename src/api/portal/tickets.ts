import { portalApi } from './generic'
import type {
  ContextTicketsDto,
  CreateTicketDto,
  DeleteConfirmationDto,
  ManagementTicketsDto,
  TicketDto,
  TicketDetailsDto,
  TicketFilterDto,
  TicketFormDto,
  TicketOptionSetDto,
  TicketTransitionAvailabilityDto,
  UpdateTicketDto,
} from '@/types/api'

export type TicketContext =
  | { type: 'customer'; customerSlug: string }
  | { type: 'property'; customerSlug: string; propertySlug: string }
  | { type: 'unit'; customerSlug: string; propertySlug: string; unitSlug: string }
  | { type: 'resident'; residentIdCode: string }

export type {
  ContextTicketsDto,
  ManagementTicketsDto,
  TicketDetailsDto,
  TicketFilterDto,
  TicketFormDto,
  TicketOptionSetDto,
  TicketTransitionAvailabilityDto,
}

const ticketsBase = '/api/v1/portal/companies/{companySlug}/tickets'
const ticketBase = `${ticketsBase}/{ticketId}`

const contextPath = (context: TicketContext) => {
  if (context.type === 'customer') return `${ticketsBase}/customers/{customerSlug}`
  if (context.type === 'property') {
    return `${ticketsBase}/customers/{customerSlug}/properties/{propertySlug}`
  }
  if (context.type === 'unit') {
    return `${ticketsBase}/customers/{customerSlug}/properties/{propertySlug}/units/{unitSlug}`
  }
  return `${ticketsBase}/residents/{residentIdCode}`
}

export const ticketLifecycle = [
  'Created',
  'Assigned',
  'Scheduled',
  'In Progress',
  'Completed',
  'Closed',
]

export const ticketsApi = {
  list: (companySlug: string, query?: TicketFilterDto) =>
    portalApi.get<ManagementTicketsDto>(ticketsBase, { companySlug }, query),
  listForContext: (companySlug: string, context: TicketContext, query?: TicketFilterDto) =>
    portalApi.get<ContextTicketsDto>(contextPath(context), { companySlug, ...context }, query),
  form: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<TicketFormDto>(`${ticketsBase}/form`, { companySlug }, query),
  options: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<TicketOptionSetDto>(`${ticketsBase}/options`, { companySlug }, query),
  propertyOptions: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<TicketOptionSetDto>(`${ticketsBase}/options/properties`, { companySlug }, query),
  unitOptions: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<TicketOptionSetDto>(`${ticketsBase}/options/units`, { companySlug }, query),
  residentOptions: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<TicketOptionSetDto>(`${ticketsBase}/options/residents`, { companySlug }, query),
  vendorOptions: (companySlug: string, query?: Record<string, unknown>) =>
    portalApi.get<TicketOptionSetDto>(`${ticketsBase}/options/vendors`, { companySlug }, query),
  create: (companySlug: string, body: CreateTicketDto) =>
    portalApi.post<TicketDto>(ticketsBase, { companySlug }, body),
  detail: (companySlug: string, ticketId: string) =>
    portalApi.get<TicketDetailsDto>(ticketBase, { companySlug, ticketId }),
  editForm: (companySlug: string, ticketId: string) =>
    portalApi.get<TicketFormDto>(`${ticketBase}/form`, { companySlug, ticketId }),
  update: (companySlug: string, ticketId: string, body: UpdateTicketDto) =>
    portalApi.put<TicketDto>(ticketBase, { companySlug, ticketId }, body),
  delete: (companySlug: string, ticketId: string, _confirmation?: DeleteConfirmationDto) =>
    portalApi.delete<void>(ticketBase, { companySlug, ticketId }),
  transitionAvailability: (companySlug: string, ticketId: string) =>
    portalApi.get<TicketTransitionAvailabilityDto>(`${ticketBase}/transition-availability`, {
      companySlug,
      ticketId,
    }),
  advanceStatus: (companySlug: string, ticketId: string) =>
    portalApi.post<TicketDto>(`${ticketBase}/advance-status`, { companySlug, ticketId }),
}
