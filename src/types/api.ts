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
  fullName?: string
  roles?: string[]
}

export interface WorkspaceOptionPermissionsDto extends ApiRecord {
  canManageCompanyUsers?: boolean
}

export interface WorkspaceOptionDto extends ApiRecord {
  id?: string
  workspaceId?: string
  companySlug?: string
  slug?: string
  displayName?: string
  name?: string
  type?: string
  permissions?: WorkspaceOptionPermissionsDto
}

export interface WorkspaceCatalogDto extends ApiRecord {
  workspaces?: WorkspaceOptionDto[]
  options?: WorkspaceOptionDto[]
  defaultContext?: ApiRecord
}

export interface SelectWorkspaceDto extends ApiRecord {
  workspaceId?: string
  companySlug?: string
}

export interface WorkspaceRedirectDto extends ApiRecord {
  destination?: string
  redirectUrl?: string
  path?: string
  companySlug?: string
}

export interface OnboardingStatusDto extends ApiRecord {
  hasUsableWorkspace?: boolean
  requiresOnboarding?: boolean
  canCreateManagementCompany?: boolean
  canJoinManagementCompany?: boolean
}

export interface DeleteConfirmationDto {
  deleteConfirmation?: string
  confirmation?: string
}

export type LookupOptionDto = ApiRecord

export type ManagementDashboardDto = ApiRecord
export type CustomerListItemDto = ApiRecord
export type CustomerProfileDto = ApiRecord
export type CustomerRequestDto = ApiRecord
export type PropertyListItemDto = ApiRecord
export type PropertyProfileDto = ApiRecord
export type UnitListItemDto = ApiRecord
export type UnitProfileDto = ApiRecord
export type ResidentListItemDto = ApiRecord
export type ResidentProfileDto = ApiRecord
export type ManagementTicketsDto = ApiRecord
export type TicketDetailsDto = ApiRecord
export type TicketDto = ApiRecord
export type ScheduledWorkListDto = ApiRecord
export type ScheduledWorkDetailsDto = ApiRecord
export type WorkLogListDto = ApiRecord
export type VendorListItemDto = ApiRecord
export type VendorProfileDto = ApiRecord
export type CompanyUsersPageDto = ApiRecord

