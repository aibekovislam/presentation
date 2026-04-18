import { AuthUser } from './types'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailRegex.test(email.trim().toLowerCase())
}

export const normalizeContactInput = (contact: string): string => {
  const value = contact.trim()
  const lower = value.toLowerCase()

  if (validateEmail(lower)) {
    return lower
  }

  const compact = value.replace(/[()\s-]/g, '')

  if (compact.startsWith('00')) {
    return `+${compact.slice(2)}`
  }

  if (/^\d+$/.test(compact)) {
    return `+${compact}`
  }

  return compact
}

export const validatePhone = (phone: string): boolean => {
  const normalized = normalizeContactInput(phone)
  const phoneRegex = /^\+[1-9]\d{8,14}$/

  return phoneRegex.test(normalized)
}

export const validateContact = (contact: string): boolean => {
  const normalized = normalizeContactInput(contact)

  return validateEmail(normalized) || validatePhone(normalized)
}

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const getPasswordStrength = (password: string): number => {
  let strength = 0

  if (password.length >= 8) strength += 20
  if (/[A-Z]/.test(password)) strength += 20
  if (/[a-z]/.test(password)) strength += 20
  if (/\d/.test(password)) strength += 20
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 20

  return strength
}

export const formatUserDisplayName = (user: AuthUser): string => {
  const parts = [user.firstName?.trim(), user.lastName?.trim()].filter(
    (value): value is string => Boolean(value),
  )

  return parts.join(' ')
}

export const isUserVerified = (user: AuthUser): boolean => {
  return user.contactVerified
}
