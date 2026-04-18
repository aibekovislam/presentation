import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

import {
  districts,
  housemateProfiles,
  quickFilters,
  streets,
} from './data'
import { mkId, store } from './store'

import type {
  CreateHousemateAdRequest,
  CreateRentAdRequest,
  CreateSaleAdRequest,
  FavoriteItem,
  HousemateAd,
  PaginatedResponse,
  RentAd,
  SaleAd,
} from '@/lib/ads/types'

// ── Helpers ─────────────────────────────────────────────

const DELAY_MS = 220

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const safeParse = (value: unknown): Record<string, unknown> => {
  if (!value) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  if (typeof value === 'object') return value as Record<string, unknown>
  return {}
}

type Query = Record<string, string | undefined>

const splitUrl = (rawUrl: string): { path: string; query: Query } => {
  const [path, search = ''] = rawUrl.split('?')
  const query: Query = {}
  if (search) {
    const params = new URLSearchParams(search)
    params.forEach((value, key) => {
      query[key] = value
    })
  }
  let normalized = path
  if (!normalized.startsWith('/')) normalized = '/' + normalized
  return { path: normalized, query }
}

const makeResponse = <T>(
  data: T,
  config: InternalAxiosRequestConfig,
  status = 200,
): AxiosResponse<T> => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : String(status),
  headers: {},
  config,
})

const buildMockJwt = (ttlSeconds = 60 * 60 * 24): string => {
  const encode = (value: object): string => {
    const json = JSON.stringify(value)
    if (typeof btoa === 'function') return btoa(json)
    return Buffer.from(json).toString('base64')
  }
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload = encode({
    sub: store.currentUser.userId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  })
  return `${header}.${payload}.mocksig`
}

const paginate = <T>(items: T[], query: Query): PaginatedResponse<T> => {
  const page = Math.max(1, Number(query.page ?? '1') || 1)
  const limit = Math.max(1, Number(query.limit ?? '20') || 20)
  const start = (page - 1) * limit
  return {
    items: items.slice(start, start + limit),
    page,
    limit,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  }
}

type BaseFilterable = {
  title: string
  description?: string
  price: number
  city: string
  districtName?: string | null
  createdAt?: string
  publishedAt?: string
}

const applyCommonFilters = <T extends BaseFilterable>(items: T[], query: Query): T[] => {
  let result = items

  if (query.q) {
    const q = query.q.toLowerCase()
    result = result.filter(
      (ad) =>
        ad.title.toLowerCase().includes(q) ||
        (ad.description ?? '').toLowerCase().includes(q) ||
        (ad.districtName ?? '').toLowerCase().includes(q),
    )
  }

  if (query.city) {
    const city = query.city.toLowerCase()
    result = result.filter((ad) => ad.city.toLowerCase().includes(city))
  }

  if (query.minPrice) {
    const min = Number(query.minPrice)
    result = result.filter((ad) => ad.price >= min)
  }
  if (query.maxPrice) {
    const max = Number(query.maxPrice)
    result = result.filter((ad) => ad.price <= max)
  }

  const sortBy = query.sortBy ?? 'publishedAt'
  const order = query.sortOrder === 'asc' ? 1 : -1

  result = [...result].sort((a, b) => {
    if (sortBy === 'price') return (a.price - b.price) * order
    const aDate = new Date(a.publishedAt ?? a.createdAt ?? 0).getTime()
    const bDate = new Date(b.publishedAt ?? b.createdAt ?? 0).getTime()
    return (aDate - bDate) * order
  })

  return result
}

const withFavFlag = <T extends { id: string; isFavorite?: boolean }>(items: T[]): T[] =>
  items.map((item) => ({ ...item, isFavorite: store.favorites.has(item.id) }))

// ── Create helpers ──────────────────────────────────────

