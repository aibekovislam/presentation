'use client'

import React from 'react'

import { ChevronRight, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { RentAd, SaleAd, HousemateAd } from '@/lib/ads/types'

import { AdCard } from './ad-card'
import cls from './ads-grid.module.css'

type Ad = RentAd | SaleAd | HousemateAd

interface AdsGridProps {
  ads: Ad[]
  isLoading: boolean
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  sectionTitle?: string
}

export const AdsGrid: React.FC<AdsGridProps> = ({
  ads,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  sectionTitle,
}) => {
  const t = useTranslations('Ads')

  if (isLoading) {
    return (
      <div className={cls.loaderWrap}>
        <Loader2 size={32} className={cls.spinner} />
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className={cls.empty}>
        <p className={cls.emptyText}>{t('noResults')}</p>
      </div>
    )
  }

  return (
    <div>
      {sectionTitle && (
        <div className={cls.sectionHeader}>
          <h2 className={cls.sectionTitle}>{sectionTitle}</h2>
          <ChevronRight size={18} className={cls.sectionArrow} />
        </div>
      )}

      <div className={cls.grid}>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={cls.pagination}>
          <button
            className={cls.pageBtn}
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            {t('prev')}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true
              if (p === 1 || p === totalPages) return true
              return Math.abs(p - currentPage) <= 1
            })
            .map((p, idx, arr) => {
              const prev = arr[idx - 1]
              const showEllipsis = prev !== undefined && p - prev > 1

              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className={cls.ellipsis}>...</span>}
                  <button
                    className={`${cls.pageBtn} ${p === currentPage ? cls.pageBtnActive : ''}`}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              )
            })}

          <button
            className={cls.pageBtn}
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
