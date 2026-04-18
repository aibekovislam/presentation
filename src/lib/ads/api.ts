import api, { normalizeMediaUrl } from '@/shared/api/axios'

import type {
  RentAd,
  CreateRentAdRequest,
  RentFilterParams,
  SaleAd,
  CreateSaleAdRequest,
  SaleFilterParams,
  HousemateAd,
  CreateHousemateAdRequest,
  HousemateFilterParams,
  HousemateProfileEntry,
  HousemateProfileFilterParams,
  PaginatedResponse,
  PublishResponse,
  ArchiveResponse,
  QuickFiltersResponse,
  ApiLang,
  FavoriteItem,
  FavoriteToggleResponse,
  FavoriteListParams,
  RoommateProfileResponse,
  UpdateRoommateProfileRequest,
} from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toQuery(params: any): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )

  if (entries.length === 0) return ''

  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

// ── Rent Ads ────────────────────────────────────────────

export const rentAdsAPI = {
  list: (params: RentFilterParams = {}): Promise<PaginatedResponse<RentAd>> =>
    api.get<PaginatedResponse<RentAd>>(
      `/rent-ads${toQuery(params)}`,
    ).then(r => r.data),

  getById: (adId: string) =>
    api.get<RentAd>(`/rent-ads/${adId}`).then(r => r.data),

  myAds: (params: RentFilterParams = {}): Promise<PaginatedResponse<RentAd>> =>
    api.get<PaginatedResponse<RentAd>>(
      `/rent-ads/me${toQuery(params)}`,
    ).then(r => r.data),

  myAdById: (adId: string) =>
    api.get<RentAd>(`/rent-ads/me/${adId}`).then(r => r.data),

  create: (data: CreateRentAdRequest) =>
    api.post<RentAd>('/rent-ads', data).then(r => r.data),

  update: (adId: string, data: Partial<CreateRentAdRequest>) =>
    api.patch<RentAd>(`/rent-ads/${adId}`, data).then(r => r.data),

  publish: (adId: string) =>
    api.post<PublishResponse>(`/rent-ads/${adId}/publish`).then(r => r.data),

  archive: (adId: string) =>
    api.post<ArchiveResponse>(`/rent-ads/${adId}/archive`).then(r => r.data),

  activate: (adId: string) =>
    api.post<{ success: boolean; isActive: boolean }>(`/rent-ads/${adId}/activate`).then(r => r.data),

  deactivate: (adId: string) =>
    api.post<{ success: boolean; isActive: boolean }>(`/rent-ads/${adId}/deactivate`).then(r => r.data),

  similar: (adId: string, params: { limit?: number; lang?: ApiLang } = {}): Promise<RentAd[]> =>
    api.get<RentAd[]>(`/rent-ads/${adId}/similar${toQuery(params)}`).then(r => r.data),
}

// ── Sale Ads ────────────────────────────────────────────

export const saleAdsAPI = {
  list: (params: SaleFilterParams = {}): Promise<PaginatedResponse<SaleAd>> =>
    api.get<PaginatedResponse<SaleAd>>(
      `/sale-ads${toQuery(params)}`,
    ).then(r => r.data),

  getById: (adId: string) =>
    api.get<SaleAd>(`/sale-ads/${adId}`).then(r => r.data),

  myAds: (params: SaleFilterParams = {}): Promise<PaginatedResponse<SaleAd>> =>
    api.get<PaginatedResponse<SaleAd>>(
      `/sale-ads/me${toQuery(params)}`,
    ).then(r => r.data),

  myAdById: (adId: string) =>
    api.get<SaleAd>(`/sale-ads/me/${adId}`).then(r => r.data),

  create: (data: CreateSaleAdRequest) =>
    api.post<SaleAd>('/sale-ads', data).then(r => r.data),

  update: (adId: string, data: Partial<CreateSaleAdRequest>) =>
    api.patch<SaleAd>(`/sale-ads/${adId}`, data).then(r => r.data),

  publish: (adId: string) =>
    api.post<PublishResponse>(`/sale-ads/${adId}/publish`).then(r => r.data),

  archive: (adId: string) =>
    api.post<ArchiveResponse>(`/sale-ads/${adId}/archive`).then(r => r.data),

  activate: (adId: string) =>
    api.post<{ success: boolean; isActive: boolean }>(`/sale-ads/${adId}/activate`).then(r => r.data),

  deactivate: (adId: string) =>
    api.post<{ success: boolean; isActive: boolean }>(`/sale-ads/${adId}/deactivate`).then(r => r.data),
}