const buildOwnerFromUser = () => ({
  id: store.currentUser.userId,
  firstName: store.currentUser.firstName ?? 'Я',
  lastName: store.currentUser.lastName ?? undefined,
  avatarUrl: store.currentUser.avatarUrl ?? undefined,
  contactVerified: true,
  createdAt: store.currentUser.createdAt,
  listingsCount: 1,
})

const createRentAd = (payload: CreateRentAdRequest): RentAd => {
  const now = new Date().toISOString()
  const id = mkId('rent-new')
  const district = districts.find((d) => d.id === payload.districtId)
  const ad: RentAd = {
    id,
    ownerId: store.currentUser.userId,
    owner: buildOwnerFromUser(),
    kind: 'RENT',
    status: 'PUBLISHED',
    title: payload.title,
    description: payload.description,
    city: payload.city,
    districtId: payload.districtId,
    districtName: district?.name ?? null,
    streetId: payload.streetId,
    streetName: payload.rent?.address?.street ?? null,
    price: payload.price,
    currency: payload.currency,
    photos: payload.photos ?? [],
    viewCount: 0,
    isActive: true,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    rent: {
      ...payload.rent,
      photos: payload.photos ?? [],
    },
  }
  store.rentAds.unshift(ad)
  return ad
}

const createSaleAd = (payload: CreateSaleAdRequest): SaleAd => {
  const now = new Date().toISOString()
  const id = mkId('sale-new')
  const district = districts.find((d) => d.id === payload.districtId)
  const ad: SaleAd = {
    id,
    ownerId: store.currentUser.userId,
    owner: buildOwnerFromUser(),
    kind: 'SALE',
    status: 'PUBLISHED',
    title: payload.title,
    description: payload.description,
    city: payload.city,
    districtId: payload.districtId,
    districtName: district?.name ?? null,
    streetId: payload.streetId,
    price: payload.price,
    currency: payload.currency,
    photos: payload.photos ?? [],
    viewCount: 0,
    isActive: true,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    sale: payload.sale,
  }
  store.saleAds.unshift(ad)
  return ad
}

const createHousemateAd = (payload: CreateHousemateAdRequest): HousemateAd => {
  const now = new Date().toISOString()
  const id = mkId('hm-new')
  const district = districts.find((d) => d.id === payload.districtId)
  const ad: HousemateAd = {
    id,
    ownerId: store.currentUser.userId,
    owner: buildOwnerFromUser(),
    kind: 'HOUSEMATE',
    status: 'PUBLISHED',
    title: payload.title,
    description: payload.description,
    city: payload.city,
    districtId: payload.districtId,
    districtName: district?.name ?? null,
    streetId: payload.streetId,
    price: payload.price,
    currency: payload.currency,
    photos: payload.photos ?? [],
    viewCount: 0,
    isActive: true,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    housemate: {
      propertyType: payload.housemate.propertyType,
      offeredPlaceType: payload.housemate.offeredPlaceType,
      residentsCount: payload.housemate.residentsCount,
      address: payload.housemate.address,
      homeInfo: payload.housemate.homeInfo ?? null,
      offeredPlace: payload.housemate.offeredPlace ?? null,
      pricing: payload.housemate.pricing ?? null,
      currentResidents: payload.housemate.currentResidents ?? null,
      amenities: payload.housemate.amenities ?? null,
      rules: payload.housemate.rules ?? null,
      desiredRoommate: payload.housemate.desiredRoommate ?? null,
    },
  }
  store.housemateAds.unshift(ad)
  return ad
}

// ── Router ──────────────────────────────────────────────

type Handler = (args: {
  match: RegExpMatchArray
  query: Query
  body: Record<string, unknown>
  config: InternalAxiosRequestConfig
}) => unknown | Promise<unknown>

interface Route {
  method: string
  regex: RegExp
  handler: Handler
}

const routes: Route[] = []

const register = (method: string, pattern: RegExp, handler: Handler): void => {
  routes.push({ method: method.toUpperCase(), regex: pattern, handler })
}

