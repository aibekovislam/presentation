'use client'

import React from 'react'
import { createPortal } from 'react-dom'

import { Heart, X } from 'lucide-react'

import { Link } from '@/i18n/navigation'

import cls from './auth-modal.module.css'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handler)

    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div className={cls.modalOverlay} onClick={onClose}>
      <div className={cls.authModal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={cls.modalXBtn} onClick={onClose} aria-label="Закрыть">
          <X size={20} />
        </button>
        <div className={cls.authModalBody}>
          <div className={cls.authModalIcon}>
            <Heart size={32} color="#ff385c" fill="#ff385c" />
          </div>
          <h2 className={cls.authModalTitle}>Войдите, чтобы сохранять</h2>
          <p className={cls.authModalSub}>
            Сохраняйте понравившиеся объявления и возвращайтесь к ним в любое время
          </p>
          <Link href="/auth/login" className={cls.authModalBtn} onClick={onClose}>
            Войти
          </Link>
          <Link href="/auth/register" className={cls.authModalBtnOutline} onClick={onClose}>
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )
}
