'use client'

import { useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { normalizeContactInput, validateContact } from '@/lib/auth/utils'
import { useAuth } from '@/shared/providers/auth-provider'

export function VerifyEmailForm() {
  const t = useTranslations('auth')
  const { requestVerification, confirmVerification, isLoading, error, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const contactFromParams = searchParams.get('contact') || ''

  const [contact, setContact] = useState(contactFromParams)
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateContactForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!contact.trim()) {
      errors.contact = t('contactRequired')
    } else if (!validateContact(contact)) {
      errors.contact = t('contactInvalid')
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  const validateCodeForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!code.trim()) {
      errors.code = t('codeRequired')
    } else if (code.length !== 6 || !/^\d+$/.test(code)) {
      errors.code = t('codeInvalid')
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateContactForm()) {
      return
    }

    try {
      await requestVerification(normalizeContactInput(contact))
      setStep('confirm')
    } catch {
      // Error is handled by the auth provider
    }
  }

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateCodeForm()) {
      return
    }

    try {
      await confirmVerification(normalizeContactInput(contact), code)
    } catch {
      // Error is handled by the auth provider
    }
  }

  const handleResendCode = async () => {
    clearError()
    try {
      await requestVerification(normalizeContactInput(contact))
    } catch {
      // Error is handled by the auth provider
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('verifyEmailTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {step === 'request' ? t('verifyEmailSubtitle') : t('enterCodeSubtitle')}
        </p>
      </div>

      {step === 'request' ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div>
            <label htmlFor="contact" className="block text-sm font-medium mb-1">
              {t('contact')}
            </label>
            <input
              id="contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
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
            {isLoading ? t('sending') : t('sendCode')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConfirmCode} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              {t('verificationCode')}
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              disabled={isLoading}
              placeholder="123456"
              maxLength={6}
            />
            {fieldErrors.code && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.code}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {t('codeSentTo')} {contact}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('verifying') : t('verify')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-blue-600 hover:underline"
              disabled={isLoading}
            >
              {t('resendCode')}
            </button>
          </div>
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
