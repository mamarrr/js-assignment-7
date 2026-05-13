import { defineStore, getActivePinia } from 'pinia'
import { authApi } from '@/api/auth'
import { isApiError, type ApiError } from '@/api/errors'
import type { JWTResponse, LoginInfo, LogoutInfo, RegisterInfo, UserDto } from '@/types/api'

const AUTH_STORAGE_KEY = 'app.auth'

export type AuthStatus = 'anonymous' | 'authenticated' | 'checking' | 'pending'

interface PersistedAuthState {
  jwt?: string
  refreshToken?: string
}

interface AuthState {
  jwt?: string
  refreshToken?: string
  user?: UserDto
  roles: string[]
  status: AuthStatus
  lastError?: ApiError
}

const readPersistedAuth = (): PersistedAuthState => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedAuthState
    return {
      jwt: typeof parsed.jwt === 'string' ? parsed.jwt : undefined,
      refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : undefined,
    }
  } catch {
    return {}
  }
}

const persistAuth = (state: PersistedAuthState) => {
  if (!state.jwt && !state.refreshToken) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
}

const extractAccessToken = (response: JWTResponse) => response.jwt ?? response.accessToken ?? response.token

const clearWorkspaceStateIfPresent = () => {
  const pinia = getActivePinia() as { _s?: Map<string, unknown> } | undefined
  const store = pinia?._s?.get('workspace') ?? pinia?._s?.get('workspaces')
  const maybeStore = store as { clear?: () => void; clearSelectedWorkspace?: () => void; $reset?: () => void } | undefined

  if (typeof maybeStore?.clearSelectedWorkspace === 'function') {
    maybeStore.clearSelectedWorkspace()
    return
  }

  if (typeof maybeStore?.clear === 'function') {
    maybeStore.clear()
    return
  }

  maybeStore?.$reset?.()
}

const toApiError = (error: unknown): ApiError | undefined => (isApiError(error) ? error : undefined)

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const persisted = readPersistedAuth()

    return {
      jwt: persisted.jwt,
      refreshToken: persisted.refreshToken,
      user: undefined,
      roles: [],
      status: persisted.jwt ? 'checking' : 'anonymous',
      lastError: undefined,
    }
  },
  getters: {
    isAuthenticated: (state) => Boolean(state.jwt),
    displayName: (state) => {
      const firstName = typeof state.user?.firstName === 'string' ? state.user.firstName : ''
      const lastName = typeof state.user?.lastName === 'string' ? state.user.lastName : ''
      const fullName = typeof state.user?.fullName === 'string' ? state.user.fullName : ''
      return fullName || `${firstName} ${lastName}`.trim() || state.user?.email || 'Signed-in user'
    },
  },
  actions: {
    applyTokens(response: JWTResponse) {
      const jwt = extractAccessToken(response)
      const refreshToken = response.refreshToken

      if (jwt) this.jwt = jwt
      if (refreshToken) this.refreshToken = refreshToken

      persistAuth({ jwt: this.jwt, refreshToken: this.refreshToken })
      this.status = this.jwt ? 'authenticated' : 'anonymous'
    },
    clearLocalState() {
      this.jwt = undefined
      this.refreshToken = undefined
      this.user = undefined
      this.roles = []
      this.status = 'anonymous'
      this.lastError = undefined
      persistAuth({})
      clearWorkspaceStateIfPresent()
    },
    async login(body: LoginInfo) {
      this.status = 'pending'
      this.lastError = undefined

      try {
        const response = await authApi.login(body)
        this.applyTokens(response)
        await this.loadCurrentUser()
      } catch (error) {
        this.status = this.jwt ? 'authenticated' : 'anonymous'
        this.lastError = toApiError(error)
        throw error
      }
    },
    async register(body: RegisterInfo) {
      this.status = 'pending'
      this.lastError = undefined

      try {
        const response = await authApi.register(body)
        this.applyTokens(response)
        await this.loadCurrentUser()
      } catch (error) {
        this.status = this.jwt ? 'authenticated' : 'anonymous'
        this.lastError = toApiError(error)
        throw error
      }
    },
    async refresh() {
      if (!this.refreshToken) {
        this.clearLocalState()
        return false
      }

      try {
        const response = await authApi.refresh({ refreshToken: this.refreshToken, jwt: this.jwt })
        this.applyTokens(response)
        return Boolean(this.jwt)
      } catch {
        this.clearLocalState()
        return false
      }
    },
    async loadCurrentUser() {
      if (!this.jwt) {
        this.clearLocalState()
        return undefined
      }

      this.status = 'checking'

      try {
        const user = await authApi.me()
        this.user = user
        this.roles = user.roles ?? []
        this.status = 'authenticated'
        return user
      } catch (error) {
        this.status = this.jwt ? 'authenticated' : 'anonymous'
        this.lastError = toApiError(error)
        throw error
      }
    },
    async ensureCurrentUser() {
      if (!this.jwt) return false
      if (this.user) return true

      try {
        await this.loadCurrentUser()
        return true
      } catch {
        this.clearLocalState()
        return false
      }
    },
    async logout() {
      const body: LogoutInfo = { refreshToken: this.refreshToken }

      try {
        await authApi.logout(body)
      } finally {
        this.clearLocalState()
      }
    },
  },
})
