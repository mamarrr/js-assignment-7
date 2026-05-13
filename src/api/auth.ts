import { apiRequest } from './client'
import type { JWTResponse, LoginInfo, LogoutInfo, RegisterInfo, TokenRefreshInfo, UserDto } from '@/types/api'

export const authApi = {
  login: (body: LoginInfo) => apiRequest<JWTResponse>('/api/v1/auth/login', { method: 'POST', body, auth: false }),
  register: (body: RegisterInfo) =>
    apiRequest<JWTResponse>('/api/v1/auth/register', { method: 'POST', body, auth: false }),
  refresh: (body: TokenRefreshInfo) =>
    apiRequest<JWTResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body,
      auth: false,
      retryOnUnauthorized: false,
    }),
  logout: (body: LogoutInfo) =>
    apiRequest<void>('/api/v1/auth/logout', { method: 'POST', body, retryOnUnauthorized: false }),
  me: () => apiRequest<UserDto>('/api/v1/auth/me'),
}

