'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { RegisterRequest } from '@/lib/auth/types'
import {
  getPasswordStrength,
  normalizeContactInput,
  validateContact,
  validatePassword,
} from '@/lib/auth/utils'
import { useAuth } from '@/shared/providers/auth-provider'

export function RegisterForm() {
  const t = useTranslations('auth')
  const { register, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState<RegisterRequest>({
    contact: '',
    password: '',
    termsAccepted: false,
    marketingOptIn: false,
    firstName: '',
    lastName: '',
  })

  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      errors.firstName = t('firstNameRequired')
    }

    if (!formData.lastName.trim()) {
      errors.lastName = t('lastNameRequired')
    }

    if (!formData.contact.trim()) {
      errors.contact = t('contactRequired')
    } else if (!validateContact(formData.contact)) {
      errors.contact = t('contactInvalid')
    }

    const passwordValidation = validatePassword(formData.password)

    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]
    }

    if (formData.password !== confirmPassword) {
      errors.confirmPassword = t('passwordMismatch')
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = t('termsRequired')
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
      await register({
        ...formData,
        contact: normalizeContactInput(formData.contact),
      })
    } catch {
      // Error is handled by the auth provider
    }
  }

  const handleInputChange = (field: keyof RegisterRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('registerTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('registerSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              {t('firstName')}
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {fieldErrors.firstName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              {t('lastName')}
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {fieldErrors.lastName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

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
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength < 40 ? 'bg-red-500' :
                        passwordStrength < 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {passwordStrength < 40 ? t('weak') :
                    passwordStrength < 80 ? t('medium') : t('strong')}
                </span>
              </div>
            </div>
          )}
          {fieldErrors.password && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {fieldErrors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              className="rounded"
              disabled={isLoading}
            />
            <span className="text-sm">
              {t('acceptTerms')}{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                {t('termsOfService')}
              </Link>
            </span>
          </label>
          {fieldErrors.termsAccepted && (
            <p className="text-red-500 text-sm">{fieldErrors.termsAccepted}</p>
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.marketingOptIn}
              onChange={(e) => handleInputChange('marketingOptIn', e.target.checked)}
              className="rounded"
              disabled={isLoading}
            />
            <span className="text-sm">{t('marketingOptIn')}</span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('registering') : t('register')}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('haveAccount')}{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
