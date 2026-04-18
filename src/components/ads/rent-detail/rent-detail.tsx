'use client'

import React from 'react'

import {
  Wifi,
  Shield,
  Tv,
  Car,
  Dumbbell,
  Waves,
  Home,
  Users,
  Calendar,
  MapPin,
  PawPrint,
  Baby,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Layers,
  Sofa,
  Bath,
  Utensils,
  Copy,
  Check,
  WashingMachine,
  Refrigerator,
  AirVent,
  BedDouble,
  DoorOpen,
  Thermometer,
  Building2,
  Scaling,
  Ruler,
  ArrowUpDown,
  CalendarClock,
  Percent,
  Banknote,
  Cigarette,
  Wine,
  PartyPopper,
  Music,
  UserCheck,
  Moon,
  Sparkles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Footprints,
  User,
  Phone,
  MessageCircle,
  BadgeCheck,
} from 'lucide-react'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'

import { AdCard } from '@/components/ads/ad-card'
import LocationMap from './location-map'
import { favoritesAPI, rentAdsAPI } from '@/lib/ads/api'
import type { ApiLang, RentAd } from '@/lib/ads/types'
import { normalizeMediaUrl } from '@/shared/api/axios'
import { AuthModal } from '@/shared/components/auth-modal/auth-modal'
import { useAuth } from '@/shared/providers/auth-provider'

import cls from './rent-detail.module.css'

// ── Helpers ─────────────────────────────────────────────

function pluralViews(n: number, t: (key: string) => string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return t('views.many')
  if (mod10 === 1) return t('views.one')
  if (mod10 >= 2 && mod10 <= 4) return t('views.few')
  return t('views.many')
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={20} />,
  ac: <AirVent size={20} />,
  air_conditioner: <AirVent size={20} />,
  elevator: <Layers size={20} />,
  security: <Shield size={20} />,
  tv: <Tv size={20} />,
  parking: <Car size={20} />,
  gym: <Dumbbell size={20} />,
  pool: <Waves size={20} />,
  washer: <WashingMachine size={20} />,
  washing_machine: <WashingMachine size={20} />,
  balcony: <DoorOpen size={20} />,
  fridge: <Refrigerator size={20} />,
  refrigerator: <Refrigerator size={20} />,
  heating: <Thermometer size={20} />,
  kitchen: <Utensils size={20} />,
  furniture: <Sofa size={20} />,
  bath: <Bath size={20} />,
  dishwasher: <Utensils size={20} />,
  microwave: <Thermometer size={20} />,
  bedroom: <BedDouble size={20} />,
  building: <Building2 size={20} />,
}

// ── Helpers ─────────────────────────────────────────────

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
}

// ── Sub-components ───────────────────────────────────────

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className={cls.statItem}>
      <span className={cls.statIcon}>{icon}</span>
      <div>
        <p className={cls.statValue}>{value}</p>
        <p className={cls.statLabel}>{label}</p>
      </div>
    </div>
  )
}

function RuleItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className={cls.ruleItem}>
      <span className={cls.ruleIcon}>{icon}</span>
      <div>
        <p className={cls.ruleLabel}>{label}</p>
        <p className={cls.ruleValue}>{value}</p>
      </div>
    </div>
  )
}

function CardDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={cls.cardDetailRow}>
      <span className={cls.cardDetailLabel}>{label}</span>
      <span className={cls.cardDetailValue}>{value}</span>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────

function Skeleton() {
  return (
    <div className={cls.skeleton}>
      <div className={cls.skeletonTitle} />
      <div className={cls.skeletonGallery}>
        <div className={cls.skeletonMain} />
        <div className={cls.skeletonGrid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cls.skeletonThumb} />
          ))}
        </div>
      </div>
      <div className={cls.skeletonBody}>
        <div className={cls.skeletonLeft}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={cls.skeletonBlock} />
          ))}
        </div>
        <div className={cls.skeletonCard} />
      </div>
    </div>
  )
}

// ── Share Modal ───────────────────────────────────────────

function ShareModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const t = useTranslations('RentDetail')

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handler)

    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.122 1.524 5.855L.057 23.25a.75.75 0 0 0 .916.964l5.62-1.524A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 0 1-4.98-1.367l-.356-.213-3.688.999 1.018-3.586-.232-.37A9.75 9.75 0 1 1 12 21.75z"/>
        </svg>
      ),
      color: '#25D366',
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.4 13.9l-2.95-.924c-.642-.2-.654-.642.135-.953l11.57-4.461c.537-.194 1.006.131.739.659z"/>
        </svg>
      ),
      color: '#2AABEE',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="url(#ig-gradient)">
          <defs>
            <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="25%" stopColor="#e6683c" />
              <stop offset="50%" stopColor="#dc2743" />
              <stop offset="75%" stopColor="#cc2366" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      ),
      color: '#E1306C',
    },
  ]

  return (
    <div className={cls.modalOverlay} onClick={onClose}>
      <div className={cls.shareModal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={cls.modalXBtn} onClick={onClose} aria-label="Закрыть">
          <X size={20} />
        </button>
        <h2 className={cls.shareModalTitle}>{t('shareModal.title')}</h2>
        <p className={cls.shareModalSub}>{title}</p>

        <div className={cls.shareIcons}>
          {shareLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cls.shareIconItem}
            >
              <span className={cls.shareIconCircle}>{s.icon}</span>
              <span className={cls.shareIconLabel}>{s.label}</span>
            </a>
          ))}
        </div>

        <div className={cls.shareDivider} />

        <div className={cls.copyRow}>
          <span className={cls.copyUrl}>{url}</span>
          <button type="button" className={cls.copyBtn} onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t('shareModal.copied') : t('shareModal.copy')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────

