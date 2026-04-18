'use client'

import React from 'react'

import { Crown, Megaphone, X } from 'lucide-react'

import cls from './top-ad-banner.module.css'

type BannerVariant = 'ads' | 'plus'

const BANNERS: Record<BannerVariant, {
  icon: React.ReactNode
  className: string
  content: React.ReactNode
}> = {
  ads: {
    icon: <Megaphone size={28} />,
    className: '',
    content: (
      <p>
        <strong>Реклама на bolmo</strong> — привлекайте тысячи клиентов каждый день.
        <a href="mailto:ads@bolmo.kg">Разместить рекламу →</a>
      </p>
    ),
  },
  plus: {
    icon: <Crown size={28} />,
    className: 'plus',
    content: (
      <p>
        <strong>bolmo Plus</strong> — продвигайте объявления, получайте больше просмотров и закрывайте сделки быстрее.
        <a href="/plus">Подключить Plus →</a>
      </p>
    ),
  },
}

function pickRandom(): BannerVariant {
  const variants: BannerVariant[] = ['ads', 'plus']
  return variants[Math.floor(Math.random() * variants.length)]
}

export const TopAdBanner: React.FC = () => {
  const [visible, setVisible] = React.useState(true)
  const [variant, setVariant] = React.useState<BannerVariant | null>(null)

  React.useEffect(() => {
    setVariant(pickRandom())
  }, [])

  if (!visible || !variant) return null

  const banner = BANNERS[variant]

  return (
    <div className={`${cls.banner} ${banner.className ? cls[banner.className] : ''}`}>
      <div className={`${cls.sparkle} ${cls.sparkle1}`} />
      <div className={`${cls.sparkle} ${cls.sparkle2}`} />
      <div className={`${cls.sparkle} ${cls.sparkle3}`} />
      <div className={`${cls.sparkle} ${cls.sparkle4}`} />
      <div className={`${cls.sparkle} ${cls.sparkle5}`} />
      <div className={`${cls.sparkle} ${cls.sparkle6}`} />
      <div className={cls.inner}>
        <span className={cls.icon}>{banner.icon}</span>
        <div className={cls.text}>{banner.content}</div>
        <button type="button" className={cls.close} onClick={() => setVisible(false)} aria-label="Закрыть">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
