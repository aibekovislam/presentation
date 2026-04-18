'use client'

import React from 'react'

import {
  Home,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Copy,
  Check,
  Cigarette,
  PartyPopper,
  UserCheck,
  User,
  Phone,
  MessageCircle,
  BadgeCheck,
  Wallet,
  BedDouble,
  Building2,
  PawPrint,
  Baby,
  DoorOpen,
} from 'lucide-react'

import { useLocale, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { AdCard } from '@/components/ads/ad-card'
import { favoritesAPI, housemateAdsAPI } from '@/lib/ads/api'
import type { HousemateAd } from '@/lib/ads/types'
import { normalizeMediaUrl } from '@/shared/api/axios'
import { AuthModal } from '@/shared/components/auth-modal/auth-modal'
import { useAuth } from '@/shared/providers/auth-provider'

import cls from './co-living-detail.module.css'

// ── Helpers ─────────────────────────────────────────────

function pluralViews(n: number, t: (key: string) => string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return t('views.many')
  if (mod10 === 1) return t('views.one')
  if (mod10 >= 2 && mod10 <= 4) return t('views.few')
  return t('views.many')
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
}

// ── Sub-components ──────────���────────────────────────────

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className={cls.infoChip}>
      <span className={cls.infoChipIcon}>{icon}</span>
      <span>{label}</span>
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

function ResidentBadge({ gender, age, t }: { gender: string; age: number; t: (key: string) => string }) {
  return (
    <div className={cls.residentBadge}>
      <User size={16} />
      <span>{t(`gender.${gender}`)}, {age} {t('years')}</span>
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

// ── Share Modal ────────��──────────────────────────────────

function ShareModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const t = useTranslations('CoLivingDetail')

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
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.4 13.9l-2.95-.924c-.642-.2-.654-.642.135-.953l11.57-4.461c.537-.194 1.006.131.739.659z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className={cls.modalOverlay} onClick={onClose}>
      <div className={cls.shareModal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={cls.modalXBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <h2 className={cls.shareModalTitle}>{t('shareModal.title')}</h2>
        <p className={cls.shareModalSub}>{title}</p>

        <div className={cls.shareIcons}>
          {shareLinks.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={cls.shareIconItem}>
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

// ── Main component ────────���──────────────────────────────

export const CoLivingDetail: React.FC<{ id: string }> = ({ id }) => {
  const [ad, setAd] = React.useState<HousemateAd | null>(null)
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
  const [similarAds, setSimilarAds] = React.useState<HousemateAd[]>([])

  const { isAuthenticated } = useAuth()
  const locale = useLocale()
  const t = useTranslations('CoLivingDetail')

  React.useEffect(() => {
    housemateAdsAPI.getById(id)
      .then((data) => {
        setAd(data)
        if (data.isFavorite !== undefined) setIsFav(data.isFavorite)
      })
      .catch(() => setAd(null))
      .finally(() => setLoading(false))

    housemateAdsAPI.list({ limit: 6 })
      .then((res) => setSimilarAds(res.items.filter((a) => a.id !== id).slice(0, 4)))
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
  }, [galleryOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Check if description overflows
  React.useEffect(() => {
    const el = descRef.current
    if (el) setDescOverflows(el.scrollHeight > el.clientHeight)
  }, [ad])

  if (loading) return <Skeleton />

  if (!ad) {
    return (
      <div className={cls.notFound}>
        <h2>{t('notFound')}</h2>
        <Link href="/co-living">{t('backToList')}</Link>
      </div>
    )
  }

  const photos = (ad.photos ?? []).map(normalizeMediaUrl)
  const hm = ad.housemate
  const totalSlides = photos.length + 1 // +1 for promo slide

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

  const policyLabel = (val?: string) => {
    if (!val) return null
    if (val === 'yes') return <span className={cls.policyYes}><CheckCircle2 size={16} /> {t('policy.yes')}</span>
    if (val === 'no') return <span className={cls.policyNo}><XCircle size={16} /> {t('policy.no')}</span>
    return <span className={cls.policyRare}>{t('policy.rare')}</span>
  }

  return (
    <div className={cls.page}>

      {/* ── Breadcrumb ── */}
      <nav className={cls.breadcrumb}>
        <Link href="/" className={cls.breadcrumbLink}>{t('breadcrumb.home')}</Link>
        <span className={cls.breadcrumbSep}>&middot;</span>
        <Link href="/co-living" className={cls.breadcrumbLink}>{t('breadcrumb.coLiving')}</Link>
        <span className={cls.breadcrumbSep}>&middot;</span>
        <span className={cls.breadcrumbCurrent}>{ad.title}</span>
      </nav>

      {/* ── Title row ── */}
      <div className={cls.titleRow}>
        <div>
          <h1 className={cls.title}>{ad.title}</h1>
          <div className={cls.metaRow}>
            <span className={cls.metaItem}>
              <MapPin size={14} />
              {[ad.city, ad.districtName, ad.streetName].filter(Boolean).join(', ')}
            </span>
            {ad.publishedAt && (
              <span className={cls.metaItem}>
                <Clock size={14} />
                {t('published')} {new Date(ad.publishedAt).toLocaleDateString(locale === 'kg' ? 'ky-KG' : locale === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {ad.viewCount !== undefined && (
              <span className={cls.metaItem}>
                <Eye size={14} />
                {ad.viewCount} {pluralViews(ad.viewCount, t)}
              </span>
            )}
          </div>
        </div>
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

      {/* ── Photo gallery ── */}
      {photos.length > 0 && (
        <div className={cls.gallery}>
          <button type="button" className={cls.galleryMain} onClick={() => openGallery(0)}>
            <img src={photos[0]} alt={ad.title} className={cls.galleryImg} />
          </button>
          {photos.length > 1 && (
            <div className={cls.galleryGrid}>
              {photos.slice(1, 4).map((src, i) => (
                <button key={i} type="button" className={cls.galleryThumb} onClick={() => openGallery(i + 1)}>
                  <img src={src} alt={`${ad.title} ${i + 2}`} className={cls.galleryImg} />
                  {i === 2 && photos.length > 4 && (
                    <div className={cls.galleryMore}>+{photos.length - 4}</div>
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
          )}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className={cls.layout}>

        {/* ── Left: details ���─ */}
        <div className={cls.details}>

          {/* Quick info chips */}
          <div className={cls.chipsRow}>
            <InfoChip
              icon={<Building2 size={18} />}
              label={t(`propertyType.${hm.propertyType}`)}
            />
            <InfoChip
              icon={<BedDouble size={18} />}
              label={t(`offeredPlace.${hm.offeredPlaceType}`)}
            />
            <InfoChip
              icon={<Users size={18} />}
              label={`${hm.residentsCount} ${t('residents')}`}
            />
            {hm.homeInfo?.roomsTotal && (
              <InfoChip
                icon={<DoorOpen size={18} />}
                label={`${hm.homeInfo.roomsTotal} ${t('rooms')}`}
              />
            )}
          </div>

          <div className={cls.divider} />

          {/* Current residents */}
          {hm.currentResidents && (
            <>
              <div className={cls.section}>
                <h2 className={cls.sectionTitle}>{t('currentResidents')}</h2>
                <p className={cls.sectionSubtitle}>
                  {t('residentsCount', { count: hm.currentResidents.residentsCount ?? 0 })}
                  {hm.currentResidents.hasPets && ` \u00b7 ${t('hasPets')}`}
                </p>
                {hm.currentResidents.housemates && hm.currentResidents.housemates.length > 0 && (
                  <div className={cls.residentsGrid}>
                    {hm.currentResidents.housemates.map((mate, i) => (
                      <ResidentBadge key={i} gender={mate.gender ?? 'any'} age={mate.age ?? 0} t={t} />
                    ))}
                  </div>
                )}
              </div>
              <div className={cls.divider} />
            </>
          )}

          {/* Desired roommate */}
          {hm.desiredRoommate && (
            <>
              <div className={cls.section}>
                <h2 className={cls.sectionTitle}>{t('desiredRoommate')}</h2>
                <div className={cls.desiredGrid}>
                  {hm.desiredRoommate.gender && (
                    <div className={cls.desiredItem}>
                      <span className={cls.desiredLabel}>{t('preferredGender')}</span>
                      <span className={cls.desiredValue}>{t(`gender.${hm.desiredRoommate.gender}`)}</span>
                    </div>
                  )}
                  {hm.desiredRoommate.applicantsCount != null && (
                    <div className={cls.desiredItem}>
                      <span className={cls.desiredLabel}>{t('applicantsCount')}</span>
                      <span className={cls.desiredValue}>{hm.desiredRoommate.applicantsCount}</span>
                    </div>
                  )}
                  {hm.desiredRoommate.allowedWithKids != null && (
                    <div className={cls.desiredItem}>
                      <span className={cls.desiredLabel}>{t('withKids')}</span>
                      <span className={cls.desiredValue}>
                        {hm.desiredRoommate.allowedWithKids ? t('policy.yes') : t('policy.no')}
                      </span>
                    </div>
                  )}
                  {hm.desiredRoommate.allowedWithPets != null && (
                    <div className={cls.desiredItem}>
                      <span className={cls.desiredLabel}>{t('withPets')}</span>
                      <span className={cls.desiredValue}>
                        {hm.desiredRoommate.allowedWithPets ? t('policy.yes') : t('policy.no')}
                      </span>
                    </div>
                  )}
                  {hm.desiredRoommate.occupationNotes && (
                    <div className={cls.desiredItem}>
                      <span className={cls.desiredLabel}>{t('occupationNotes')}</span>
                      <span className={cls.desiredValue}>{hm.desiredRoommate.occupationNotes}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={cls.divider} />
            </>
          )}

          {/* Rules */}
          {hm.rules && (
            <>
              <div className={cls.section}>
                <h2 className={cls.sectionTitle}>{t('rules.title')}</h2>
                <div className={cls.rulesList}>
                  {hm.rules.smokingPolicy && (
                    <RuleItem
                      icon={<Cigarette size={20} />}
                      label={t('rules.smoking')}
                      value={policyLabel(hm.rules.smokingPolicy)}
                    />
                  )}
                  {hm.rules.guestsPolicy && (
                    <RuleItem
                      icon={<UserCheck size={20} />}
                      label={t('rules.guests')}
                      value={policyLabel(hm.rules.guestsPolicy)}
                    />
                  )}
                  {hm.rules.partiesPolicy && (
                    <RuleItem
                      icon={<PartyPopper size={20} />}
                      label={t('rules.parties')}
                      value={policyLabel(hm.rules.partiesPolicy)}
                    />
                  )}
                  {hm.allowedWithPets != null && (
                    <RuleItem
                      icon={<PawPrint size={20} />}
                      label={t('rules.pets')}
                      value={hm.allowedWithPets
                        ? <span className={cls.policyYes}><CheckCircle2 size={16} /> {t('policy.yes')}</span>
                        : <span className={cls.policyNo}><XCircle size={16} /> {t('policy.no')}</span>
                      }
                    />
                  )}
                  {hm.desiredRoommate?.allowedWithKids != null && (
                    <RuleItem
                      icon={<Baby size={20} />}
                      label={t('rules.kids')}
                      value={hm.desiredRoommate.allowedWithKids
                        ? <span className={cls.policyYes}><CheckCircle2 size={16} /> {t('policy.yes')}</span>
                        : <span className={cls.policyNo}><XCircle size={16} /> {t('policy.no')}</span>
                      }
                    />
                  )}
                </div>
              </div>
              <div className={cls.divider} />
            </>
          )}

          {/* Description */}
          {ad.description && (
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
          )}

        </div>

        {/* ── Right: sticky card ── */}
        <div className={cls.cardWrap}>
          <div className={cls.card}>
            <div className={cls.cardPriceRow}>
              <span className={cls.cardPrice}>{formatPrice(ad.price, ad.currency)}</span>
              {hm.pricing?.paymentPeriod && (
                <span className={cls.cardPricePer}>/ {t(`paymentPeriod.${hm.pricing.paymentPeriod}`)}</span>
              )}
            </div>

            {ad.compatibility != null && (
              <div className={cls.compatSection}>
                <div className={`${cls.compatBadge} ${ad.compatibility.total >= 70 ? cls.compatHigh : ad.compatibility.total >= 40 ? cls.compatMed : cls.compatLow}`}>
                  <div className={cls.compatCircle}>
                    <svg viewBox="0 0 44 44" className={cls.compatRing}>
                      <circle cx="22" cy="22" r="19" fill="none" strokeWidth="3" stroke="currentColor" opacity="0.15" />
                      <circle cx="22" cy="22" r="19" fill="none" strokeWidth="3" stroke="currentColor"
                        strokeDasharray={`${(ad.compatibility.total / 100) * 119.4} 119.4`}
                        strokeLinecap="round" transform="rotate(-90 22 22)" />
                    </svg>
                    <span className={cls.compatValue}>{ad.compatibility.total}%</span>
                  </div>
                  <div className={cls.compatText}>
                    <span className={cls.compatTitle}>{t('card.compatibility')}</span>
                    <span className={cls.compatDesc}>{t('card.compatibilityDesc')}</span>
                  </div>
                </div>

                {ad.compatibility.breakdown.length > 0 && (
                  <div className={cls.breakdownList}>
                    {ad.compatibility.breakdown.map((item) => (
                      <div key={item.key} className={cls.breakdownItem}>
                        <div className={cls.breakdownHeader}>
                          <span className={cls.breakdownLabel}>{item.label}</span>
                          <span className={cls.breakdownScore}>{item.score}%</span>
                        </div>
                        <div className={cls.breakdownTrack}>
                          <div
                            className={`${cls.breakdownFill} ${item.score >= 70 ? cls.breakdownFillHigh : item.score >= 40 ? cls.breakdownFillMed : cls.breakdownFillLow}`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button type="button" className={cls.contactBtn}>
              <MessageCircle size={18} />
              {t('card.contactOwner')}
            </button>
            {ad.owner?.phone && (
              <button
                type="button"
                className={cls.callBtn}
                onClick={() => setPhoneVisible(true)}
              >
                <Phone size={18} />
                {phoneVisible ? (
                  <a href={`tel:${ad.owner.phone}`} className={cls.phoneLink}>{ad.owner.phone}</a>
                ) : (
                  t('card.showPhone')
                )}
              </button>
            )}

            <div className={cls.cardDivider} />

            <div className={cls.cardDetails}>
              <CardDetailRow
                label={t('card.placeType')}
                value={t(`offeredPlace.${hm.offeredPlaceType}`)}
              />
              <CardDetailRow
                label={t('card.propertyType')}
                value={t(`propertyType.${hm.propertyType}`)}
              />
              <CardDetailRow
                label={t('card.residents')}
                value={String(hm.residentsCount)}
              />
              {hm.pricing?.utilitiesPaymentType && (
                <CardDetailRow
                  label={t('card.utilities')}
                  value={t(`utilities.${hm.pricing.utilitiesPaymentType}`)}
                />
              )}
              {hm.pricing?.depositAmount != null && (
                <CardDetailRow
                  label={t('card.deposit')}
                  value={formatPrice(hm.pricing.depositAmount, ad.currency)}
                />
              )}
              {hm.desiredRoommate?.gender && (
                <CardDetailRow
                  label={t('card.preferredGender')}
                  value={t(`gender.${hm.desiredRoommate.gender}`)}
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
                  {ad.owner?.firstName ?? '\u2014'}{ad.owner?.lastName ? ` ${ad.owner.lastName}` : ''}
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
                <Wallet size={14} />
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
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar ads ── */}
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

      {/* ── Auth modal ─�� */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      {/* ── Share modal ── */}
      {shareModalOpen && <ShareModal title={ad.title} onClose={() => setShareModalOpen(false)} />}

      {/* ── Full-screen gallery modal ── */}
      {galleryOpen && photos.length > 0 && (
        <div className={cls.modal} onClick={() => setGalleryOpen(false)}>
          <button type="button" className={cls.modalClose} onClick={() => setGalleryOpen(false)} aria-label="Close">
            <X size={22} />
          </button>

          <button type="button" className={`${cls.modalNav} ${cls.modalNavPrev}`} onClick={prevPhoto}>
            <ChevronLeft size={28} />
          </button>

          <div className={cls.modalImgWrap} onClick={(e) => e.stopPropagation()}>
            {galleryIndex < photos.length ? (
              <img
                key={galleryIndex}
                src={photos[galleryIndex]}
                alt={`${ad.title} \u2014 ${galleryIndex + 1}`}
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

          <button type="button" className={`${cls.modalNav} ${cls.modalNavNext}`} onClick={nextPhoto}>
            <ChevronRight size={28} />
          </button>

          <div className={cls.modalCounter}>
            {galleryIndex + 1} / {totalSlides}
          </div>

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
