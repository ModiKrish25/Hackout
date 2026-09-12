import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, UserRole, AuthTokens, AuthResponse, RegisterPayload } from '../types'
import { api } from '../api/axiosInstance'
import { DEMO_USERS } from '../api/mockData'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
  switchRoleForDemo: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('ecotrace_user')
      return stored ? JSON.parse(stored) : DEMO_USERS.generator
    } catch {
      return DEMO_USERS.generator
    }
  })

  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    try {
      const stored = localStorage.getItem('ecotrace_tokens')
      return stored ? JSON.parse(stored) : { accessToken: 'demo_token', refreshToken: 'demo_refresh' }
    } catch {
      return { accessToken: 'demo_token', refreshToken: 'demo_refresh' }
    }
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ecotrace_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('ecotrace_user')
    }
  }, [user])

  useEffect(() => {
    if (tokens) {
      localStorage.setItem('ecotrace_tokens', JSON.stringify(tokens))
    } else {
      localStorage.removeItem('ecotrace_tokens')
    }
  }, [tokens])

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    setIsLoading(true)
    try {
      const res = (await api.post('/auth/login', credentials)) as unknown as AuthResponse
      const authUser = res.user
      const authTokens = res.tokens

      setUser(authUser)
      setTokens(authTokens)
      return authUser
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true)
    try {
      const res = (await api.post('/auth/register', payload)) as unknown as AuthResponse
      const authUser = res.user
      const authTokens = res.tokens

      setUser(authUser)
      setTokens(authTokens)
      return authUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('ecotrace_user')
    localStorage.removeItem('ecotrace_tokens')
  }

  const switchRoleForDemo = (newRole: UserRole) => {
    const demoUser = DEMO_USERS[newRole] || DEMO_USERS.generator
    const demoTokens: AuthTokens = {
      accessToken: `demo_token_${newRole}_${Date.now()}`,
      refreshToken: `demo_refresh_${newRole}_${Date.now()}`,
    }
    setUser(demoUser)
    setTokens(demoTokens)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        role: user?.role || null,
        isAuthenticated: !!user && !!tokens,
        isLoading,
        login,
        register,
        logout,
        switchRoleForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
