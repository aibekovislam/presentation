import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { clearTokens, getAccessToken, getRefreshToken, setAuthTokens } from '@/lib/auth/storage'

import { mockAdapter } from './mock/adapter'
import { seedMockAuth } from './mock/auto-auth'

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

const API_LANGS = new Set(['ru', 'kg', 'en'])
const API_LANG_PATH_PREFIXES = [
  '/rent-ads',
  '/sale-ads',
  '/housemate-ads',
  '/quick-filters',
  '/taxonomy/districts',
  '/taxonomy/streets',
]

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

export const API_URL = (rawApiUrl && rawApiUrl.length > 0 ? rawApiUrl : '/v1').replace(/\/$/, '')

/**
 * Convert absolute backend media URLs to relative paths
 * so they go through Next.js rewrite proxy and avoid CORS issues.
 * e.g. "http://localhost:3000/v1/media/files/listings/x.jpg" → "/v1/media/files/listings/x.jpg"
 */
export const normalizeMediaUrl = (url: string): string => {
  if (!url) return url
  try {
    const parsed = new URL(url)
    // Only convert URLs pointing to our backend
    if (parsed.pathname.startsWith('/v1/')) {
      return parsed.pathname
    }
  } catch {
    // Not an absolute URL, return as-is
  }
  return url
}

const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK ?? 'true').toLowerCase() !== 'false'

if (USE_MOCK) {
  seedMockAuth()
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: !USE_MOCK,
  headers: {
    'Content-Type': 'application/json',
  },
  ...(USE_MOCK ? { adapter: mockAdapter } : {}),
})

let refreshPromise: Promise<string | null> | null = null

const isAuthFlowEndpoint = (url?: string): boolean => {
  if (!url) {
    return false
  }

  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  )
}

const shouldInjectLangQuery = (url?: string): boolean => {
  if (!url) {
    return false
  }

  return API_LANG_PATH_PREFIXES.some((prefix) => url.startsWith(prefix))
}

const resolveClientApiLang = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const pathnameFirstSegment = window.location.pathname.split('/').filter(Boolean)[0]
  if (pathnameFirstSegment && API_LANGS.has(pathnameFirstSegment)) {
    return pathnameFirstSegment
  }

  const htmlLang = document.documentElement.lang.split('-')[0].trim().toLowerCase()
  if (htmlLang && API_LANGS.has(htmlLang)) {
    return htmlLang
  }

  return null
}

const appendLangToUrl = (url: string, lang: string): string => {
  const [path, search = ''] = url.split('?')
  const params = new URLSearchParams(search)

  if (!params.get('lang')) {
    params.set('lang', lang)
  }

  const query = params.toString()

  return query ? `${path}?${query}` : path
}

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return null
  }

  try {
    const { data } = await axios.post<RefreshResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      },
    )

    setAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    })

    return data.accessToken
  } catch {
    clearTokens()

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'))
    }

    return null
  }
}

api.interceptors.request.use((config) => {
  if (config.method?.toUpperCase() === 'GET' && shouldInjectLangQuery(config.url)) {
    const lang = resolveClientApiLang()

    if (lang && config.url) {
      config.url = appendLangToUrl(config.url, lang)
    }
  }

  const token = getAccessToken()

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const config = error.config as RetryableConfig | undefined

    if (!config || status !== 401 || config._retry || isAuthFlowEndpoint(config.url)) {
      return Promise.reject(error)
    }

    config._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const newAccessToken = await refreshPromise

    if (!newAccessToken) {
      return Promise.reject(error)
    }

    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${newAccessToken}`

    return api(config)
  },
)

export default api
