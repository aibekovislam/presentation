'use client'

import React from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { rentAdsAPI } from '@/lib/ads/api'
import type { RentAd, RentFilterParams } from '@/lib/ads/types'
import { useAds } from '@/lib/ads/use-ads'

import { AdsGrid } from './ads-grid'
import { QuickChips } from './quick-chips'
import { SearchBar } from './search-bar'

export const RentFeed: React.FC = () => {
  const t = useTranslations('Ads')
  const locale = useLocale()

  const [location, setLocation] = React.useState('')
  const [rooms, setRooms] = React.useState('')
  const [priceFrom, setPriceFrom] = React.useState('')
  const [priceTo, setPriceTo] = React.useState('')
  const [activeChip, setActiveChip] = React.useState<string | null>(null)
  const [chipFilters, setChipFilters] = React.useState<Record<string, unknown> | null>(null)

  const handleChipClick = (id: string | null, filters: Record<string, unknown> | null) => {
    setActiveChip(id)
    setChipFilters(filters)
  }

  const buildParams = React.useCallback((): RentFilterParams => {
    const params: RentFilterParams = { ...(chipFilters as RentFilterParams) }

    if (location) params.q = location
    if (rooms) params.roomsCount = Number(rooms)
    if (priceFrom) params.minPrice = Number(priceFrom)
    if (priceTo) params.maxPrice = Number(priceTo)
    params.sortBy = 'publishedAt'
    params.sortOrder = 'desc'
    params.lang = locale === 'kg' || locale === 'en' || locale === 'ru' ? locale : 'ru'

    return params
  }, [location, rooms, priceFrom, priceTo, locale, chipFilters])

  const { items, isLoading, totalPages, page, search, goToPage } = useAds<RentAd>(
    rentAdsAPI.list,
    buildParams,
  )

  React.useEffect(() => {
    search()
  }, [chipFilters]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
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
  )
}
