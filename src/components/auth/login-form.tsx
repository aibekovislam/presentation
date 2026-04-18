'use client'

import { useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { normalizeContactInput, validateContact } from '@/lib/auth/utils'
import { useAuth } from '@/shared/providers/auth-provider'

export function LoginForm() {
  const t = useTranslations('auth')
  const { login, isLoading, error, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [formData, setFormData] = useState({
    contact: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.contact.trim()) {
      errors.contact = t('contactRequired')
    } else if (!validateContact(formData.contact)) {
      errors.contact = t('contactInvalid')
    }

    if (!formData.password.trim()) {
      errors.password = t('passwordRequired')
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      await login(normalizeContactInput(formData.contact), formData.password)
      router.push(redirectTo)
    } catch {
      // Error is handled by the auth provider
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('loginTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact" className="block text-sm font-medium mb-1">
            {t('contact')}
          </label>
          <input
            id="contact"
            type="text"
            value={formData.contact}
            onChange={(e) => handleInputChange('contact', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            placeholder="user@example.com or +996555123456"
            autoComplete="username"
          />
          {fieldErrors.contact && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.contact}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {fieldErrors.password && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded"
              disabled={isLoading}
            />
            <span className="text-sm">{t('rememberMe')}</span>
          </label>

          <button
            type="button"
            onClick={() => router.push('/auth/reset-password')}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('forgotPassword')}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('signingIn') : t('signIn')}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <button
            type="button"
            onClick={() => router.push('/auth/register')}
            className="text-blue-600 hover:underline"
          >
            {t('register')}
          </button>
        </p>
      </div>
    </div>
  )
}
