'use client'

import React from 'react'

import { useLocale } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { quickFiltersAPI } from '@/lib/ads/api'
import type { ApiLang, QuickFilterItem, QuickFilterSection } from '@/lib/ads/types'

import cls from './quick-chips.module.css'

function sectionFromPathname(pathname: string): QuickFilterSection {
  if (pathname.startsWith('/co-living')) return 'housemate'
  if (pathname.startsWith('/sale')) return 'sale'

  return 'rent'
}

interface QuickChipsProps {
  activeChip: string | null
  onChipClick: (id: string | null, filters: Record<string, unknown> | null) => void
}

export const QuickChips: React.FC<QuickChipsProps> = ({ activeChip, onChipClick }) => {
  const locale = useLocale()
  const pathname = usePathname()
  const section = sectionFromPathname(pathname)
  const lang = (locale === 'en' || locale === 'kg' || locale === 'ru' ? locale : 'ru') as ApiLang

  const [chips, setChips] = React.useState<QuickFilterItem[]>([])

  React.useEffect(() => {
    quickFiltersAPI
      .get(lang)
      .then((data) => {
        setChips(data[section] ?? [])
      })
      .catch(() => {
        setChips([])
      })
  }, [lang, section])

  if (chips.length === 0) return null

  return (
    <div className={cls.wrap}>
      <div className={cls.row}>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`${cls.chip} ${activeChip === chip.id ? cls.chipActive : ''}`}
            onClick={() => onChipClick(
              activeChip === chip.id ? null : chip.id,
              activeChip === chip.id ? null : chip.filters,
            )}
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
