import { currentUser, housemateAds, rentAds, saleAds } from './data'

import type { AuthUser } from '@/lib/auth/types'
import type { HousemateProfile } from '@/lib/ads/types'

// In-memory mutable state for the mock backend.
// Data lives only for the current browser session.

export const store = {
  currentUser: { ...currentUser } as AuthUser,
  favorites: new Set<string>(),
  rentAds: [...rentAds],
  saleAds: [...saleAds],
  housemateAds: [...housemateAds],
  myRoommateProfile: null as HousemateProfile | null,
}

export const mkId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`
