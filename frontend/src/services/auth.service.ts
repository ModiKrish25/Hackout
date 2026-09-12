import { api } from '../api/axiosInstance'
import type { User, AuthTokens, RegisterPayload } from '../types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSessionResponse {
  user: User
  token: string
  tokens: AuthTokens
}

export const authService = {
  /**
   * Authenticate an existing user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthSessionResponse> {
    const res = (await api.post('/auth/login', credentials)) as any
    const user: User = res.user
    const token: string = res.token || res.accessToken || res.tokens?.accessToken || ''

    const tokens: AuthTokens = {
      accessToken: token,
      refreshToken: token,
    }

    this.setStoredSession(user, tokens)
    return { user, token, tokens }
  },

  /**
   * Register a new user into the platform
   */
  async register(payload: RegisterPayload): Promise<AuthSessionResponse> {
    const backendPayload = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'generator',
      phone: payload.phone || undefined,
      locationLat: payload.locationLat ?? payload.location_lat ?? 12.9716,
      locationLng: payload.locationLng ?? payload.location_lng ?? 77.5946,
    }

    const res = (await api.post('/auth/register', backendPayload)) as any
    const user: User = res.user
    const token: string = res.token || res.accessToken || res.tokens?.accessToken || ''

    const tokens: AuthTokens = {
      accessToken: token,
      refreshToken: token,
    }

    this.setStoredSession(user, tokens)
    return { user, token, tokens }
  },

  /**
   * Get cached user from localStorage
   */
  getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('ecotrace_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  /**
   * Get cached auth tokens from localStorage
   */
  getStoredTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem('ecotrace_tokens')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  /**
   * Save session to localStorage
   */
  setStoredSession(user: User, tokens: AuthTokens): void {
    localStorage.setItem('ecotrace_user', JSON.stringify(user))
    localStorage.setItem('ecotrace_tokens', JSON.stringify(tokens))
  },

  /**
   * Clear session on logout
   */
  clearStoredSession(): void {
    localStorage.removeItem('ecotrace_user')
    localStorage.removeItem('ecotrace_tokens')
  },
}

export default authService