// Auth
register('POST', /^\/auth\/login$/, () => ({
  userId: store.currentUser.userId,
  accessToken: buildMockJwt(),
  refreshToken: buildMockJwt(60 * 60 * 24 * 30),
  tokenType: 'Bearer',
  accessTokenTtl: '24h',
  refreshTokenTtl: '30d',
}))

register('POST', /^\/auth\/register$/, ({ body }) => {
  const contact = String(body.contact ?? store.currentUser.contact ?? '')
  const firstName = String(body.firstName ?? store.currentUser.firstName ?? 'Пользователь')
  const lastName = String(body.lastName ?? store.currentUser.lastName ?? '')
  store.currentUser = {
    ...store.currentUser,
    contact,
    firstName,
    lastName,
    contactVerified: true,
  }
  return {
    userId: store.currentUser.userId,
    contactType: contact.includes('@') ? 'EMAIL' : 'PHONE',
    contact,
    requiresVerification: false,
    accessToken: buildMockJwt(),
    refreshToken: buildMockJwt(60 * 60 * 24 * 30),
    tokenType: 'Bearer',
    accessTokenTtl: '24h',
    refreshTokenTtl: '30d',
  }
})

register('POST', /^\/auth\/refresh$/, () => ({
  accessToken: buildMockJwt(),
  refreshToken: buildMockJwt(60 * 60 * 24 * 30),
  tokenType: 'Bearer',
  accessTokenTtl: '24h',
  refreshTokenTtl: '30d',
}))

register('POST', /^\/auth\/logout$/, () => ({ success: true }))

register('GET', /^\/auth\/me$/, () => store.currentUser)

register('POST', /^\/auth\/verification\/request$/, () => ({
  success: true,
  expiresInSeconds: 600,
  debugCode: '000000',
}))

register('POST', /^\/auth\/verification\/confirm$/, ({ body }) => {
  const contact = String(body.contact ?? store.currentUser.contact ?? '')
  store.currentUser = { ...store.currentUser, contact, contactVerified: true }
  return { verified: true, contactType: contact.includes('@') ? 'EMAIL' : 'PHONE', contact }
})

register('POST', /^\/auth\/verification\/confirm-phone$/, ({ body }) => {
  const phone = String(body.phone ?? '')
  store.currentUser = { ...store.currentUser, contact: phone, contactType: 'PHONE', contactVerified: true }
  return { verified: true, contactType: 'PHONE', contact: phone }
})

register('POST', /^\/users\/me\/phone$/, ({ body }) => {
  const phone = String(body.phone ?? '')
  store.currentUser = { ...store.currentUser, contact: phone, contactType: 'PHONE', contactVerified: true }
  return { success: true, phone, verified: true }
})

register('POST', /^\/auth\/password\/change$/, () => ({
  success: true,
  forceRelogin: false,
  revokedSessions: 0,
}))

register('POST', /^\/auth\/password\/reset\/request$/, () => ({
  success: true,
  expiresInSeconds: 600,
}))

register('POST', /^\/auth\/password\/reset\/confirm$/, () => ({
  success: true,
  forceRelogin: true,
  revokedSessions: 1,
}))

// Taxonomy
register('GET', /^\/taxonomy\/districts$/, () => districts)
register('GET', /^\/taxonomy\/streets$/, () => streets)

// Quick filters
register('GET', /^\/quick-filters$/, () => quickFilters)

// Rent ads
register('GET', /^\/rent-ads$/, ({ query }) => {
  const filtered = applyCommonFilters(store.rentAds.filter((a) => a.isActive !== false), query).filter((ad) => {
    if (query.rentType && ad.rent.rentType !== query.rentType) return false
    if (query.roomsCount && String(ad.rent.roomsCount) !== String(query.roomsCount)) return false
    if (query.minRoomsCount) {
      const min = Number(query.minRoomsCount)
      if (!ad.rent.roomsCount || ad.rent.roomsCount < min) return false
    }
    if (query.propertyType && ad.rent.propertyType !== query.propertyType) return false
    if (query.petsAllowed === 'true' && !ad.rent.allowedWithPets) return false
    if (query.kidsAllowed === 'true' && !ad.rent.allowedWithKids) return false
    return true
  })
  return paginate(withFavFlag(filtered), query)
})

