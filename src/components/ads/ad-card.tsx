'use client'

import React from 'react'

import { ChevronLeft, ChevronRight, Heart, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { favoritesAPI } from '@/lib/ads/api'
import type { RentAd, SaleAd, HousemateAd } from '@/lib/ads/types'
import { normalizeMediaUrl } from '@/shared/api/axios'
import { AuthModal } from '@/shared/components/auth-modal/auth-modal'
import { useAuth } from '@/shared/providers/auth-provider'

import cls from './ad-card.module.css'

type Ad = RentAd | SaleAd | HousemateAd

interface AdCardProps {
  ad: Ad
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
}

function getAdLink(ad: Ad): string {
  switch (ad.kind) {
    case 'RENT':
      return `/rent/${ad.id}`
    case 'SALE':
      return `/sale/${ad.id}`
    case 'HOUSEMATE':
      return `/co-living/${ad.id}`
  }
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const t = useTranslations('Ads')
  const { isAuthenticated } = useAuth()

  const photos = (ad.kind === 'RENT' ? (ad.rent.photos ?? ad.photos ?? []) : (ad.photos ?? [])).map(normalizeMediaUrl)
  const [currentPhoto, setCurrentPhoto] = React.useState(0)
  const [isFav, setIsFav] = React.useState(ad.isFavorite ?? false)
  const [authModalOpen, setAuthModalOpen] = React.useState(false)

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    setIsFav((prev) => !prev)
    try {
      const { isFavorite } = await favoritesAPI.toggle(ad.id)
      setIsFav(isFavorite)
    } catch {
      setIsFav((prev) => !prev)
    }
  }

  const goLeft = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhoto((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const goRight = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhoto((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }

  const photo = photos[currentPhoto]

  const primaryLocation = ad.districtName ?? ad.city
  const secondaryLocation = ad.streetName
  let subtitle = secondaryLocation ? `${primaryLocation} \u00b7 ${secondaryLocation}` : primaryLocation

  if (ad.kind === 'RENT' && ad.rent.roomsCount) {
    subtitle += ` \u00b7 ${ad.rent.roomsCount} ${t('rooms')}`
  }
  if (ad.kind === 'RENT') {
    subtitle += ` \u00b7 ${t(`rentType.${ad.rent.rentType}`)}`
  }
  if (ad.kind === 'SALE' && ad.sale.totalAreaM2) {
    subtitle += ` \u00b7 ${ad.sale.totalAreaM2} m\u00b2`
  }
  if (ad.kind === 'HOUSEMATE') {
    subtitle += ` \u00b7 ${t(`offeredPlace.${ad.housemate.offeredPlaceType}`)}`
  }

  const priceText = formatPrice(ad.price, ad.currency)
  const pricePerLabel = ad.kind === 'RENT' ? ' / ' + t(`rentType.${ad.rent.rentType}`).toLowerCase() : ''

  return (
    <Link href={getAdLink(ad)} className={cls.card}>
      <div className={cls.imageWrap}>
        {photo ? (
          <img src={photo} alt={ad.title} className={cls.image} loading="lazy" />
        ) : (
          <div className={cls.placeholder}>
            <Home size={32} />
          </div>
        )}

        <button
          type="button"
          className={`${cls.favBtn} ${isFav ? cls.favBtnActive : ''}`}
          onClick={handleFav}
          aria-label={t('favorite')}
        >
          <Heart size={20} fill={isFav ? '#ff385c' : 'rgba(0,0,0,0.5)'} strokeWidth={isFav ? 0 : 2} />
        </button>

        {photos.length > 1 && (
          <>
            <button type="button" className={`${cls.arrowBtn} ${cls.arrowLeft}`} onClick={goLeft} aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            <button type="button" className={`${cls.arrowBtn} ${cls.arrowRight}`} onClick={goRight} aria-label="Next">
              <ChevronRight size={16} />
            </button>
            <div className={cls.dots}>
              {photos.map((_, i) => (
                <span key={i} className={`${cls.dot} ${i === currentPhoto ? cls.dotActive : ''}`} />
              ))}
            </div>
          </>
        )}

        {ad.kind === 'SALE' && (
          <span className={cls.badge}>{t(`propertyType.${ad.sale.propertyType}`)}</span>
        )}
      </div>

      <div className={cls.body}>
        <p className={cls.location}>{subtitle}</p>
        <h3 className={cls.title}>{ad.title}</h3>
        <p className={cls.price}>
          <span className={cls.priceValue}>{priceText}</span>
          <span className={cls.pricePer}>{pricePerLabel}</span>
        </p>
      </div>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </Link>
  )
}
