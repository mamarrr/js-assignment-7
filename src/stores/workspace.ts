import { defineStore, getActivePinia } from 'pinia'
import { onboardingApi } from '@/api/onboarding'
import { workspacesApi } from '@/api/workspaces'
import { isApiError, type ApiError } from '@/api/errors'
import type {
  OnboardingStatusDto,
  WorkspaceCatalogDto,
  WorkspaceOptionDto,
  WorkspaceOptionPermissionsDto,
  WorkspaceRedirectDto,
} from '@/types/api'

const WORKSPACE_STORAGE_KEY = 'app.workspace'

interface PersistedWorkspaceState {
  selectedWorkspace?: WorkspaceOptionDto
  defaultRedirect?: WorkspaceRedirectDto
}

interface WorkspaceState {
  catalog?: WorkspaceCatalogDto
  onboardingStatus?: OnboardingStatusDto
  selectedWorkspace?: WorkspaceOptionDto
  defaultRedirect?: WorkspaceRedirectDto
  loading: boolean
  lastError?: ApiError
  startupLoaded: boolean
}

const readPersistedWorkspace = (): PersistedWorkspaceState => {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedWorkspaceState
    return {
      selectedWorkspace: parsed.selectedWorkspace,
      defaultRedirect: parsed.defaultRedirect,
    }
  } catch {
    return {}
  }
}

const persistWorkspace = (state: PersistedWorkspaceState) => {
  if (!state.selectedWorkspace && !state.defaultRedirect) {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state))
}

const toApiError = (error: unknown): ApiError | undefined => (isApiError(error) ? error : undefined)

const firstString = (...values: unknown[]) => values.find((value): value is string => typeof value === 'string' && value.length > 0)

const normalizeAppPath = (path?: string) => {
  if (!path) return undefined
  const normalizedPath = path.trim()

  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    try {
      const url = new URL(normalizedPath)
      return normalizeAppPath(`${url.pathname}${url.search}${url.hash}`)
    } catch {
      return undefined
    }
  }

  const appPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  const lowerPath = appPath.toLowerCase()

  if (lowerPath.includes('/admin') || lowerPath.includes('/systemadmin')) return undefined
  if (
    lowerPath === '/workspaces' ||
    lowerPath.startsWith('/auth/') ||
    lowerPath.startsWith('/onboarding') ||
    lowerPath.startsWith('/companies/')
  ) {
    return appPath
  }

  return undefined
}

const clearTenantScopedStores = () => {
  const pinia = getActivePinia() as { _s?: Map<string, unknown> } | undefined
  pinia?._s?.forEach((store, id) => {
    if (['auth', 'workspace', 'notifications'].includes(id)) return
    const maybeStore = store as { clearTenantState?: () => void; clear?: () => void; $reset?: () => void }

    if (typeof maybeStore.clearTenantState === 'function') {
      maybeStore.clearTenantState()
    } else if (typeof maybeStore.clear === 'function') {
      maybeStore.clear()
    } else {
      maybeStore.$reset?.()
    }
  })
}

export const workspaceOptionPath = (option?: WorkspaceOptionDto) => {
  const explicitPath = normalizeAppPath(option?.path)
  if (explicitPath) return explicitPath

  const companySlug = firstString(option?.managementCompanySlug, option?.companySlug)
  if (companySlug) return `/companies/${companySlug}`

  return undefined
}

export const workspaceCompanySlug = (option?: WorkspaceOptionDto) =>
  firstString(option?.managementCompanySlug, option?.companySlug)

