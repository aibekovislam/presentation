'use client'

import React from 'react'

import { User, MapPin, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { HousemateProfileEntry } from '@/lib/ads/types'

import cls from './profile-card.module.css'

interface ProfileCardProps {
  entry: HousemateProfileEntry
}

function formatBudget(min?: number, max?: number, currency?: string): string {
  if (!min && !max) return ''
  const parts: string[] = []
  if (min) parts.push(new Intl.NumberFormat('ru-RU').format(min))
  if (max) parts.push(new Intl.NumberFormat('ru-RU').format(max))
  return parts.join(' — ') + (currency ? ` ${currency}` : '')
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ entry }) => {
  const t = useTranslations('Ads.profiles')
  const { user, profile } = entry

  return (
    <div className={cls.card}>
      <div className={cls.avatarWrap}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.firstName} className={cls.avatar} />
        ) : (
          <div className={cls.avatarPlaceholder}>
            <User size={28} />
          </div>
        )}
      </div>

      <div className={cls.body}>
        <h3 className={cls.name}>
          {user.firstName}
          {user.lastName ? ` ${user.lastName}` : ''}
        </h3>

        {profile.currentHome?.district && (
          <span className={cls.meta}>
            <MapPin size={14} />
            {profile.currentHome.district}
          </span>
        )}

        {profile.budget && (
          <span className={cls.meta}>
            <Wallet size={14} />
            {formatBudget(
              profile.budget.monthlyRentMin ?? undefined,
              profile.budget.monthlyRentMax ?? undefined,
              profile.budget.currencyCode ?? undefined,
            )}
          </span>
        )}

        <div className={cls.tags}>
          {profile.preferredGender && (
            <span className={cls.tag}>{t(`gender.${profile.preferredGender}`)}</span>
          )}
          {profile.minAge && profile.maxAge && (
            <span className={cls.tag}>
              {profile.minAge}–{profile.maxAge} {t('years')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
