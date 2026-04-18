'use client'

import React from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { housemateAdsAPI } from '@/lib/ads/api'
import type { HousemateAd, HousemateFilterParams } from '@/lib/ads/types'
import { useAds } from '@/lib/ads/use-ads'

import { AdsFilters, type FilterValues } from './ads-filters'
import { AdsGrid } from './ads-grid'

export const HousemateFeed: React.FC = () => {
  const t = useTranslations('Ads')
  const locale = useLocale()

  const [filters, setFilters] = React.useState<FilterValues>({
    q: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'publishedAt',
    housemateOfferedPlaceType: '',
  })

  const buildParams = React.useCallback((): HousemateFilterParams => {
    const params: HousemateFilterParams = {}

    if (filters.q) params.q = filters.q
    if (filters.city) params.city = filters.city
    if (filters.minPrice) params.minPrice = Number(filters.minPrice)
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice)
    if (filters.sortBy) params.sortBy = filters.sortBy as HousemateFilterParams['sortBy']
    if (filters.housemateOfferedPlaceType)
      params.housemateOfferedPlaceType =
        filters.housemateOfferedPlaceType as HousemateFilterParams['housemateOfferedPlaceType']
    params.sortOrder = 'desc'
    params.lang = locale === 'kg' || locale === 'en' || locale === 'ru' ? locale : 'ru'

    return params
  }, [filters, locale])

  const { items, isLoading, totalPages, page, search, goToPage } = useAds<HousemateAd>(
    housemateAdsAPI.list,
    buildParams,
  )

  const extraFields = React.useMemo(
    () => [
      {
        key: 'housemateOfferedPlaceType',
        label: t('filters.placeType'),
        type: 'select' as const,
        options: [
          { value: 'separate_room', label: t('offeredPlace.separate_room') },
          { value: 'shared_room', label: t('offeredPlace.shared_room') },
          { value: 'bed_place', label: t('offeredPlace.bed_place') },
        ],
      },
    ],
    [t],
  )

  return (
    <section>
      <AdsFilters
        values={filters}
        onChange={setFilters}
        onSubmit={search}
        extraFields={extraFields}
      />
      <AdsGrid
        ads={items}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={goToPage}
      />
    </section>
  )
}
