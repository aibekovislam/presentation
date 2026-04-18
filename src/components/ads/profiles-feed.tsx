'use client'

import React from 'react'

import { Search, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { housemateProfilesAPI } from '@/lib/ads/api'
import type { HousemateProfileEntry, HousemateProfileFilterParams } from '@/lib/ads/types'

import { ProfileCard } from './profile-card'
import cls from './profiles-feed.module.css'

export const ProfilesFeed: React.FC = () => {
  const t = useTranslations('Ads')

  const [items, setItems] = React.useState<HousemateProfileEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [q, setQ] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const load = React.useCallback(async (targetPage: number, query: string) => {
    setIsLoading(true)
    try {
      const params: HousemateProfileFilterParams = { page: targetPage, limit: 20 }
      if (query) params.q = query
      const data = await housemateProfilesAPI.list(params)
      setItems(data.items)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load(1, '')
  }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(1, q)
  }

  return (
    <section>
      <form className={cls.searchRow} onSubmit={handleSearch}>
        <div className={cls.searchWrap}>
          <Search size={16} className={cls.searchIcon} />
          <input
            type="text"
            className={cls.searchInput}
            placeholder={t('profiles.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button type="submit" className={cls.searchBtn}>
          {t('filters.apply')}
        </button>
      </form>

      {isLoading ? (
        <div className={cls.loaderWrap}>
          <Loader2 size={32} className={cls.spinner} />
        </div>
      ) : items.length === 0 ? (
        <div className={cls.empty}>
          <p className={cls.emptyText}>{t('noResults')}</p>
        </div>
      ) : (
        <div className={cls.grid}>
          {items.map((entry) => (
            <ProfileCard key={entry.user.userId} entry={entry} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={cls.pagination}>
          <button
            className={cls.pageBtn}
            disabled={page <= 1}
            onClick={() => load(page - 1, q)}
          >
            {t('prev')}
          </button>
          <span className={cls.pageInfo}>
            {page} / {totalPages}
          </span>
          <button
            className={cls.pageBtn}
            disabled={page >= totalPages}
            onClick={() => load(page + 1, q)}
          >
            {t('next')}
          </button>
        </div>
      )}
    </section>
  )
}