// ── Housemate Ads ───────────────────────────────────────

export const housemateAdsAPI = {
  list: (params: HousemateFilterParams = {}): Promise<PaginatedResponse<HousemateAd>> =>
    api.get<PaginatedResponse<HousemateAd>>(
      `/housemate-ads${toQuery(params)}`,
    ).then(r => r.data),

  getById: (adId: string) =>
    api.get<HousemateAd>(`/housemate-ads/${adId}`).then(r => r.data),

  myAds: (params: HousemateFilterParams = {}): Promise<PaginatedResponse<HousemateAd>> =>
    api.get<PaginatedResponse<HousemateAd>>(
      `/housemate-ads/me${toQuery(params)}`,
    ).then(r => r.data),

  myAdById: (adId: string) =>
    api.get<HousemateAd>(`/housemate-ads/me/${adId}`).then(r => r.data),

  create: (data: CreateHousemateAdRequest) =>
    api.post<HousemateAd>('/housemate-ads', data).then(r => r.data),

  update: (adId: string, data: Partial<CreateHousemateAdRequest>) =>
    api.patch<HousemateAd>(`/housemate-ads/${adId}`, data).then(r => r.data),

  publish: (adId: string) =>
    api.post<PublishResponse>(`/housemate-ads/${adId}/publish`).then(r => r.data),

  archive: (adId: string) =>
    api.post<ArchiveResponse>(`/housemate-ads/${adId}/archive`).then(r => r.data),

  activate: (adId: string) =>
    api.post<{ success: boolean; isActive: boolean }>(`/housemate-ads/${adId}/activate`).then(r => r.data),

  deactivate: (adId: string) =>
    api.post<{ success: boolean; isActive: boolean }>(`/housemate-ads/${adId}/deactivate`).then(r => r.data),

  similar: (adId: string, params: { limit?: number; lang?: ApiLang } = {}): Promise<HousemateAd[]> =>
    api.get<HousemateAd[]>(`/housemate-ads/${adId}/similar${toQuery(params)}`).then(r => r.data),
}

// ── Quick Filters ───────────────────────────────────────

export const quickFiltersAPI = {
  get: (lang?: ApiLang): Promise<QuickFiltersResponse> =>
    api
      .get<QuickFiltersResponse>(
        `/quick-filters${toQuery({
          lang,
        })}`,
      )
      .then(r => r.data),
}

// ── Favorites ──────────────────────────────────────────

export const favoritesAPI = {
  toggle: (postId: string): Promise<FavoriteToggleResponse> =>
    api.post<FavoriteToggleResponse>(`/favorites/${postId}/toggle`).then(r => r.data),

  list: (params: FavoriteListParams = {}): Promise<PaginatedResponse<FavoriteItem>> =>
    api.get<PaginatedResponse<FavoriteItem>>(`/favorites${toQuery(params)}`).then(r => r.data),

  check: (postId: string): Promise<{ isFavorite: boolean }> =>
    api.get<{ isFavorite: boolean }>(`/favorites/${postId}/check`).then(r => r.data),
}

// ── Media Upload ───────────────────────────────────────

export const mediaAPI = {
  upload: async (files: File[]): Promise<string[]> => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    const res = await api.post<{ files: { url: string; key: string }[] }>(
      '/media/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )

    return res.data.files.map(f => f.url)
  },
}

// ── Housemate Profiles ──────────────────────────────────

export const housemateProfilesAPI = {
  list: (params: HousemateProfileFilterParams = {}): Promise<PaginatedResponse<HousemateProfileEntry>> =>
    api.get<PaginatedResponse<HousemateProfileEntry>>(
      `/housemate-profiles${toQuery(params)}`,
    ).then(r => r.data),

  getByUserId: (userId: string) =>
    api.get<HousemateProfileEntry>(
      `/housemate-profiles/${userId}`,
    ).then(r => r.data),
}

// ── My Roommate Profile ───────────────────────────────

export const roommateProfileAPI = {
  get: (): Promise<RoommateProfileResponse> =>
    api.get<RoommateProfileResponse>('/users/me/roommate-profile').then(r => r.data),

  update: (data: UpdateRoommateProfileRequest): Promise<RoommateProfileResponse> =>
    api.patch<RoommateProfileResponse>('/users/me/roommate-profile', data).then(r => r.data),

  delete: (): Promise<{ success: boolean; deleted: boolean }> =>
    api.delete<{ success: boolean; deleted: boolean }>('/users/me/roommate-profile').then(r => r.data),
}
