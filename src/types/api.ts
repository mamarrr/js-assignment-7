export type ApiRecord = Record<string, unknown>

export interface JWTResponse {
  jwt?: string
  token?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
}

export interface LoginInfo {
  email: string
  password: string
}

export interface RegisterInfo extends LoginInfo {
  firstName?: string
  lastName?: string
  confirmPassword?: string
}

export interface TokenRefreshInfo {
  refreshToken?: string
  jwt?: string
  token?: string
}

export interface LogoutInfo {
  refreshToken?: string
}

export interface UserDto extends ApiRecord {
  id?: string
  email?: string
  userName?: string
  firstName?: string
  lastName?: string
  fullName?: string
  roles?: string[]
}

export interface WorkspaceOptionPermissionsDto extends ApiRecord {
  canManageCompanyUsers?: boolean
}

export interface WorkspaceOptionDto extends ApiRecord {
  id?: string
  workspaceId?: string
  contextType?: string
  contextId?: string
  companySlug?: string
  managementCompanySlug?: string
  slug?: string
  displayName?: string
  name?: string
  type?: string
  path?: string
  isDefault?: boolean
  permissions?: WorkspaceOptionPermissionsDto
}

export interface WorkspaceCatalogDto extends ApiRecord {
  managementCompanies?: WorkspaceOptionDto[]
  customers?: WorkspaceOptionDto[]
  residents?: WorkspaceOptionDto[]
  workspaces?: WorkspaceOptionDto[]
  options?: WorkspaceOptionDto[]
  defaultContext?: WorkspaceOptionDto
}

export interface SelectWorkspaceDto extends ApiRecord {
  contextType?: string
  contextId?: string
}

export interface WorkspaceRedirectDto extends ApiRecord {
  destination?: string
  redirectUrl?: string
  path?: string
  companySlug?: string
  customerSlug?: string
  residentIdCode?: string
}

export interface OnboardingStatusDto extends ApiRecord {
  hasWorkspaceContext?: boolean
  createManagementCompany?: boolean
  joinManagementCompany?: boolean
  defaultPath?: string
  hasUsableWorkspace?: boolean
  requiresOnboarding?: boolean
  canCreateManagementCompany?: boolean
  canJoinManagementCompany?: boolean
}

export interface CreateManagementCompanyDto extends ApiRecord {
  name?: string
  registryCode?: string
  vatNumber?: string
  email?: string
  phone?: string
  address?: string
}

export interface CreatedManagementCompanyDto extends ApiRecord {
  id?: string
  slug?: string
  name?: string
  path?: string
}

export interface JoinManagementCompanyRequestDto extends ApiRecord {
  registryCode?: string
  requestedRoleId?: string
  message?: string
}

export interface JoinRequestResultDto extends ApiRecord {
  success?: boolean
  requestId?: string
  message?: string
}

export interface DeleteConfirmationDto extends ApiRecord {
  deleteConfirmation?: string
  confirmation?: string
}

export type LookupOptionDto = ApiRecord

export type ManagementDashboardDto = ApiRecord
export type ManagementCompanyProfileDto = ApiRecord
export type UpdateManagementCompanyDto = ApiRecord
export type CustomerDashboardDto = ApiRecord
export type CustomerListItemDto = ApiRecord
export type CustomerProfileDto = ApiRecord
export type CustomerRequestDto = ApiRecord
export type PropertyDashboardDto = ApiRecord
export type PropertyListItemDto = ApiRecord
export type PropertyProfileDto = ApiRecord
export type CreatePropertyDto = ApiRecord
export type UpdatePropertyProfileDto = ApiRecord
export type UnitDashboardDto = ApiRecord
export type UnitListItemDto = ApiRecord
export type UnitProfileDto = ApiRecord
export type UnitRequestDto = ApiRecord
export type ResidentDashboardDto = ApiRecord
export type ResidentListItemDto = ApiRecord
export type ResidentProfileDto = ApiRecord
export type ResidentRequestDto = ApiRecord
export type TicketDto = ApiRecord
export type CompanyUsersPageDto = ApiRecord
export type AddCompanyUserDto = ApiRecord
export type UpdateCompanyUserDto = ApiRecord
export type CompanyUserEditDto = ApiRecord
export type CompanyUserRoleOptionDto = ApiRecord
export type OwnershipTransferCandidateDto = ApiRecord
export type TransferOwnershipDto = ApiRecord
export type OwnershipTransferResultDto = ApiRecord
export interface LeasePropertySearchItemDto extends ApiRecord {
  propertyId?: string
  customerId?: string
  propertySlug?: string
  propertyName?: string
  customerSlug?: string
  customerName?: string
  addressLine?: string
  city?: string
  postalCode?: string
}