register('GET', /^\/rent-ads\/me$/, ({ query }) => {
  const mine = store.rentAds.filter((ad) => ad.ownerId === store.currentUser.userId)
  return paginate(withFavFlag(mine), query)
})

register('GET', /^\/rent-ads\/([^/]+)\/similar$/, ({ match }) => {
  const id = match[1]
  const current = store.rentAds.find((ad) => ad.id === id)
  const rest = store.rentAds.filter((ad) => ad.id !== id && ad.isActive !== false)
  if (!current) return withFavFlag(rest.slice(0, 6))
  const similar = rest.filter((ad) => ad.rent.propertyType === current.rent.propertyType).slice(0, 6)
  return withFavFlag(similar.length ? similar : rest.slice(0, 6))
})

register('GET', /^\/rent-ads\/me\/([^/]+)$/, ({ match }) => {
  const ad = store.rentAds.find((a) => a.id === match[1] && a.ownerId === store.currentUser.userId)
  if (!ad) throw notFound()
  return { ...ad, isFavorite: store.favorites.has(ad.id) }
})

register('GET', /^\/rent-ads\/([^/]+)$/, ({ match }) => {
  const ad = store.rentAds.find((a) => a.id === match[1])
  if (!ad) throw notFound()
  ad.viewCount = (ad.viewCount ?? 0) + 1
  return { ...ad, isFavorite: store.favorites.has(ad.id) }
})

register('POST', /^\/rent-ads$/, ({ body }) =>
  createRentAd(body as unknown as CreateRentAdRequest),
)

register('PATCH', /^\/rent-ads\/([^/]+)$/, ({ match, body }) => {
  const idx = store.rentAds.findIndex((a) => a.id === match[1])
  if (idx === -1) throw notFound()
  store.rentAds[idx] = { ...store.rentAds[idx], ...(body as Partial<RentAd>) }
  return store.rentAds[idx]
})

register('POST', /^\/rent-ads\/([^/]+)\/publish$/, ({ match }) => {
  const ad = store.rentAds.find((a) => a.id === match[1])
  if (ad) {
    ad.status = 'PUBLISHED'
    ad.publishedAt = new Date().toISOString()
  }
  return { success: true, status: 'PUBLISHED', publishedAt: new Date().toISOString() }
})

register('POST', /^\/rent-ads\/([^/]+)\/archive$/, ({ match }) => {
  const ad = store.rentAds.find((a) => a.id === match[1])
  if (ad) ad.status = 'ARCHIVED'
  return { success: true, status: 'ARCHIVED' }
})

register('POST', /^\/rent-ads\/([^/]+)\/(activate|deactivate)$/, ({ match }) => {
  const ad = store.rentAds.find((a) => a.id === match[1])
  const isActive = match[2] === 'activate'
  if (ad) ad.isActive = isActive
  return { success: true, isActive }
})

// Sale ads
register('GET', /^\/sale-ads$/, ({ query }) => {
  const filtered = applyCommonFilters(store.saleAds.filter((a) => a.isActive !== false), query).filter((ad) => {
    if (query.salePropertyType && ad.sale.propertyType !== query.salePropertyType) return false
    return true
  })
  return paginate(withFavFlag(filtered), query)
})

register('GET', /^\/sale-ads\/me$/, ({ query }) => {
  const mine = store.saleAds.filter((ad) => ad.ownerId === store.currentUser.userId)
  return paginate(withFavFlag(mine), query)
})

