import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, UserRole, AuthTokens, RegisterPayload } from '../types'
import { authService, userService, type LoginCredentials } from '../services'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
  switchRoleForDemo: (role: UserRole) => void
  refreshProfile: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser())
  const [tokens, setTokens] = useState<AuthTokens | null>(() => authService.getStoredTokens())
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Sync to localStorage
  useEffect(() => {
    if (user && tokens) {
      authService.setStoredSession(user, tokens)
    } else if (!user && !tokens) {
      authService.clearStoredSession()
    }
  }, [user, tokens])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true)
    try {
      const session = await authService.login(credentials)
      setUser(session.user)
      setTokens(session.tokens)
      return session.user
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true)
    try {
      const session = await authService.register(payload)
      setUser(session.user)
      setTokens(session.tokens)
      return session.user
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async (): Promise<User | null> => {
    try {
      const liveUser = await userService.getMe()
      setUser(liveUser)
      return liveUser
    } catch {
      return user
    }
  }

  const logout = () => {
    authService.clearStoredSession()
    setUser(null)
    setTokens(null)
  }

  const switchRoleForDemo = (newRole: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole }
      setUser(updatedUser)
    }
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
        refreshProfile,
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
