import api from '@/shared/api/axios'

import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  VerificationRequest,
  VerificationResponse,
  VerificationConfirmRequest,
  VerificationConfirmResponse,
  AddPhoneResponse,
  RefreshResponse,
  LogoutRequest,
  LogoutResponse,
  MeResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResetPasswordConfirmRequest,
  ResetPasswordConfirmResponse,
} from './types'

export const authAPI = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data)

    return response.data
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data)

    return response.data
  },

  requestVerification: async (data: VerificationRequest): Promise<VerificationResponse> => {
    const response = await api.post<VerificationResponse>('/auth/verification/request', data)

    return response.data
  },

  confirmVerification: async (data: VerificationConfirmRequest): Promise<VerificationConfirmResponse> => {
    const response = await api.post<VerificationConfirmResponse>('/auth/verification/confirm', data)

    return response.data
  },

  // Temporary: confirm phone without code
  confirmPhone: async (phone: string): Promise<VerificationConfirmResponse> => {
    const response = await api.post<VerificationConfirmResponse>('/auth/verification/confirm-phone', { phone })

    return response.data
  },

  addPhone: async (phone: string): Promise<AddPhoneResponse> => {
    const response = await api.post<AddPhoneResponse>('/users/me/phone', { phone })

    return response.data
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>('/auth/refresh', { refreshToken })

    return response.data
  },

  logout: async (data: LogoutRequest): Promise<LogoutResponse> => {
    const response = await api.post<LogoutResponse>('/auth/logout', data)

    return response.data
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>('/auth/me')

    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await api.post<ChangePasswordResponse>('/auth/password/change', data)

    return response.data
  },

  requestPasswordReset: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>('/auth/password/reset/request', data)

    return response.data
  },

  confirmPasswordReset: async (data: ResetPasswordConfirmRequest): Promise<ResetPasswordConfirmResponse> => {
    const response = await api.post<ResetPasswordConfirmResponse>('/auth/password/reset/confirm', data)

    return response.data
  },
}
