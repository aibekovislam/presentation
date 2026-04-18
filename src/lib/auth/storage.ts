const TOKENS_STORAGE_KEY = 'bolmo.auth.tokens'

interface PersistedTokens {
  accessToken: string | null
  refreshToken: string | null
}

let accessToken: string | null = null
let refreshToken: string | null = null

const isBrowser = (): boolean => typeof window !== 'undefined'

const readPersistedTokens = (): PersistedTokens => {
  if (!isBrowser()) {
    return { accessToken: null, refreshToken: null }
  }

  try {
    const raw = window.localStorage.getItem(TOKENS_STORAGE_KEY)

    if (!raw) {
      return { accessToken: null, refreshToken: null }
    }

    const parsed = JSON.parse(raw) as Partial<PersistedTokens>

    return {
      accessToken: typeof parsed.accessToken === 'string' ? parsed.accessToken : null,
      refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : null,
    }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

const persistTokens = (): void => {
  if (!isBrowser()) {
    return
  }

  if (!accessToken && !refreshToken) {
    window.localStorage.removeItem(TOKENS_STORAGE_KEY)

    return
  }

  window.localStorage.setItem(
    TOKENS_STORAGE_KEY,
    JSON.stringify({ accessToken, refreshToken }),
  )
}

const hydrateTokens = (): void => {
  if (accessToken || refreshToken) {
    return
  }

  const persisted = readPersistedTokens()

  accessToken = persisted.accessToken
  refreshToken = persisted.refreshToken
}

export const getAccessToken = (): string | null => {
  hydrateTokens()

  return accessToken
}

export const setAccessToken = (token: string | null): void => {
  accessToken = token
  persistTokens()
}

export const getRefreshToken = (): string | null => {
  hydrateTokens()

  return refreshToken
}

export const setRefreshToken = (token: string | null): void => {
  refreshToken = token
  persistTokens()
}

export const setAuthTokens = (tokens: {
  accessToken: string | null
  refreshToken: string | null
}): void => {
  accessToken = tokens.accessToken
  refreshToken = tokens.refreshToken
  persistTokens()
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000

    return payload.exp < currentTime
  } catch {
    return true
  }
}

export const decodeToken = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export const clearTokens = (): void => {
  accessToken = null
  refreshToken = null

  if (isBrowser()) {
    window.localStorage.removeItem(TOKENS_STORAGE_KEY)
  }
}

export const hasValidAccessToken = (): boolean => {
  const token = getAccessToken()

  return token !== null && !isTokenExpired(token)
}
