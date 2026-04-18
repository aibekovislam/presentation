'use client'

import React from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { saleAdsAPI } from '@/lib/ads/api'
import type { SaleAd, SaleFilterParams } from '@/lib/ads/types'
import { useAds } from '@/lib/ads/use-ads'

import { AdsFilters, type FilterValues } from './ads-filters'
import { AdsGrid } from './ads-grid'

export const SaleFeed: React.FC = () => {
  const t = useTranslations('Ads')
  const locale = useLocale()

  const [filters, setFilters] = React.useState<FilterValues>({
    q: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'publishedAt',
    salePropertyType: '',
  })

  const buildParams = React.useCallback((): SaleFilterParams => {
    const params: SaleFilterParams = {}

    if (filters.q) params.q = filters.q
    if (filters.city) params.city = filters.city
    if (filters.minPrice) params.minPrice = Number(filters.minPrice)
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice)
    if (filters.sortBy) params.sortBy = filters.sortBy as SaleFilterParams['sortBy']
    if (filters.salePropertyType)
      params.salePropertyType = filters.salePropertyType as SaleFilterParams['salePropertyType']
    params.sortOrder = 'desc'
    params.lang = locale === 'kg' || locale === 'en' || locale === 'ru' ? locale : 'ru'

    return params
  }, [filters, locale])

  const { items, isLoading, totalPages, page, search, goToPage } = useAds<SaleAd>(
    saleAdsAPI.list,
    buildParams,
  )

  const extraFields = React.useMemo(
    () => [
      {
        key: 'salePropertyType',
        label: t('filters.propertyType'),
        type: 'select' as const,
        options: [
          { value: 'flat', label: t('propertyType.flat') },
          { value: 'house', label: t('propertyType.house') },
          { value: 'cottage', label: t('propertyType.cottage') },
          { value: 'land', label: t('propertyType.land') },
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