register('GET', /^\/sale-ads\/me\/([^/]+)$/, ({ match }) => {
  const ad = store.saleAds.find((a) => a.id === match[1] && a.ownerId === store.currentUser.userId)
  if (!ad) throw notFound()
  return { ...ad, isFavorite: store.favorites.has(ad.id) }
})

register('GET', /^\/sale-ads\/([^/]+)$/, ({ match }) => {
  const ad = store.saleAds.find((a) => a.id === match[1])
  if (!ad) throw notFound()
  ad.viewCount = (ad.viewCount ?? 0) + 1
  return { ...ad, isFavorite: store.favorites.has(ad.id) }
})

register('POST', /^\/sale-ads$/, ({ body }) =>
  createSaleAd(body as unknown as CreateSaleAdRequest),
)

register('PATCH', /^\/sale-ads\/([^/]+)$/, ({ match, body }) => {
  const idx = store.saleAds.findIndex((a) => a.id === match[1])
  if (idx === -1) throw notFound()
  store.saleAds[idx] = { ...store.saleAds[idx], ...(body as Partial<SaleAd>) }
  return store.saleAds[idx]
})

register('POST', /^\/sale-ads\/([^/]+)\/publish$/, ({ match }) => {
  const ad = store.saleAds.find((a) => a.id === match[1])
  if (ad) {
    ad.status = 'PUBLISHED'
    ad.publishedAt = new Date().toISOString()
  }
  return { success: true, status: 'PUBLISHED', publishedAt: new Date().toISOString() }
})

register('POST', /^\/sale-ads\/([^/]+)\/archive$/, ({ match }) => {
  const ad = store.saleAds.find((a) => a.id === match[1])
  if (ad) ad.status = 'ARCHIVED'
  return { success: true, status: 'ARCHIVED' }
})

register('POST', /^\/sale-ads\/([^/]+)\/(activate|deactivate)$/, ({ match }) => {
  const ad = store.saleAds.find((a) => a.id === match[1])
  const isActive = match[2] === 'activate'
  if (ad) ad.isActive = isActive
  return { success: true, isActive }
})

// Housemate ads
register('GET', /^\/housemate-ads$/, ({ query }) => {
  const filtered = applyCommonFilters(store.housemateAds.filter((a) => a.isActive !== false), query).filter((ad) => {
    if (query.housemateOfferedPlaceType && ad.housemate.offeredPlaceType !== query.housemateOfferedPlaceType) return false
    if (query.propertyType && ad.housemate.propertyType !== query.propertyType) return false
    if (query.noSmoking === 'true' && ad.housemate.rules?.smokingPolicy === 'yes') return false
    if (query.petsAllowed === 'true' && ad.housemate.rules?.petsPolicy === 'no') return false
    if (query.femaleOnly === 'true') {
      const g = ad.housemate.desiredRoommate?.gender
      if (g !== 'female') return false
    }
    if (query.maleOnly === 'true') {
      const g = ad.housemate.desiredRoommate?.gender
      if (g !== 'male') return false
    }
    if (query.furnished === 'true' && !ad.housemate.offeredPlace?.furnished) return false
    return true
  })
  return paginate(withFavFlag(filtered), query)
})

register('GET', /^\/housemate-ads\/me$/, ({ query }) => {
  const mine = store.housemateAds.filter((ad) => ad.ownerId === store.currentUser.userId)
  return paginate(withFavFlag(mine), query)
})

register('GET', /^\/housemate-ads\/([^/]+)\/similar$/, ({ match }) => {
  const rest = store.housemateAds.filter((ad) => ad.id !== match[1] && ad.isActive !== false)
  return withFavFlag(rest.slice(0, 6))
})

register('GET', /^\/housemate-ads\/me\/([^/]+)$/, ({ match }) => {
  const ad = store.housemateAds.find((a) => a.id === match[1] && a.ownerId === store.currentUser.userId)
  if (!ad) throw notFound()
  return { ...ad, isFavorite: store.favorites.has(ad.id) }
})