export interface LeasePropertySearchResultDto extends ApiRecord {
  properties?: LeasePropertySearchItemDto[]
}

export interface LeaseUnitOptionDto extends ApiRecord {
  unitId?: string
  unitSlug?: string
  unitNr?: string
  floorNr?: number | null
}

export interface LeaseUnitOptionsDto extends ApiRecord {
  units?: LeaseUnitOptionDto[]
}

export interface LeaseResidentSearchItemDto extends ApiRecord {
  residentId?: string
  fullName?: string
  idCode?: string
}

export interface LeaseResidentSearchResultDto extends ApiRecord {
  residents?: LeaseResidentSearchItemDto[]
}

export interface TicketOptionSetDto extends ApiRecord {
  statuses?: ApiRecord[]
  priorities?: ApiRecord[]
  categories?: ApiRecord[]
  customers?: ApiRecord[]
  properties?: ApiRecord[]
  units?: ApiRecord[]
  residents?: ApiRecord[]
  vendors?: ApiRecord[]
}

export interface TicketFilterDto extends ApiRecord {
  search?: string
  statusId?: string
  priorityId?: string
  categoryId?: string
  customerId?: string
  propertyId?: string
  unitId?: string
  residentId?: string
  vendorId?: string
  dueFrom?: string
  dueTo?: string
}

export interface TicketListItemDto extends ApiRecord {
  ticketId?: string
  ticketNr?: string
  title?: string
  statusCode?: string
  statusLabel?: string
  priorityLabel?: string
  categoryLabel?: string
  customerName?: string
  customerSlug?: string
  propertyName?: string
  propertySlug?: string
  unitNr?: string
  unitSlug?: string
  residentName?: string
  residentIdCode?: string
  vendorName?: string
  dueAt?: string
  createdAt?: string
}

export interface ContextTicketsDto extends ApiRecord {
  companyName?: string
  contextName?: string
  tickets?: TicketListItemDto[]
  filter?: TicketFilterDto
  options?: TicketOptionSetDto
  customerSlug?: string
  customerName?: string
  propertySlug?: string
  propertyName?: string
  unitSlug?: string
  unitName?: string
  residentIdCode?: string
  residentName?: string
}

export interface ManagementTicketsDto extends ContextTicketsDto {}

export interface TicketScheduledWorkSummaryDto extends ApiRecord {
  scheduledWorkId?: string
  vendorName?: string
  workStatusLabel?: string
  scheduledStart?: string
  scheduledEnd?: string
}

export interface TicketDetailsDto extends TicketListItemDto {
  companySlug?: string
  companyName?: string
  description?: string
  closedAt?: string
  nextStatusCode?: string
  canAdvanceStatus?: boolean
  nextStatusLabel?: string
  transitionBlockingReasons?: string[]
  scheduledWork?: TicketScheduledWorkSummaryDto[]
}

export interface TicketTransitionAvailabilityDto extends ApiRecord {
  ticketId?: string
  currentStatusCode?: string
  nextStatusCode?: string
  canAdvance?: boolean
  nextStatusLabel?: string
  blockingReasons?: string[]
}

export interface TicketFormDto extends ApiRecord {
  companyName?: string
  ticketId?: string
  ticketNr?: string
  title?: string
  description?: string
  ticketCategoryId?: string
  ticketStatusId?: string
  ticketPriorityId?: string
  customerId?: string
  propertyId?: string
  unitId?: string
  residentId?: string
  vendorId?: string
  dueAt?: string
  options?: TicketOptionSetDto
}

