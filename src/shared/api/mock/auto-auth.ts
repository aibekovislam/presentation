import { setAuthTokens } from '@/lib/auth/storage'

const STORAGE_KEY = 'bolmo.auth.tokens'
const MOCK_SIGNAL = 'bolmo.mock.seeded.v1'

const buildMockJwt = (ttlSeconds: number): string => {
  const encode = (value: object): string => {
    const json = JSON.stringify(value)
    if (typeof btoa === 'function') return btoa(json)
    return Buffer.from(json).toString('base64')
  }
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload = encode({
    sub: 'me-001',
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  })
  return `${header}.${payload}.mocksig`
}

export const seedMockAuth = (): void => {
  if (typeof window === 'undefined') return

  try {
    // Only seed once per browser; respect explicit sign-out via storage clearing.
    if (window.localStorage.getItem(MOCK_SIGNAL) === '1') return

    const hasExistingSession = window.localStorage.getItem(STORAGE_KEY) !== null
    if (hasExistingSession) {
      window.localStorage.setItem(MOCK_SIGNAL, '1')
      return
    }

    setAuthTokens({
      accessToken: buildMockJwt(60 * 60 * 24),
      refreshToken: buildMockJwt(60 * 60 * 24 * 30),
    })
    window.localStorage.setItem(MOCK_SIGNAL, '1')
  } catch {
    // ignore — non-critical
  }
}
