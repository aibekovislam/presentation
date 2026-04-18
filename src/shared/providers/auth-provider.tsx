'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

import { usePathname, useRouter } from '@/i18n/navigation'
import { authAPI } from '@/lib/auth/api'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setAuthTokens,
} from '@/lib/auth/storage'
import { AuthContextType, AuthUser, RegisterRequest } from '@/lib/auth/types'
import { validatePhone } from '@/lib/auth/utils'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = user !== null

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const restoreSession = useCallback(async () => {
    const accessToken = getAccessToken()
    const hasValidAccessToken = accessToken ? !isTokenExpired(accessToken) : false
    const refreshToken = getRefreshToken()

    if (!hasValidAccessToken && !refreshToken) {
      setIsLoading(false)

      return
    }

    try {
      setIsLoading(true)
      setError(null)

      if (!hasValidAccessToken && refreshToken) {
        const refreshResponse = await authAPI.refresh(refreshToken)

        setAuthTokens({
          accessToken: refreshResponse.accessToken,
          refreshToken: refreshResponse.refreshToken,
        })
      }

      const userData = await authAPI.getMe()

      setUser(userData)
    } catch {
      // Session restoration failed, clear everything
      clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (contact: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authAPI.login({ contact, password })

      setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      })
      setUser(await authAPI.getMe())

      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authAPI.register(data)

      if (response.accessToken && response.refreshToken) {
        setAuthTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        })
      } else {
        const loginResponse = await authAPI.login({
          contact: response.contact ?? data.contact,
          password: data.password,
        })

        setAuthTokens({
          accessToken: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
        })
      }

      setUser(await authAPI.getMe())

      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const refreshToken = getRefreshToken()

      if (refreshToken) {
        await authAPI.logout({ refreshToken })
      }

      clearTokens()
      setUser(null)
      router.push('/auth/login')
    } catch {
      // Even if logout fails, clear local state
      clearTokens()
      setUser(null)
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const refresh = useCallback(async () => {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      setError(null)
      const response = await authAPI.refresh(refreshToken)

      setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
      clearTokens()
      setUser(null)
      throw err
    }
  }, [])

  const requestVerification = useCallback(async (contact: string) => {
    try {
      setError(null)

      // Temporary: for phone numbers, directly confirm without code
      if (validatePhone(contact)) {
        await authAPI.confirmPhone(contact)

        if (getAccessToken() || getRefreshToken()) {
          try {
            setUser(await authAPI.getMe())
          } catch {
            // Keep verification success even if profile refresh fails
          }
          router.push('/')

          return
        }

        router.push('/auth/login')

        return
      }

      await authAPI.requestVerification({ contact })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification request failed')
      throw err
    }
  }, [router])

  const confirmVerification = useCallback(async (contact: string, code: string) => {
    try {
      setError(null)
      await authAPI.confirmVerification({ contact, code })

      if (getAccessToken() || getRefreshToken()) {
        try {
          setUser(await authAPI.getMe())
        } catch {
          // Keep verification success even if profile refresh fails
        }
        router.push('/')

        return
      }

      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      throw err
    }
  }, [router])

  const addPhone = useCallback(async (phone: string) => {
    try {
      setError(null)
      await authAPI.addPhone(phone)

      if (getAccessToken() || getRefreshToken()) {
        try {
          setUser(await authAPI.getMe())
        } catch {
          // Keep success even if profile refresh fails
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add phone')
      throw err
    }
  }, [])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setError(null)
      await authAPI.changePassword({ currentPassword, newPassword })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed')
      throw err
    }
  }, [])

  const requestPasswordReset = useCallback(async (contact: string) => {
    try {
      setError(null)
      await authAPI.requestPasswordReset({ contact })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset request failed')
      throw err
    }
  }, [])

  const confirmPasswordReset = useCallback(async (contact: string, code: string, newPassword: string) => {
    try {
      setError(null)
      await authAPI.confirmPasswordReset({ contact, code, newPassword })
      // After reset, redirect to login
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed')
      throw err
    }
  }, [router])

  // Restore session on mount (skip on auth pages to avoid redundant refresh calls)
  useEffect(() => {
    if (pathname?.includes('/auth/')) {
      setIsLoading(false)

      return
    }
    restoreSession()
  }, [pathname, restoreSession])

  useEffect(() => {
    const handleAuthLogout = () => {
      clearTokens()
      setUser(null)
    }

    window.addEventListener('auth:logout', handleAuthLogout)

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refresh,
    requestVerification,
    confirmVerification,
    addPhone,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