export interface CreateTicketDto extends ApiRecord {
  ticketNr?: string | null
  title?: string | null
  description?: string | null
  ticketCategoryId?: string
  ticketPriorityId?: string
  customerId?: string | null
  propertyId?: string | null
  unitId?: string | null
  residentId?: string | null
  vendorId?: string | null
  dueAt?: string | null
}

export interface UpdateTicketDto extends CreateTicketDto {
  ticketStatusId?: string
}

export interface ScheduledWorkListItemDto extends ApiRecord {
  scheduledWorkId?: string
  vendorId?: string
  vendorName?: string
  workStatusId?: string
  workStatusCode?: string
  workStatusLabel?: string
  scheduledStart?: string
  scheduledEnd?: string
  realStart?: string
  realEnd?: string
  notes?: string
  createdAt?: string
  workLogCount?: number
  path?: string
  workLogsPath?: string
}

export interface ScheduledWorkListDto extends ApiRecord {
  ticketNr?: string
  ticketTitle?: string
  items?: ScheduledWorkListItemDto[]
}

export interface ScheduledWorkDetailsDto extends ScheduledWorkListItemDto {
  companySlug?: string
  companyName?: string
  ticketId?: string
  ticketNr?: string
  ticketTitle?: string
  listPath?: string
  editFormPath?: string
  notes?: string
}

export interface ScheduledWorkFormDto extends ApiRecord {
  companySlug?: string
  companyName?: string
  ticketId?: string
  ticketNr?: string
  ticketTitle?: string
  scheduledWorkId?: string
  vendorId?: string
  workStatusId?: string
  scheduledStart?: string
  scheduledEnd?: string
  realStart?: string
  realEnd?: string
  notes?: string
  vendors?: ApiRecord[]
  workStatuses?: ApiRecord[]
}

export interface ScheduledWorkRequestDto extends ApiRecord {
  vendorId?: string
  workStatusId?: string
  scheduledStart: string
  scheduledEnd?: string | null
  realStart?: string | null
  realEnd?: string | null
  notes?: string | null
}

export interface ScheduledWorkActionDto extends ApiRecord {
  actionAt: string
}

export interface WorkLogListItemDto extends ApiRecord {
  workLogId?: string
  appUserId?: string
  workStart?: string
  workEnd?: string
  hours?: number
  materialCost?: number
  laborCost?: number
  appUserName?: string
  description?: string
  createdAt?: string
  path?: string
}

export interface WorkLogTotalsDto extends ApiRecord {
  count?: number
  hours?: number
  materialCost?: number
  laborCost?: number
  totalCost?: number
}

export interface WorkLogListDto extends ApiRecord {
  companySlug?: string
  companyName?: string
  ticketId?: string
  ticketNr?: string
  ticketTitle?: string
  scheduledWorkId?: string
  vendorName?: string
  workStatusLabel?: string
  canViewCosts?: boolean
  totals?: WorkLogTotalsDto
  items?: WorkLogListItemDto[]
  path?: string
}

export interface WorkLogFormDto extends ApiRecord {
  companySlug?: string
  companyName?: string
  ticketId?: string
  ticketNr?: string
  ticketTitle?: string
  scheduledWorkId?: string
  workLogId?: string
  vendorName?: string
  canViewCosts?: boolean
  workStart?: string
  workEnd?: string
  hours?: number
  materialCost?: number
  laborCost?: number
  description?: string
  path?: string
}

export interface WorkLogDeleteModelDto extends ApiRecord {
  companySlug?: string
  companyName?: string
  ticketId?: string
  ticketNr?: string
  scheduledWorkId?: string
  workLogId?: string
  vendorName?: string
  description?: string
  path?: string
}

export interface WorkLogRequestDto extends ApiRecord {
  workStart?: string | null
  workEnd?: string | null
  hours?: number | null
  materialCost?: number | null
  laborCost?: number | null
  description?: string | null
}

