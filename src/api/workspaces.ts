import { apiRequest } from './client'
import type { SelectWorkspaceDto, WorkspaceCatalogDto, WorkspaceRedirectDto } from '@/types/api'

export const workspacesApi = {
  catalog: () => apiRequest<WorkspaceCatalogDto>('/api/v1/workspaces'),
  select: (body: SelectWorkspaceDto) =>
    apiRequest<WorkspaceRedirectDto>('/api/v1/workspaces/select', { method: 'POST', body }),
  defaultRedirect: () => apiRequest<WorkspaceRedirectDto>('/api/v1/workspaces/default-redirect'),
}