export const workspaceRedirectPath = (redirect?: WorkspaceRedirectDto) => {
  const explicitPath = normalizeAppPath(redirect?.path ?? redirect?.destination ?? redirect?.redirectUrl)
  if (explicitPath) return explicitPath

  if (redirect?.companySlug) return `/companies/${redirect.companySlug}`

  return undefined
}

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => {
    const persisted = readPersistedWorkspace()

    return {
      catalog: undefined,
      onboardingStatus: undefined,
      selectedWorkspace: persisted.selectedWorkspace,
      defaultRedirect: persisted.defaultRedirect,
      loading: false,
      lastError: undefined,
      startupLoaded: false,
    }
  },
  getters: {
    managementCompanies: (state) => state.catalog?.managementCompanies ?? [],
    customers: (state) => state.catalog?.customers ?? [],
    residents: (state) => state.catalog?.residents ?? [],
    workspaceOptions(): WorkspaceOptionDto[] {
      return [
        ...this.managementCompanies,
        ...this.customers,
        ...this.residents,
        ...(this.catalog?.workspaces ?? []),
        ...(this.catalog?.options ?? []),
      ]
    },
    hasUsableWorkspace(): boolean {
      return Boolean(
        this.onboardingStatus?.hasWorkspaceContext ??
          this.onboardingStatus?.hasUsableWorkspace ??
          this.workspaceOptions.length > 0,
      )
    },
    canCreateManagementCompany: (state) =>
      Boolean(state.onboardingStatus?.createManagementCompany ?? state.onboardingStatus?.canCreateManagementCompany),
    canJoinManagementCompany: (state) =>
      Boolean(state.onboardingStatus?.joinManagementCompany ?? state.onboardingStatus?.canJoinManagementCompany),
    permissions: (state): WorkspaceOptionPermissionsDto => state.selectedWorkspace?.permissions ?? {},
    selectedCompanySlug: (state) =>
      firstString(state.selectedWorkspace?.managementCompanySlug, state.selectedWorkspace?.companySlug),
    workspaceForCompany(): (companySlug?: string) => WorkspaceOptionDto | undefined {
      return (companySlug?: string) =>
        this.workspaceOptions.find((option) => workspaceCompanySlug(option) === companySlug)
    },
    permissionsForCompany(): (companySlug?: string) => WorkspaceOptionPermissionsDto {
      return (companySlug?: string) => this.workspaceForCompany(companySlug)?.permissions ?? this.permissions
    },
    defaultPath(): string | undefined {
      return (
        normalizeAppPath(this.onboardingStatus?.defaultPath) ??
        workspaceRedirectPath(this.defaultRedirect) ??
        workspaceOptionPath(this.catalog?.defaultContext)
      )
    },
  },
  actions: {
    persist() {
      persistWorkspace({
        selectedWorkspace: this.selectedWorkspace,
        defaultRedirect: this.defaultRedirect,
      })
    },
    clearSelectedWorkspace() {
      this.selectedWorkspace = undefined
      this.defaultRedirect = undefined
      this.persist()
      clearTenantScopedStores()
    },
    clear() {
      this.catalog = undefined
      this.onboardingStatus = undefined
      this.selectedWorkspace = undefined
      this.defaultRedirect = undefined
      this.loading = false
      this.lastError = undefined
      this.startupLoaded = false
      persistWorkspace({})
      clearTenantScopedStores()
    },
    async loadOnboardingStatus() {
      this.onboardingStatus = await onboardingApi.status()
      return this.onboardingStatus
    },
    async loadCatalog() {
      this.catalog = await workspacesApi.catalog()
      return this.catalog
    },
    async loadDefaultRedirect() {
      try {
        this.defaultRedirect = await workspacesApi.defaultRedirect()
      } catch (error) {
        if (isApiError(error) && error.status === 204) this.defaultRedirect = undefined
        else throw error
      } finally {
        this.persist()
      }

      return this.defaultRedirect
    },
    async loadStartup() {
      this.loading = true
      this.lastError = undefined

      try {
        await Promise.all([this.loadOnboardingStatus(), this.loadCatalog()])
        if (this.hasUsableWorkspace) {
          await this.loadDefaultRedirect()
        } else {
          this.defaultRedirect = undefined
          this.persist()
        }
        this.startupLoaded = true
      } catch (error) {
        this.lastError = toApiError(error)
        this.startupLoaded = false
        throw error
      } finally {
        this.loading = false
      }
    },
    async ensureStartupLoaded() {
      if (this.startupLoaded) return true

      try {
        await this.loadStartup()
        return true
      } catch {
        return false
      }
    },
    async selectWorkspace(option: WorkspaceOptionDto) {
      const contextType = firstString(option.contextType, option.type)
      const contextId = firstString(option.id, option.workspaceId, option.contextId)

      if (!contextType || !contextId) {
        throw new Error('Workspace option is missing selection data.')
      }

      this.loading = true
      this.lastError = undefined

      try {
        const redirect = await workspacesApi.select({
          contextType,
          contextId,
        })
        clearTenantScopedStores()
        this.selectedWorkspace = option
        this.defaultRedirect = redirect
        this.persist()
        return redirect
      } catch (error) {
        this.lastError = toApiError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
