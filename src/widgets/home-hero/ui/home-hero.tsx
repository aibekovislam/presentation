'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { AdsGrid } from '@/components/ads/ads-grid'
import { QuickChips } from '@/components/ads/quick-chips'
import { SearchBar } from '@/components/ads/search-bar'
import { rentAdsAPI } from '@/lib/ads/api'
import type { RentAd, RentFilterParams } from '@/lib/ads/types'
import { useAds } from '@/lib/ads/use-ads'
import { SplashScreen } from '@/shared/components/splash-screen/splash-screen'

export const HomeHero: React.FC = () => {
  const t = useTranslations('Ads')

  const [location, setLocation] = React.useState('')
  const [rooms, setRooms] = React.useState('')
  const [priceFrom, setPriceFrom] = React.useState('')
  const [priceTo, setPriceTo] = React.useState('')
  const [activeChip, setActiveChip] = React.useState<string | null>(null)
  const [chipFilters, setChipFilters] = React.useState<Record<string, unknown> | null>(null)
  const [initialLoaded, setInitialLoaded] = React.useState(false)

  const handleChipClick = (id: string | null, filters: Record<string, unknown> | null) => {
    setActiveChip(id)
    setChipFilters(filters)
  }

  const buildParams = React.useCallback((): RentFilterParams => {
    const params: RentFilterParams = { ...chipFilters as RentFilterParams }

    if (location) params.q = location
    if (rooms) params.roomsCount = Number(rooms)
    if (priceFrom) params.minPrice = Number(priceFrom)
    if (priceTo) params.maxPrice = Number(priceTo)
    params.sortBy = 'publishedAt'
    params.sortOrder = 'desc'

    return params
  }, [location, rooms, priceFrom, priceTo, chipFilters])

  const { items, isLoading, totalPages, page, search, goToPage } = useAds<RentAd>(
    rentAdsAPI.list,
    buildParams,
  )

  React.useEffect(() => {
    search()
  }, [chipFilters])

  React.useEffect(() => {
    if (!isLoading && !initialLoaded) {
      setInitialLoaded(true)
    }
  }, [isLoading, initialLoaded])

  return (
    <>
      <SplashScreen ready={initialLoaded} />
      <section style={{ opacity: initialLoaded ? 1 : 0, transition: 'opacity 0.5s ease 0.15s' }}>
        <SearchBar
          location={location}
          rooms={rooms}
          priceFrom={priceFrom}
          priceTo={priceTo}
          onLocationChange={setLocation}
          onRoomsChange={setRooms}
          onPriceFromChange={setPriceFrom}
          onPriceToChange={setPriceTo}
          onSubmit={search}
        />

        <QuickChips activeChip={activeChip} onChipClick={handleChipClick} />

        <AdsGrid
          ads={items}
          isLoading={isLoading}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={goToPage}
          sectionTitle={t('sections.rentApartments')}
        />
      </section>
    </>
  )
}
