'use client'

import React from 'react'

import { Crown, ArrowLeft } from 'lucide-react'

import { useRouter } from '@/i18n/navigation'

import cls from './plus-header.module.css'

export const PlusHeader: React.FC = () => {
  const router = useRouter()

  return (
    <header className={cls.header}>
      <div className={cls.navbar}>
        <button type="button" className={cls.backBtn} onClick={() => router.push('/')}>
          <ArrowLeft size={18} />
          <span>Назад</span>
        </button>

        <div className={cls.brand}>
          <span className={cls.logoText}>
            {'bolmo'.split('').map((ch, i) => (
              <span key={i} className={cls.logoLetter} style={{ animationDelay: `${i * 0.06}s` }}>{ch}</span>
            ))}
          </span>
          <div className={cls.plusBadge}>
            <Crown size={12} />
            <span>Plus</span>
          </div>
        </div>

        <button type="button" className={cls.ctaBtn}>
          <Crown size={14} />
          <span>Подключить</span>
        </button>
      </div>
    </header>
  )
}
