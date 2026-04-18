'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  getPasswordStrength,
  normalizeContactInput,
  validateContact,
  validatePassword,
} from '@/lib/auth/utils'
import { useAuth } from '@/shared/providers/auth-provider'

export function ResetPasswordForm() {
  const t = useTranslations('auth')
  const { requestPasswordReset, confirmPasswordReset, isLoading, error, clearError } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [formData, setFormData] = useState({
    contact: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateRequestForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.contact.trim()) {
      errors.contact = t('contactRequired')
    } else if (!validateContact(formData.contact)) {
      errors.contact = t('contactInvalid')
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  const validateConfirmForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.code.trim()) {
      errors.code = t('codeRequired')
    } else if (formData.code.length !== 6 || !/^\d+$/.test(formData.code)) {
      errors.code = t('codeInvalid')
    }

    const passwordValidation = validatePassword(formData.newPassword)

    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.errors[0]
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = t('passwordMismatch')
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateRequestForm()) {
      return
    }

    try {
      await requestPasswordReset(normalizeContactInput(formData.contact))
      setStep('confirm')
    } catch {
      // Error is handled by the auth provider
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateConfirmForm()) {
      return
    }

    try {
      await confirmPasswordReset(
        normalizeContactInput(formData.contact),
        formData.code,
        formData.newPassword,
      )
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

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('resetPasswordTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {step === 'request' ? t('resetPasswordSubtitle') : t('enterNewPasswordSubtitle')}
        </p>
      </div>

      {step === 'request' ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
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
            />
            {fieldErrors.contact && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.contact}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('sending') : t('sendResetCode')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConfirmReset} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              {t('verificationCode')}
            </label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              disabled={isLoading}
              placeholder="123456"
              maxLength={6}
            />
            {fieldErrors.code && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.code}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
              {t('newPassword')}
            </label>
            <input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {formData.newPassword && (
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
            {fieldErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              {t('confirmNewPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('resetting') : t('resetPassword')}
          </Button>
        </form>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('backToLogin')}
        </button>
      </div>
    </div>
  )
}