export const RentDetail: React.FC<{ id: string }> = ({ id }) => {
  const [ad, setAd] = React.useState<RentAd | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [galleryOpen, setGalleryOpen] = React.useState(false)
  const [galleryIndex, setGalleryIndex] = React.useState(0)
  const [showFullDesc, setShowFullDesc] = React.useState(false)
  const [phoneVisible, setPhoneVisible] = React.useState(false)
  const [descOverflows, setDescOverflows] = React.useState(false)
  const descRef = React.useRef<HTMLDivElement>(null)
  const [isFav, setIsFav] = React.useState(false)
  const [authModalOpen, setAuthModalOpen] = React.useState(false)
  const [shareModalOpen, setShareModalOpen] = React.useState(false)
  const [similarAds, setSimilarAds] = React.useState<RentAd[]>([])
  const [stickyNav, setStickyNav] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState('photos')

  const galleryEndRef = React.useRef<HTMLDivElement>(null)
  const sectionRefs = {
    photos: React.useRef<HTMLDivElement>(null),
    description: React.useRef<HTMLDivElement>(null),
    location: React.useRef<HTMLDivElement>(null),
    similar: React.useRef<HTMLDivElement>(null),
  }

  const { isAuthenticated } = useAuth()
  const locale = useLocale()
  const t = useTranslations('RentDetail')

  React.useEffect(() => {
    rentAdsAPI.getById(id)
      .then((data) => {
        setAd(data)
        if (data.isFavorite !== undefined) setIsFav(data.isFavorite)
      })
      .catch(() => setAd(null))
      .finally(() => setLoading(false))

    const lang = (locale === 'ru' || locale === 'en' || locale === 'kg' ? locale : 'ru') as ApiLang
    rentAdsAPI.similar(id, { limit: 6, lang })
      .then(setSimilarAds)
      .catch(() => setSimilarAds([]))
  }, [id, locale])

  // Gallery keyboard navigation
  React.useEffect(() => {
    if (!galleryOpen) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setGalleryIndex((i) => (i + 1) % totalSlides)
      if (e.key === 'ArrowLeft') setGalleryIndex((i) => (i - 1 + totalSlides) % totalSlides)
      if (e.key === 'Escape') setGalleryOpen(false)
    }

    document.addEventListener('keydown', handler)

    return () => document.removeEventListener('keydown', handler)

  }, [galleryOpen])

  // Check if description overflows
  React.useEffect(() => {
    const el = descRef.current
    if (el) setDescOverflows(el.scrollHeight > el.clientHeight)
  }, [ad])

  // Show sticky nav when scrolled past gallery
  React.useEffect(() => {
    const el = galleryEndRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setStickyNav(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [ad])

  // Track active section
  React.useEffect(() => {
    const refs = sectionRefs
    const entries = Object.entries(refs) as [string, React.RefObject<HTMLDivElement | null>][]
    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            const found = entries.find(([, ref]) => ref.current === entry.target)
            if (found) setActiveSection(found[0])
          }
        }
      },
      { rootMargin: '-60px 0px -60% 0px', threshold: 0 },
    )

    for (const [, ref] of entries) {
      if (ref.current) observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [ad]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Skeleton />

  if (!ad) {
    return (
      <div className={cls.notFound}>
        <h2>{t('notFound')}</h2>
        <Link href="/rent">{t('backToList')}</Link>
      </div>
    )
  }

  const photos = (ad.rent.photos ?? ad.photos ?? []).map(normalizeMediaUrl)
  const totalSlides = photos.length + 1 // +1 for promo slide
  const pricePerLabel = ad.rent.rentType === 'daily' ? t('card.perDay') : t('card.perMonth')

  const scrollTo = (key: string) => {
    const ref = sectionRefs[key as keyof typeof sectionRefs]
    const el = ref?.current
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 60
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const navItems = [
    { key: 'photos', label: `${t('nav.photos')} (${photos.length})` },
    { key: 'description', label: t('nav.description') },
    { key: 'location', label: t('nav.location') },
    { key: 'similar', label: t('nav.similar') },
  ]

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setGalleryIndex((i) => (i - 1 + totalSlides) % totalSlides)
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setGalleryIndex((i) => (i + 1) % totalSlides)
  }

  return (
    <div className={cls.page}>

      {/* ── Breadcrumb ── */}
      <nav className={cls.breadcrumb}>
        <Link href="/" className={cls.breadcrumbLink}>{t('breadcrumb.home')}</Link>
        <span className={cls.breadcrumbSep}>·</span>
        <Link href="/rent" className={cls.breadcrumbLink}>{t('breadcrumb.rent')}</Link>
        <span className={cls.breadcrumbSep}>·</span>
        <span className={cls.breadcrumbCurrent}>{ad.title}</span>
      </nav>

      {/* ── Title row ── */}
      <div className={cls.titleRow}>
        <h1 className={cls.title}>{ad.title}</h1>
        <div className={cls.titleActions}>
          <button type="button" className={cls.actionBtn} onClick={() => setShareModalOpen(true)}>
            <Share2 size={16} />
            <span>{t('share')}</span>
          </button>
          <button
            type="button"
            className={`${cls.actionBtn} ${isFav ? cls.actionBtnFav : ''}`}
            onClick={async () => {
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
            }}
          >
            <Heart size={16} fill={isFav ? '#ff385c' : 'none'} stroke={isFav ? '#ff385c' : 'currentColor'} />
            <span>{isFav ? t('saved') : t('save')}</span>
          </button>
        </div>
      </div>

      {/* ── Sticky section nav ── */}
      {stickyNav && (
        <div className={cls.stickyNav}>
          <div className={cls.stickyNavInner}>
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`${cls.stickyNavItem} ${activeSection === item.key ? cls.stickyNavItemActive : ''}`}
                onClick={() => scrollTo(item.key)}
              >
                {item.label}
              </button>
            ))}
            <div className={cls.stickyNavRight}>
              <span className={cls.stickyNavPrice}>{formatPrice(ad.price, ad.currency)} / {pricePerLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo gallery ── */}
      <div ref={sectionRefs.photos} className={cls.gallery}>
        {/* Main large photo */}
        <button
          type="button"
          className={cls.galleryMain}
          onClick={() => openGallery(0)}
          aria-label="Открыть галерею"
        >
          {photos[0] ? (
            <img src={photos[0]} alt={ad.title} className={cls.galleryImg} />
          ) : (
            <div className={cls.galleryPlaceholder}>
              <Home size={48} />
            </div>
          )}
        </button>

        {/* Secondary photos grid */}
        <div className={cls.galleryGrid}>
          {[1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              className={cls.galleryThumb}
              onClick={() => openGallery(i)}
              aria-label={`Фото ${i + 1}`}
              disabled={!photos[i]}
            >
              {photos[i] ? (
                <img src={photos[i]} alt={`${ad.title} ${i + 1}`} className={cls.galleryImg} />
              ) : (
                <div className={cls.galleryPlaceholder} />
              )}
            </button>
          ))}
          <div className={cls.promoThumb}>
            <div className={cls.promoThumbContent}>
              <span className={cls.promoThumbIcon}>bolmo</span>
              <span className={cls.promoThumbText}>{t('promoText')}</span>
            </div>
          </div>
        </div>

        {/* Show all button */}
        {photos.length > 1 && (
          <button
            type="button"
            className={cls.showAllBtn}
            onClick={() => openGallery(0)}
          >
            {t('allPhotos')} ({photos.length})
          </button>
        )}
      </div>
      <div ref={galleryEndRef} />

      {/* ── Two-column layout ── */}
      <div className={cls.layout}>

        {/* ── Left: details ── */}
        <div className={cls.details}>

          {/* Property type + rent type */}
          <div className={cls.section}>
            <h2 className={cls.propertyHeading}>
              {t(`propertyType.${ad.rent.propertyType}`)}
              {' · '}
              {t(`rentType.${ad.rent.rentType}`)}
            </h2>
            <p className={cls.locationLine}>
              <MapPin size={14} />
              {[ad.city, `${ad.rent.address?.street} ${ad.rent.address?.houseNumber}`, ad.rent.address?.landmark].filter(Boolean).join(', ')}
            </p>
            {(ad.publishedAt || ad.viewCount !== undefined) && (
              <div className={cls.metaRow}>
                {ad.publishedAt && (
                  <span className={cls.publishedDate}>
                    <Clock size={14} />
                    {t('published')} {new Date(ad.publishedAt).toLocaleDateString(locale === 'kg' ? 'ky-KG' : locale === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
                {ad.viewCount !== undefined && (
                  <span className={cls.viewCount}>
                    <Eye size={14} />
                    {ad.viewCount} {pluralViews(ad.viewCount, t)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={cls.divider} />

          {/* Key stats */}
          <div className={cls.statsGrid}>
            {ad.rent.totalAreaM2 != null && (
              <StatItem icon={<Scaling size={20} />} label={t('stats.totalArea')} value={`${ad.rent.totalAreaM2} м²`} />
            )}
            {ad.rent.livingAreaM2 != null && (
              <StatItem icon={<Ruler size={20} />} label={t('stats.livingArea')} value={`${ad.rent.livingAreaM2} м²`} />
            )}
            {ad.rent.kitchenAreaM2 != null && (
              <StatItem icon={<Utensils size={20} />} label={t('stats.kitchenArea')} value={`${ad.rent.kitchenAreaM2} м²`} />
            )}
            {ad.rent.roomsCount != null && (
              <StatItem icon={<Home size={20} />} label={t('stats.rooms')} value={ad.rent.roomsCount} />
            )}
            {ad.rent.floor != null && (
              <StatItem icon={<ArrowUpDown size={20} />} label={t('stats.floor')} value={ad.rent.totalFloors ? `${ad.rent.floor} ${t('stats.floorOf')} ${ad.rent.totalFloors}` : ad.rent.floor} />
            )}
            {ad.rent.yearBuilt != null && (
              <StatItem icon={<CalendarClock size={20} />} label={t('stats.yearBuilt')} value={ad.rent.yearBuilt} />
            )}
            {ad.rent.maxResidents != null && (
              <StatItem icon={<Users size={20} />} label={t('stats.maxResidents')} value={ad.rent.maxResidents} />
            )}
            {ad.rent.minLeaseMonths != null && (
              <StatItem icon={<Calendar size={20} />} label={t('stats.minLease')} value={`${ad.rent.minLeaseMonths} ${t('stats.months')}`} />
            )}
          </div>

          <div className={cls.divider} />

          {/* Amenities */}
          {(ad.rent.amenities ?? []).length > 0 && (
            <>
              <div className={cls.section}>
                <h2 className={cls.sectionTitle}>{t('amenities')}</h2>
                <div className={cls.amenitiesGrid}>
                  {(ad.rent.amenities ?? []).map((a) => (
                    <div key={a} className={cls.amenityItem}>
                      <span className={cls.amenityIcon}>
                        {AMENITY_ICONS[a] ?? <CheckCircle2 size={20} />}
                      </span>
                      <span>{t.has(`amenityLabels.${a}`) ? t(`amenityLabels.${a}`) : a}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cls.divider} />
            </>
          )}

          {/* Description */}
          <div ref={sectionRefs.description} />
          {ad.description && (
            <>
              <div className={cls.section}>
                <h2 className={cls.sectionTitle}>{t('description')}</h2>
                <div ref={descRef} className={`${cls.descriptionWrap} ${descOverflows && !showFullDesc ? '' : cls.descriptionFull}`}>
                  <p className={cls.description}>{ad.description}</p>
                  {descOverflows && !showFullDesc && <div className={cls.descriptionFade} />}
                </div>
                {descOverflows && (
                  <button
                    type="button"
                    className={cls.showMoreBtn}
                    onClick={() => setShowFullDesc(!showFullDesc)}
                  >
                    {showFullDesc ? t('showLess') : t('showMore')}
                  </button>
                )}
              </div>
              <div className={cls.divider} />
            </>
          )}

          {/* Rules */}
          <div className={cls.section}>
            <h2 className={cls.sectionTitle}>{t('rules.title')}</h2>
            <div className={cls.rulesList}>
              <RuleItem
                icon={<PawPrint size={20} />}
                label={t('rules.pets')}
                value={ad.rent.allowedWithPets ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.allowed')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.notAllowed')}</span>}
              />
              <RuleItem
                icon={<Baby size={20} />}
                label={t('rules.kids')}
                value={ad.rent.allowedWithKids ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.allowed')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.notAllowed')}</span>}
              />
              <RuleItem
                icon={<Cigarette size={20} />}
                label={t('rules.smoking')}
                value={ad.rent.smokingAllowed ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.allowed')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.notAllowed')}</span>}
              />
              <RuleItem
                icon={<Wine size={20} />}
                label={t('rules.alcohol')}
                value={ad.rent.alcoholAllowed ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.allowed')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.notAllowed')}</span>}
              />
              <RuleItem
                icon={<PartyPopper size={20} />}
                label={t('rules.parties')}
                value={ad.rent.partiesAllowed ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.allowed')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.notAllowed')}</span>}
              />
              <RuleItem
                icon={<Music size={20} />}
                label={t('rules.instruments')}
                value={ad.rent.instrumentsAllowed ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.allowed')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.notAllowed')}</span>}
              />
              <RuleItem
                icon={<UserCheck size={20} />}
                label={t('rules.guests')}
                value={ad.rent.guestsAllowed ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.allowed')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.notAllowed')}</span>}
              />
              {ad.rent.cleaningRequired != null && (
                <RuleItem
                  icon={<Sparkles size={20} />}
                  label={t('rules.cleaning')}
                  value={ad.rent.cleaningRequired ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.yes')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.no')}</span>}
                />
              )}
              {ad.rent.shoesOffRequired != null && (
                <RuleItem
                  icon={<DoorOpen size={20} />}
                  label={t('rules.shoesOff')}
                  value={ad.rent.shoesOffRequired ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={16} /> {t('rules.yes')}</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={16} /> {t('rules.no')}</span>}
                />
              )}
              {(ad.rent.quietHoursFrom || ad.rent.quietHoursTo) && (
                <RuleItem
                  icon={<Moon size={20} />}
                  label={t('rules.quietHours')}
                  value={`${ad.rent.quietHoursFrom ?? '—'} – ${ad.rent.quietHoursTo ?? '—'}`}
                />
              )}
            </div>
            {ad.rent.additionalRulesText && (
              <p className={cls.additionalRules}>{ad.rent.additionalRulesText}</p>
            )}
          </div>

          {/* Address */}
          <div ref={sectionRefs.location} />
          {ad.rent.address && (
            <>
              <div className={cls.divider} />
              <div className={cls.section}>
                <h2 className={cls.sectionTitle}>{t('location')}</h2>
                {(ad.rent.address.street || ad.rent.address.houseNumber) && (
                  <div className={cls.addressRow}>
                    <MapPin size={16} />
                    <span>
                      {[ad.rent.address.street, ad.rent.address.houseNumber].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {ad.rent.address.landmark && (
                  <p className={cls.landmark}>{ad.rent.address.landmark}</p>
                )}
                {ad.rent.address.geo && (
                  <div className={cls.mapWrap}>
                    <LocationMap lat={ad.rent.address.geo.lat} lng={ad.rent.address.geo.lng} />
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* ── Right: sticky card ── */}
        <div className={cls.cardWrap}>
          <div className={cls.card}>
            <div className={cls.cardPriceRow}>
              <span className={cls.cardPrice}>{formatPrice(ad.price, ad.currency)}</span>
              <span className={cls.cardPricePer}>/ {pricePerLabel}</span>
            </div>

            {ad.rent.isNegotiable && (
              <p className={cls.negotiable}>{t('card.negotiable')}</p>
            )}

            <button type="button" className={cls.contactBtn}>
              {t('card.contactOwner')}
            </button>
            {ad.owner?.phone && (
              <button
                type="button"
                className={cls.callBtn}
                onClick={() => setPhoneVisible(true)}
              >
                {phoneVisible ? (
                  <a href={`tel:${ad.owner.phone}`} className={cls.phoneLink}>{ad.owner.phone}</a>
                ) : (
                  t('card.showPhone')
                )}
              </button>
            )}

            <div className={cls.cardDivider} />

            <div className={cls.cardDetails}>
              {ad.rent.utilitiesPaymentType && (
                <CardDetailRow
                  label={t('card.utilities')}
                  value={t(`utilities.${ad.rent.utilitiesPaymentType}`)}
                />
              )}
              {ad.rent.depositAmount != null && (
                <CardDetailRow
                  label={t('card.deposit')}
                  value={formatPrice(ad.rent.depositAmount, ad.currency)}
                />
              )}
              <CardDetailRow
                label={t('card.commission')}
                value={ad.rent.commissionPercent != null ? `${ad.rent.commissionPercent}%` : t('card.noCommission')}
              />
              {ad.rent.prepaymentMonths != null && (
                <CardDetailRow
                  label={t('card.prepayment')}
                  value={`${ad.rent.prepaymentMonths} ${t('stats.months')}`}
                />
              )}
              {ad.rent.minLeaseMonths != null && (
                <CardDetailRow
                  label={t('card.leaseTerm')}
                  value={`${t('card.leaseFrom')} ${ad.rent.minLeaseMonths} ${t('stats.months')}`}
                />
              )}
              {ad.rent.maxResidents != null && (
                <CardDetailRow
                  label={t('card.maxResidents')}
                  value={String(ad.rent.maxResidents)}
                />
              )}
              {(ad.rent.allowedWithKids || ad.rent.allowedWithPets) && (
                <CardDetailRow
                  label={t('card.livingConditions')}
                  value={[
                    ad.rent.allowedWithKids && t('card.withKids'),
                    ad.rent.allowedWithPets && t('card.withPets'),
                  ].filter(Boolean).join(' & ')}
                />
              )}
            </div>

            <p className={cls.cardNote}>{t('card.note')}</p>
          </div>

          {/* ── Owner info ── */}
          <div className={cls.ownerCard}>
            <h3 className={cls.ownerTitle}>{t('owner.title')}</h3>
            <div className={cls.ownerInfo}>
              <div className={cls.ownerAvatar}>
                {ad.owner?.avatarUrl ? (
                  <img src={normalizeMediaUrl(ad.owner.avatarUrl)} alt={ad.owner.firstName} className={cls.ownerAvatarImg} />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className={cls.ownerMeta}>
                <p className={cls.ownerName}>
                  {ad.owner?.firstName ?? '—'}{ad.owner?.lastName ? ` ${ad.owner.lastName}` : ''}
                </p>
                {ad.owner?.contactVerified && (
                  <span className={cls.ownerVerified}>
                    <BadgeCheck size={14} />
                    {t('owner.verified')}
                  </span>
                )}
              </div>
            </div>
            {ad.owner?.createdAt && (
              <p className={cls.ownerSince}>
                {t('owner.onBolmoSince', { date: new Date(ad.owner.createdAt).toLocaleDateString(locale === 'kg' ? 'ky-KG' : locale === 'en' ? 'en-US' : 'ru-RU', { month: 'long', year: 'numeric' }) })}
              </p>
            )}
            {ad.owner?.listingsCount != null && (
              <p className={cls.ownerListings}>
                {ad.owner.listingsCount} {t('owner.listings')}
              </p>
            )}
            <div className={cls.ownerActions}>
              {ad.owner?.phone && (
                <a href={`tel:${ad.owner.phone}`} className={cls.ownerCallBtn}>
                  <Phone size={16} />
                  {t('owner.call')}
                </a>
              )}
              {ad.owner?.phone && (
                <a href={`https://wa.me/${ad.owner.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={cls.ownerMsgBtn}>
                  <MessageCircle size={16} />
                  {t('owner.message')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar ads ── */}
      <div ref={sectionRefs.similar} />
      {similarAds.length > 0 && (
        <div className={cls.similarSection}>
          <h2 className={cls.similarTitle}>{t('similar')}</h2>
          <div className={cls.similarGrid}>
            {similarAds.map((similarAd) => (
              <AdCard key={similarAd.id} ad={similarAd} />
            ))}
          </div>
        </div>
      )}

      {/* ── Auth modal ── */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      {/* ── Share modal ── */}
      {shareModalOpen && <ShareModal title={ad.title} onClose={() => setShareModalOpen(false)} />}

      {/* ── Full-screen gallery modal ── */}
      {galleryOpen && (
        <div className={cls.modal} onClick={() => setGalleryOpen(false)}>
          <button
            type="button"
            className={cls.modalClose}
            onClick={() => setGalleryOpen(false)}
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>

          <button
            type="button"
            className={`${cls.modalNav} ${cls.modalNavPrev}`}
            onClick={prevPhoto}
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={28} />
          </button>

          <div className={cls.modalImgWrap} onClick={(e) => e.stopPropagation()}>
            {galleryIndex < photos.length ? (
              <img
                key={galleryIndex}
                src={photos[galleryIndex]}
                alt={`${ad.title} — фото ${galleryIndex + 1}`}
                className={cls.modalImg}
              />
            ) : (
              <div key="promo" className={cls.promoSlide}>
                <div className={cls.promoSlideInner}>
                  <span className={cls.promoSlideLogo}>bolmo</span>
                  <h3 className={cls.promoSlideTitle}>{t('promoTitle')}</h3>
                  <p className={cls.promoSlideText}>
                    {t('promoDesc')}
                  </p>
                  <a href="mailto:ads@bolmo.kg" className={cls.promoSlideBtn}>{t('promoBtn')}</a>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${cls.modalNav} ${cls.modalNavNext}`}
            onClick={nextPhoto}
            aria-label="Следующее фото"
          >
            <ChevronRight size={28} />
          </button>

          <div className={cls.modalCounter}>
            {galleryIndex + 1} / {totalSlides}
          </div>

          {/* Thumbnails strip */}
          <div className={cls.modalThumbs} onClick={(e) => e.stopPropagation()}>
            {photos.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`${cls.modalThumb} ${i === galleryIndex ? cls.modalThumbActive : ''}`}
                onClick={() => setGalleryIndex(i)}
              >
                <img src={src} alt={`thumb ${i}`} />
              </button>
            ))}
            <button
              type="button"
              className={`${cls.modalThumb} ${cls.modalThumbPromo} ${galleryIndex === photos.length ? cls.modalThumbActive : ''}`}
              onClick={() => setGalleryIndex(photos.length)}
            >
              <span>Ad</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
