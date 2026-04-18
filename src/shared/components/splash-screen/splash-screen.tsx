'use client'

import React from 'react'

import cls from './splash-screen.module.css'

interface SplashScreenProps {
  ready: boolean
}

const LETTERS = ['b', 'o', 'l', 'm', 'o']

export const SplashScreen: React.FC<SplashScreenProps> = ({ ready }) => {
  const [hidden, setHidden] = React.useState(false)

  React.useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setHidden(true), 700)
    return () => clearTimeout(timer)
  }, [ready])

  if (hidden) return null

  return (
    <div className={`${cls.overlay} ${ready ? cls.overlayHidden : ''}`}>
      <div className={cls.content}>
        <div className={cls.logo}>
          {LETTERS.map((ch, i) => (
            <span key={i} className={cls.letter}>{ch}</span>
          ))}
        </div>
        <div className={cls.dots}>
          <span className={cls.dot} />
          <span className={cls.dot} />
          <span className={cls.dot} />
        </div>
        <span className={cls.tagline}>Найдём жильё для каждого</span>
      </div>
    </div>
  )
}
