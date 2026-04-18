'use client'

import React from 'react'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import cls from './ads-filters.module.css'

export interface FilterValues {
  q: string
  city: string
  minPrice: string
  maxPrice: string
  sortBy: string
  [key: string]: string
}

interface SelectOption {
  value: string
  label: string
}

interface FilterField {
  key: string
  label: string
  type: 'select'
  options: SelectOption[]
}

interface AdsFiltersProps {
  values: FilterValues
  onChange: (values: FilterValues) => void
  onSubmit: () => void
  extraFields?: FilterField[]
}

export const AdsFilters: React.FC<AdsFiltersProps> = ({
  values,
  onChange,
  onSubmit,
  extraFields = [],
}) => {
  const t = useTranslations('Ads.filters')
  const [expanded, setExpanded] = React.useState(false)

  const set = (key: string, value: string) => {
    onChange({ ...values, [key]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const hasActiveFilters =
    values.city || values.minPrice || values.maxPrice || extraFields.some((f) => values[f.key])

  const clearFilters = () => {
    const cleared: FilterValues = { q: values.q, city: '', minPrice: '', maxPrice: '', sortBy: values.sortBy }

    extraFields.forEach((f) => (cleared[f.key] = ''))
    onChange(cleared)
    onSubmit()
  }

  return (
    <form className={cls.wrap} onSubmit={handleSubmit}>
      <div className={cls.topRow}>
        <div className={cls.searchWrap}>
          <Search size={16} className={cls.searchIcon} />
          <input
            type="text"
            className={cls.searchInput}
            placeholder={t('search')}
            value={values.q}
            onChange={(e) => set('q', e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`${cls.filterToggle} ${expanded ? cls.filterToggleActive : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={16} />
          <span>{t('filters')}</span>
          {hasActiveFilters && <span className={cls.filterDot} />}
        </button>

        <select
          className={cls.sortSelect}
          value={values.sortBy}
          onChange={(e) => {
            set('sortBy', e.target.value)
            onSubmit()
          }}
        >
          <option value="publishedAt">{t('sortNew')}</option>
          <option value="price">{t('sortPrice')}</option>
        </select>

        <button type="submit" className={cls.searchBtn}>
          {t('apply')}
        </button>
      </div>

      {expanded && (
        <div className={cls.filtersRow}>
          <input
            type="text"
            className={cls.filterInput}
            placeholder={t('city')}
            value={values.city}
            onChange={(e) => set('city', e.target.value)}
          />

          <div className={cls.priceRange}>
            <input
              type="number"
              className={cls.filterInput}
              placeholder={t('priceFrom')}
              value={values.minPrice}
              onChange={(e) => set('minPrice', e.target.value)}
            />
            <span className={cls.priceDash}>—</span>
            <input
              type="number"
              className={cls.filterInput}
              placeholder={t('priceTo')}
              value={values.maxPrice}
              onChange={(e) => set('maxPrice', e.target.value)}
            />
          </div>

          {extraFields.map((field) => (
            <select
              key={field.key}
              className={cls.filterSelect}
              value={values[field.key] || ''}
              onChange={(e) => set(field.key, e.target.value)}
            >
              <option value="">{field.label}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {hasActiveFilters && (
            <button type="button" className={cls.clearBtn} onClick={clearFilters}>
              <X size={14} />
              {t('clear')}
            </button>
          )}
        </div>
      )}
    </form>
  )
}