register('GET', /^\/housemate-ads\/([^/]+)$/, ({ match }) => {
  const ad = store.housemateAds.find((a) => a.id === match[1])
  if (!ad) throw notFound()
  ad.viewCount = (ad.viewCount ?? 0) + 1
  return { ...ad, isFavorite: store.favorites.has(ad.id) }
})

register('POST', /^\/housemate-ads$/, ({ body }) =>
  createHousemateAd(body as unknown as CreateHousemateAdRequest),
)

register('PATCH', /^\/housemate-ads\/([^/]+)$/, ({ match, body }) => {
  const idx = store.housemateAds.findIndex((a) => a.id === match[1])
  if (idx === -1) throw notFound()
  store.housemateAds[idx] = { ...store.housemateAds[idx], ...(body as Partial<HousemateAd>) }
  return store.housemateAds[idx]
})

register('POST', /^\/housemate-ads\/([^/]+)\/publish$/, ({ match }) => {
  const ad = store.housemateAds.find((a) => a.id === match[1])
  if (ad) {
    ad.status = 'PUBLISHED'
    ad.publishedAt = new Date().toISOString()
  }
  return { success: true, status: 'PUBLISHED', publishedAt: new Date().toISOString() }
})

register('POST', /^\/housemate-ads\/([^/]+)\/archive$/, ({ match }) => {
  const ad = store.housemateAds.find((a) => a.id === match[1])
  if (ad) ad.status = 'ARCHIVED'
  return { success: true, status: 'ARCHIVED' }
})

register('POST', /^\/housemate-ads\/([^/]+)\/(activate|deactivate)$/, ({ match }) => {
  const ad = store.housemateAds.find((a) => a.id === match[1])
  const isActive = match[2] === 'activate'
  if (ad) ad.isActive = isActive
  return { success: true, isActive }
})

// Favorites
register('POST', /^\/favorites\/([^/]+)\/toggle$/, ({ match }) => {
  const id = match[1]
  if (store.favorites.has(id)) store.favorites.delete(id)
  else store.favorites.add(id)
  return { isFavorite: store.favorites.has(id) }
})

register('GET', /^\/favorites\/([^/]+)\/check$/, ({ match }) => ({
  isFavorite: store.favorites.has(match[1]),
}))

register('GET', /^\/favorites$/, ({ query }) => {
  const allFavorites: FavoriteItem[] = []
  store.favorites.forEach((postId) => {
    const rent = store.rentAds.find((a) => a.id === postId)
    if (rent) {
      allFavorites.push({ postId, kind: 'RENT', addedAt: new Date().toISOString(), post: { ...rent, isFavorite: true } })
      return
    }
    const sale = store.saleAds.find((a) => a.id === postId)
    if (sale) {
      allFavorites.push({ postId, kind: 'SALE', addedAt: new Date().toISOString(), post: { ...sale, isFavorite: true } })
      return
    }
    const hm = store.housemateAds.find((a) => a.id === postId)
    if (hm) {
      allFavorites.push({ postId, kind: 'HOUSEMATE', addedAt: new Date().toISOString(), post: { ...hm, isFavorite: true } })
    }
  })
  const kindFilter = query.kind
  const filtered = kindFilter ? allFavorites.filter((f) => f.kind === kindFilter) : allFavorites
  return paginate(filtered, query)
})

// Media upload
register('POST', /^\/media\/upload$/, ({ config }) => {
  const data = config.data as FormData | undefined
  let count = 1
  if (data && typeof (data as FormData).getAll === 'function') {
    count = Math.max(1, (data as FormData).getAll('files').length)
  }
  const files = Array.from({ length: count }, (_, idx) => {
    const seed = Math.floor(Math.random() * 1000)
    const url = `https://picsum.photos/seed/upload-${seed}-${idx}/1200/800`
    return { url, key: `mock-${seed}-${idx}` }
  })
  return { files }
})