export interface LeaseDto extends ApiRecord {
  leaseId?: string
  residentId?: string
  residentIdCode?: string
  residentFullName?: string
  residentName?: string
  propertyId?: string
  propertyName?: string
  unitId?: string
  unitName?: string
  unitNr?: string
  unitSlug?: string
  leaseRoleId?: string
  leaseRoleCode?: string
  leaseRoleLabel?: string
  startDate?: string
  endDate?: string
  notes?: string
  path?: string
}

export interface LeaseRoleOptionsDto extends ApiRecord {
  roles?: LeaseRoleOptionDto[]
  leaseRoles?: LeaseRoleOptionDto[]
}

export interface LeaseRoleOptionDto extends ApiRecord {
  leaseRoleId?: string
  id?: string
  code?: string
  label?: string
  name?: string
}

export interface ContactAssignmentDto extends ApiRecord {
  contactId?: string
  validFrom?: string
  validTo?: string | null
  confirmed?: boolean
  isPrimary?: boolean
}

export interface NewContactAssignmentDto extends ContactAssignmentDto {
  contactTypeId?: string
  contactValue?: string
  contactNotes?: string | null
}

export interface ResidentContactItemDto extends ContactAssignmentDto {
  residentContactId?: string
  contactValue?: string
  contactTypeLabel?: string
}

export interface ResidentContactListDto extends ApiRecord {
  residentName?: string
  contacts?: ResidentContactItemDto[]
  existingContactOptions?: ApiRecord[]
  contactTypeOptions?: ApiRecord[]
}

export interface VendorContactAssignmentDto extends ContactAssignmentDto {
  fullName?: string | null
  roleTitle?: string | null
}

export interface CreateAndAttachVendorContactDto extends VendorContactAssignmentDto {
  contactTypeId?: string
  contactValue?: string | null
  contactNotes?: string | null
}

export interface VendorContactItemDto extends VendorContactAssignmentDto {
  vendorContactId?: string
  vendorId?: string
  contactTypeId?: string
  contactTypeCode?: string
  contactValue?: string
  contactTypeLabel?: string
  contactNotes?: string
  createdAt?: string
  path?: string
}

export interface VendorContactListDto extends ApiRecord {
  companySlug?: string
  companyName?: string
  vendorId?: string
  vendorName?: string
  path?: string
  contacts?: VendorContactItemDto[]
  existingContactOptions?: ApiRecord[]
  contactTypeOptions?: ApiRecord[]
}

export interface VendorListItemDto extends ApiRecord {
  vendorId?: string
  managementCompanyId?: string
  companySlug?: string
  companyName?: string
  name?: string
  registryCode?: string
  createdAt?: string
  activeCategoryCount?: number
  assignedTicketCount?: number
  contactCount?: number
  path?: string
}

export interface VendorProfileDto extends Omit<VendorListItemDto, 'vendorId'> {
  id?: string
  vendorId?: string
  notes?: string
  scheduledWorkCount?: number
}

export interface VendorRequestDto extends ApiRecord {
  name?: string | null
  registryCode?: string | null
  notes?: string | null
}

export interface VendorDeleteConfirmationDto extends ApiRecord {
  confirmationRegistryCode?: string
}

export interface AssignVendorCategoryDto extends ApiRecord {
  ticketCategoryId?: string
  notes?: string | null
}

export interface UpdateVendorCategoryDto extends ApiRecord {
  notes?: string | null
}

export interface VendorCategoryAssignmentDto extends ApiRecord {
  assignmentId?: string
  vendorId?: string
  ticketCategoryId?: string
  categoryCode?: string
  categoryLabel?: string
  ticketCategoryLabel?: string
  notes?: string
  createdAt?: string
  path?: string
}

export interface VendorCategoryAssignmentListDto extends ApiRecord {
  companySlug?: string
  companyName?: string
  vendorId?: string
  vendorName?: string
  path?: string
  assignments?: VendorCategoryAssignmentDto[]
  availableCategories?: ApiRecord[]
}
