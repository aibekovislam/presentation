export interface AuthUser {
  userId: string
  firstName: string | null
  lastName: string | null
  contact: string | null
  contactType: 'EMAIL' | 'PHONE' | null
  contactVerified: boolean
  avatarUrl?: string | null
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  accessTokenTtl: string
  refreshTokenTtl: string
}

export interface RegisterRequest {
  contact: string
  password: string
  termsAccepted: boolean
  marketingOptIn: boolean
  firstName: string
  lastName: string
}

export interface RegisterResponse extends Partial<AuthTokens> {
  userId: string
  contactType: 'EMAIL' | 'PHONE'
  contact: string
  requiresVerification: boolean
}

export interface LoginRequest {
  contact: string
  password: string
}

export interface LoginResponse extends AuthTokens {
  userId: string
}

export interface VerificationRequest {
  contact: string
}

export interface VerificationResponse {
  success: boolean
  expiresInSeconds: number
  debugCode?: string
}

export interface VerificationConfirmRequest {
  contact: string
  code: string
}

export interface VerificationConfirmResponse {
  verified: boolean
  contactType: 'EMAIL' | 'PHONE'
  contact: string
}

export type RefreshResponse = AuthTokens

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutResponse {
  success: boolean
}

export type MeResponse = AuthUser

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  success: boolean
  forceRelogin: boolean
  revokedSessions: number
}

export interface ResetPasswordRequest {
  contact: string
}

export interface ResetPasswordResponse {
  success: boolean
  expiresInSeconds: number
}

export interface ResetPasswordConfirmRequest {
  contact: string
  code: string
  newPassword: string
}

export interface ResetPasswordConfirmResponse {
  success: boolean
  forceRelogin: boolean
  revokedSessions: number
}

export interface AddPhoneResponse {
  success: boolean
  phone: string
  verified: boolean
}

export interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (contact: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  requestVerification: (contact: string) => Promise<void>
  confirmVerification: (contact: string, code: string) => Promise<void>
  addPhone: (phone: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (contact: string) => Promise<void>
  confirmPasswordReset: (contact: string, code: string, newPassword: string) => Promise<void>
  clearError: () => void
}