// Housemate profiles (people)
register('GET', /^\/housemate-profiles$/, ({ query }) => {
  let list = housemateProfiles
  if (query.q) {
    const q = query.q.toLowerCase()
    list = list.filter((entry) =>
      `${entry.user.firstName} ${entry.user.lastName ?? ''}`.toLowerCase().includes(q) ||
      (entry.profile.notes ?? '').toLowerCase().includes(q),
    )
  }
  if (query.preferredGender) {
    list = list.filter((entry) => entry.profile.preferredGender === query.preferredGender)
  }
  return paginate(list, query)
})

register('GET', /^\/housemate-profiles\/([^/]+)$/, ({ match }) => {
  const entry = housemateProfiles.find((e) => e.user.userId === match[1])
  if (!entry) throw notFound()
  return entry
})

// Roommate profile (mine)
register('GET', /^\/users\/me\/roommate-profile$/, () => ({
  exists: store.myRoommateProfile !== null,
  profile: store.myRoommateProfile,
}))

register('PATCH', /^\/users\/me\/roommate-profile$/, ({ body }) => {
  const now = new Date().toISOString()
  store.myRoommateProfile = {
    ...(store.myRoommateProfile ?? {
      createdAt: now,
      updatedAt: now,
    }),
    ...(body as Record<string, unknown>),
    updatedAt: now,
  } as typeof store.myRoommateProfile
  return { exists: true, profile: store.myRoommateProfile }
})

register('DELETE', /^\/users\/me\/roommate-profile$/, () => {
  const existed = store.myRoommateProfile !== null
  store.myRoommateProfile = null
  return { success: true, deleted: existed }
})

// Users/me read & update
register('GET', /^\/users\/me$/, () => store.currentUser)

register('PATCH', /^\/users\/me$/, ({ body }) => {
  store.currentUser = { ...store.currentUser, ...(body as Partial<typeof store.currentUser>) }
  return store.currentUser
})

// ── Error helpers ───────────────────────────────────────

interface MockError extends Error {
  status?: number
}

const notFound = (): MockError => {
  const error: MockError = new Error('Mock 404: not found')
  error.status = 404
  return error
}

// ── Adapter ─────────────────────────────────────────────

export const mockAdapter: AxiosAdapter = async (config) => {
  await sleep(DELAY_MS)

  const { path, query } = splitUrl(config.url ?? '')
  const method = (config.method ?? 'get').toUpperCase()
  const body = safeParse(config.data)

  for (const route of routes) {
    if (route.method !== method) continue
    const match = path.match(route.regex)
    if (!match) continue

    try {
      const data = await route.handler({ match, query, body, config })
      return makeResponse(data, config)
    } catch (handlerError) {
      const mockError = handlerError as MockError
      const status = mockError.status ?? 500
      // eslint-disable-next-line no-console
      console.warn(`[mock] ${method} ${path} → ${status}`, mockError.message)
      const axiosError: Error & { response?: AxiosResponse; config?: InternalAxiosRequestConfig; isAxiosError?: boolean } =
        new Error(mockError.message)
      axiosError.response = {
        data: { message: mockError.message },
        status,
        statusText: String(status),
        headers: {},
        config,
      }
      axiosError.config = config
      axiosError.isAxiosError = true
      throw axiosError
    }
  }

  // eslint-disable-next-line no-console
  console.warn(`[mock] unhandled ${method} ${path}`)
  const axiosError: Error & { response?: AxiosResponse; config?: InternalAxiosRequestConfig; isAxiosError?: boolean } =
    new Error(`[mock] unhandled ${method} ${path}`)
  axiosError.response = {
    data: { message: 'Not Found' },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
  }
  axiosError.config = config
  axiosError.isAxiosError = true
  throw axiosError
}
