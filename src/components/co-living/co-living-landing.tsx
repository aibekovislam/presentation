'use client'

import React from 'react'

import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  Home,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Cigarette,
  PawPrint,
  PartyPopper,
  User,
  MapPin,
  Wallet,
  Shield,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Banknote,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'


import { Link } from '@/i18n/navigation'
import { housemateAdsAPI, housemateProfilesAPI, favoritesAPI, roommateProfileAPI } from '@/lib/ads/api'
import type {
  HousemateAd,
  HousemateFilterParams,
  HousemateProfileEntry,
  HousemateProfileFilterParams,
} from '@/lib/ads/types'
import { normalizeMediaUrl } from '@/shared/api/axios'
import { useAds } from '@/lib/ads/use-ads'
import { AuthModal } from '@/shared/components/auth-modal/auth-modal'
import { useAuth } from '@/shared/providers/auth-provider'

import cls from './co-living-landing.module.css'

// ── Intersection Observer hook for scroll animations ──

function useInView(threshold = 0.1) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

// ── Helper ──

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
}

// ═══════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════

const HeroSection: React.FC = () => {
  const t = useTranslations('CoLivingLanding.hero')

  return (
    <section className={cls.hero}>
      <div className={cls.heroBg} />
      <div className={cls.heroContent}>
        <div className={cls.heroLeft}>
          <span className={cls.heroBadge}>
            <Sparkles size={14} />
            {t('badge')}
          </span>
          <h1 className={cls.heroTitle}>{t('title')}</h1>
          <p className={cls.heroSubtitle}>{t('subtitle')}</p>
          <div className={cls.heroFeatures}>
            {(['verified', 'matching', 'safe'] as const).map((key) => (
              <div key={key} className={cls.heroFeature}>
                <div className={cls.heroFeatureIcon}>
                  {key === 'verified' && <Shield size={18} />}
                  {key === 'matching' && <Users size={18} />}
                  {key === 'safe' && <MessageCircle size={18} />}
                </div>
                <div>
                  <p className={cls.heroFeatureTitle}>{t(`features.${key}.title`)}</p>
                  <p className={cls.heroFeatureDesc}>{t(`features.${key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={cls.heroRight}>
          <div className={cls.heroCards}>
            <div className={`${cls.heroCard} ${cls.heroCard1}`}>
              <div className={cls.heroCardAvatar}>
                <User size={20} />
              </div>
              <div>
                <p className={cls.heroCardName}>{t('card1.name')}</p>
                <p className={cls.heroCardInfo}>{t('card1.info')}</p>
              </div>
              <span className={cls.heroCardTag}>{t('card1.tag')}</span>
            </div>
            <div className={`${cls.heroCard} ${cls.heroCard2}`}>
              <div className={cls.heroCardAvatar}>
                <User size={20} />
              </div>
              <div>
                <p className={cls.heroCardName}>{t('card2.name')}</p>
                <p className={cls.heroCardInfo}>{t('card2.info')}</p>
              </div>
              <span className={cls.heroCardTag}>{t('card2.tag')}</span>
            </div>
            <div className={`${cls.heroCard} ${cls.heroCard3}`}>
              <div className={`${cls.heroCardAvatar} ${cls.heroCardAvatarMatch}`}>
                <Heart size={16} />
              </div>
              <div>
                <p className={cls.heroCardName}>{t('match')}</p>
                <p className={cls.heroCardInfo}>{t('matchDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// CO-LIVING AD CARD
// ═══════════════════════════════════════════════════════════

const CoLivingAdCard: React.FC<{ ad: HousemateAd }> = ({ ad }) => {
  const t = useTranslations('CoLivingLanding.card')
  const { isAuthenticated } = useAuth()

  const photos = (ad.photos ?? []).map(normalizeMediaUrl)
  const [currentPhoto, setCurrentPhoto] = React.useState(0)
  const [isFav, setIsFav] = React.useState(ad.isFavorite ?? false)
  const [authModalOpen, setAuthModalOpen] = React.useState(false)

  const hm = ad.housemate

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { setAuthModalOpen(true); return }
    setIsFav((p) => !p)
    try {
      const { isFavorite } = await favoritesAPI.toggle(ad.id)
      setIsFav(isFavorite)
    } catch { setIsFav((p) => !p) }
  }

  const goLeft = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCurrentPhoto((p) => (p > 0 ? p - 1 : photos.length - 1))
  }
  const goRight = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCurrentPhoto((p) => (p < photos.length - 1 ? p + 1 : 0))
  }

  // Rule tags
  const rules: string[] = []
  if (hm.rules?.smokingPolicy === 'no') rules.push(t('noSmoking'))
  if (hm.rules?.partiesPolicy === 'no') rules.push(t('noParties'))
  if (hm.rules?.petsPolicy === 'no') rules.push(t('noPets'))
  else if (hm.rules?.petsPolicy) rules.push(t('petsOk'))
  if (hm.rules?.guestsPolicy === 'no') rules.push(t('noGuests'))

  return (
    <Link href={`/co-living/${ad.id}`} className={cls.adCard}>
      {/* ── Photo ── */}
      <div className={cls.adCardImg}>
        {photos[currentPhoto] ? (
          <img src={photos[currentPhoto]} alt={ad.title} className={cls.adCardPhoto} loading="lazy" />
        ) : (
          <div className={cls.adCardPlaceholder}><Home size={32} /></div>
        )}
        <span className={cls.adCardBadge}>{t(`place.${hm.offeredPlaceType}`)}</span>
        <button type="button" className={`${cls.adCardFav} ${isFav ? cls.adCardFavActive : ''}`} onClick={handleFav}>
          <Heart size={18} fill={isFav ? '#ff385c' : 'none'} stroke={isFav ? '#ff385c' : '#111'} strokeWidth={2} />
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" className={`${cls.adCardArrow} ${cls.adCardArrowL}`} onClick={goLeft}><ChevronLeft size={14} /></button>
            <button type="button" className={`${cls.adCardArrow} ${cls.adCardArrowR}`} onClick={goRight}><ChevronRight size={14} /></button>
            <div className={cls.adCardDots}>
              {photos.slice(0, 5).map((_, i) => (
                <span key={i} className={`${cls.adCardDot} ${i === currentPhoto ? cls.adCardDotActive : ''}`} />
              ))}
            </div>
          </>
        )}
        {ad.compatibility != null && (
          <div className={`${cls.adCardMatch} ${ad.compatibility.total >= 70 ? cls.adCardMatchHigh : ad.compatibility.total >= 40 ? cls.adCardMatchMed : cls.adCardMatchLow}`}>
            <div className={cls.adCardMatchCircle}>
              <span className={cls.adCardMatchValue}>{ad.compatibility.total}%</span>
            </div>
            <div className={cls.adCardMatchText}>
              <span className={cls.adCardMatchTitle}>{t('matchTitle')}</span>
              <span className={cls.adCardMatchDesc}>{ad.compatibility.total >= 70 ? t('matchHigh') : ad.compatibility.total >= 40 ? t('matchMed') : t('matchLow')}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className={cls.adCardBody}>
        {/* Price row */}
        <div className={cls.adCardPriceRow}>
          <div className={cls.adCardPriceLeft}>
            <span className={cls.adCardPrice}>{formatPrice(ad.price, ad.currency)}</span>
            {hm.pricing?.paymentPeriod && (
              <span className={cls.adCardPricePer}>/ {t(`period.${hm.pricing.paymentPeriod}`)}</span>
            )}
          </div>
          <span className={cls.adCardArrowIcon}><ArrowUpRight size={16} /></span>
        </div>

        {/* Location + verified */}
        <div className={cls.adCardLocationRow}>
          <span className={cls.adCardLocation}>
            <MapPin size={12} />
            {[ad.city, ad.districtName].filter(Boolean).join(' · ')}
          </span>
          {ad.owner?.contactVerified && (
            <span className={cls.adCardVerified}><BadgeCheck size={13} />{t('verified')}</span>
          )}
        </div>

        {/* Title */}
        <h3 className={cls.adCardTitle}>{ad.title}</h3>

        {/* Description */}
        {ad.description && (
          <p className={cls.adCardDesc}>{ad.description}</p>
        )}

        {/* Info grid 2x2 */}
        <div className={cls.adCardInfoGrid}>
          <div className={cls.adCardInfoItem}>
            <span className={cls.adCardInfoLabel}><Home size={14} />{t('housing')}</span>
            <span className={cls.adCardInfoValue}>{t(`prop.${hm.propertyType}`)}</span>
          </div>
          <div className={cls.adCardInfoItem}>
            <span className={cls.adCardInfoLabel}><Users size={14} />{t('roommates')}</span>
            <span className={cls.adCardInfoValue}>
              {hm.residentsCount ?? 0}{hm.desiredRoommate?.applicantsCount ? ` ${t('of')} ${(hm.residentsCount ?? 0) + hm.desiredRoommate.applicantsCount}` : ''}
            </span>
          </div>
          {hm.pricing?.depositAmount != null && (
            <div className={cls.adCardInfoItem}>
              <span className={cls.adCardInfoLabel}><Banknote size={14} />{t('deposit')}</span>
              <span className={cls.adCardInfoValue}>{formatPrice(hm.pricing.depositAmount, ad.currency)}</span>
            </div>
          )}
          {hm.desiredRoommate?.gender && hm.desiredRoommate.gender !== 'any' && (
            <div className={cls.adCardInfoItem}>
              <span className={cls.adCardInfoLabel}><User size={14} />{t('lookingFor')}</span>
              <span className={cls.adCardInfoValue}>{t(`gender.${hm.desiredRoommate.gender}`)}</span>
            </div>
          )}
        </div>

        {/* Rule tags */}
        {rules.length > 0 && (
          <div className={cls.adCardRules}>
            {rules.map((r, i) => (
              <span key={i} className={cls.adCardRule}>{r}</span>
            ))}
          </div>
        )}

        {/* Owner row */}
        {ad.owner && (
          <div className={cls.adCardOwner}>
            <div className={cls.adCardOwnerLeft}>
              <div className={cls.adCardOwnerAvatar}>
                {ad.owner.avatarUrl
                  ? <img src={normalizeMediaUrl(ad.owner.avatarUrl)} alt="" />
                  : <span>{ad.owner.firstName?.[0] ?? '?'}</span>
                }
              </div>
              <div className={cls.adCardOwnerInfo}>
                <span className={cls.adCardOwnerName}>{ad.owner.firstName}</span>
                {ad.owner.contactVerified && (
                  <span className={cls.adCardOwnerVerified}>{t('profileVerified')}</span>
                )}
              </div>
            </div>
            <span className={cls.adCardOwnerBtn}>{t('details')}</span>
          </div>
        )}
      </div>
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════
// PROFILE CARD (redesigned)
// ═══════════════════════════════════════════════════════════

const ProfileCardNew: React.FC<{ entry: HousemateProfileEntry }> = ({ entry }) => {
  const t = useTranslations('CoLivingLanding.profile')
  const { user, profile } = entry

  const budgetText = (() => {
    if (!profile.budget) return null
    const parts: string[] = []
    if (profile.budget.monthlyRentMin) parts.push(new Intl.NumberFormat('ru-RU').format(profile.budget.monthlyRentMin))
    if (profile.budget.monthlyRentMax) parts.push(new Intl.NumberFormat('ru-RU').format(profile.budget.monthlyRentMax))
    return parts.join(' \u2014 ') + (profile.budget.currencyCode ? ` ${profile.budget.currencyCode}` : '')
  })()

  return (
    <div className={cls.profileCard}>
      <div className={cls.profileCardTop}>
        <div className={cls.profileCardAvatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} />
          ) : (
            <div className={cls.profileCardAvatarPlaceholder}>
              <User size={28} />
            </div>
          )}
        </div>
        <div className={cls.profileCardInfo}>
          <h3 className={cls.profileCardName}>
            {user.firstName}{user.lastName ? ` ${user.lastName}` : ''}
          </h3>
          {profile.currentHome?.district && (
            <span className={cls.profileCardMeta}><MapPin size={13} />{profile.currentHome.district}</span>
          )}
        </div>
      </div>
      {budgetText && (
        <div className={cls.profileCardBudget}>
          <Wallet size={14} />
          <span>{budgetText}</span>
        </div>
      )}
      <div className={cls.profileCardTags}>
        {profile.preferredGender && (
          <span className={cls.profileCardTag}>{t(`gender.${profile.preferredGender}`)}</span>
        )}
        {profile.minAge && profile.maxAge && (
          <span className={cls.profileCardTag}>{profile.minAge}\u2013{profile.maxAge} {t('years')}</span>
        )}
      </div>
      <button type="button" className={cls.profileCardBtn}>
        <MessageCircle size={14} />
        {t('contact')}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ADS FEED
// ═══════════════════════════════════════════════════════════

// ── Deep filter state type ──

interface DeepFilters {
  // Price & payments
  maxDeposit: string
  utilitiesPaymentType: string
  isNegotiable: boolean
  // Property
  propertyType: string
  minRooms: string
  maxRooms: string
  minFloor: string
  maxFloor: string
  hasElevator: boolean
  minArea: string
  maxArea: string
  // Offered place
  furnished: boolean
  minRoomArea: string
  maxRoomArea: string
  // Amenities
  wifi: boolean
  washingMachine: boolean
  fridge: boolean
  kitchen: boolean
  airConditioner: boolean
  balcony: boolean
  parking: boolean
  // Rules
  smokingPolicy: string
  petsPolicy: string
  guestsPolicy: string
  partiesPolicy: string
  // Who lives
  minResidents: string
  maxResidents: string
  hasKids: string
  hasPets: string
  // Who they want
  allowedWithPets: boolean
  allowedWithKids: boolean
  allowedSmoking: boolean
  // Gender & age
  gender: string
  ageMin: string
  ageMax: string
}

const EMPTY_DEEP: DeepFilters = {
  maxDeposit: '', utilitiesPaymentType: '', isNegotiable: false,
  propertyType: '', minRooms: '', maxRooms: '', minFloor: '', maxFloor: '',
  hasElevator: false, minArea: '', maxArea: '',
  furnished: false, minRoomArea: '', maxRoomArea: '',
  wifi: false, washingMachine: false, fridge: false, kitchen: false,
  airConditioner: false, balcony: false, parking: false,
  smokingPolicy: '', petsPolicy: '', guestsPolicy: '', partiesPolicy: '',
  minResidents: '', maxResidents: '', hasKids: '', hasPets: '',
  allowedWithPets: false, allowedWithKids: false, allowedSmoking: false,
  gender: '', ageMin: '', ageMax: '',
}

function deepFiltersCount(d: DeepFilters): number {
  let c = 0
  if (d.maxDeposit) c++
  if (d.utilitiesPaymentType) c++
  if (d.isNegotiable) c++
  if (d.propertyType) c++
  if (d.minRooms || d.maxRooms) c++
  if (d.minFloor || d.maxFloor) c++
  if (d.hasElevator) c++
  if (d.minArea || d.maxArea) c++
  if (d.furnished) c++
  if (d.minRoomArea || d.maxRoomArea) c++
  if (d.wifi) c++
  if (d.washingMachine) c++
  if (d.fridge) c++
  if (d.kitchen) c++
  if (d.airConditioner) c++
  if (d.balcony) c++
  if (d.parking) c++
  if (d.smokingPolicy) c++
  if (d.petsPolicy) c++
  if (d.guestsPolicy) c++
  if (d.partiesPolicy) c++
  if (d.minResidents || d.maxResidents) c++
  if (d.hasKids) c++
  if (d.hasPets) c++
  if (d.allowedWithPets) c++
  if (d.allowedWithKids) c++
  if (d.allowedSmoking) c++
  if (d.gender) c++
  if (d.ageMin || d.ageMax) c++
  return c
}

// ── Deep Filter Modal ──

function DeepFilterModal({
  draft,
  onChange,
  onApply,
  onClose,
}: {
  draft: DeepFilters
  onChange: (d: DeepFilters) => void
  onApply: () => void
  onClose: () => void
}) {
  const t = useTranslations('CoLivingLanding.deepFilters')

  const set = <K extends keyof DeepFilters>(key: K, val: DeepFilters[K]) =>
    onChange({ ...draft, [key]: val })

  const toggle = (key: keyof DeepFilters) =>
    onChange({ ...draft, [key]: !draft[key] })

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className={cls.dfOverlay} onClick={onClose}>
      <div className={cls.dfModal} onClick={(e) => e.stopPropagation()}>
        <div className={cls.dfHeader}>
          <h2 className={cls.dfTitle}>{t('title')}</h2>
          <button type="button" className={cls.dfClose} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={cls.dfBody}>
          {/* A) Price & payments */}
          <div className={cls.dfSection}>
            <h3 className={cls.dfSectionTitle}>{t('pricePayments')}</h3>
            <div className={cls.dfGrid}>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('maxDeposit')}</span>
                <input type="number" className={cls.dfInput} value={draft.maxDeposit} onChange={(e) => set('maxDeposit', e.target.value)} placeholder="0" />
              </label>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('utilitiesType')}</span>
                <select className={cls.dfSelect} value={draft.utilitiesPaymentType} onChange={(e) => set('utilitiesPaymentType', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="included">{t('utilities.included')}</option>
                  <option value="separate">{t('utilities.separate')}</option>
                  <option value="partly">{t('utilities.partly')}</option>
                </select>
              </label>
            </div>
            <label className={cls.dfCheckRow}>
              <input type="checkbox" checked={draft.isNegotiable} onChange={() => toggle('isNegotiable')} />
              <span>{t('negotiable')}</span>
            </label>
          </div>

          {/* B) Property */}
          <div className={cls.dfSection}>
            <h3 className={cls.dfSectionTitle}>{t('property')}</h3>
            <div className={cls.dfGrid}>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('propertyType')}</span>
                <select className={cls.dfSelect} value={draft.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="flat">{t('propTypes.flat')}</option>
                  <option value="house">{t('propTypes.house')}</option>
                  <option value="hostel">{t('propTypes.hostel')}</option>
                  <option value="other">{t('propTypes.other')}</option>
                </select>
              </label>
              <div className={cls.dfRangeRow}>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('roomsFrom')}</span>
                  <input type="number" className={cls.dfInput} value={draft.minRooms} onChange={(e) => set('minRooms', e.target.value)} placeholder="1" />
                </label>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('roomsTo')}</span>
                  <input type="number" className={cls.dfInput} value={draft.maxRooms} onChange={(e) => set('maxRooms', e.target.value)} placeholder="5" />
                </label>
              </div>
              <div className={cls.dfRangeRow}>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('floorFrom')}</span>
                  <input type="number" className={cls.dfInput} value={draft.minFloor} onChange={(e) => set('minFloor', e.target.value)} />
                </label>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('floorTo')}</span>
                  <input type="number" className={cls.dfInput} value={draft.maxFloor} onChange={(e) => set('maxFloor', e.target.value)} />
                </label>
              </div>
              <div className={cls.dfRangeRow}>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('areaFrom')}</span>
                  <input type="number" className={cls.dfInput} value={draft.minArea} onChange={(e) => set('minArea', e.target.value)} placeholder="м²" />
                </label>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('areaTo')}</span>
                  <input type="number" className={cls.dfInput} value={draft.maxArea} onChange={(e) => set('maxArea', e.target.value)} placeholder="м²" />
                </label>
              </div>
            </div>
            <label className={cls.dfCheckRow}>
              <input type="checkbox" checked={draft.hasElevator} onChange={() => toggle('hasElevator')} />
              <span>{t('elevator')}</span>
            </label>
          </div>

          {/* C) Offered place */}
          <div className={cls.dfSection}>
            <h3 className={cls.dfSectionTitle}>{t('offeredPlace')}</h3>
            <div className={cls.dfGrid}>
              <div className={cls.dfRangeRow}>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('roomAreaFrom')}</span>
                  <input type="number" className={cls.dfInput} value={draft.minRoomArea} onChange={(e) => set('minRoomArea', e.target.value)} placeholder="м²" />
                </label>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('roomAreaTo')}</span>
                  <input type="number" className={cls.dfInput} value={draft.maxRoomArea} onChange={(e) => set('maxRoomArea', e.target.value)} placeholder="м²" />
                </label>
              </div>
            </div>
            <label className={cls.dfCheckRow}>
              <input type="checkbox" checked={draft.furnished} onChange={() => toggle('furnished')} />
              <span>{t('furnished')}</span>
            </label>
          </div>

          {/* D) Amenities */}
          <div className={cls.dfSection}>
            <h3 className={cls.dfSectionTitle}>{t('amenities')}</h3>
            <div className={cls.dfChipsGrid}>
              {(['wifi', 'washingMachine', 'fridge', 'kitchen', 'airConditioner', 'balcony', 'parking'] as const).map((key) => (
                <label key={key} className={`${cls.dfChip} ${draft[key] ? cls.dfChipActive : ''}`}>
                  <input type="checkbox" hidden checked={draft[key] as boolean} onChange={() => toggle(key)} />
                  <span>{t(`amenity.${key}`)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* E) House rules */}
          <div className={cls.dfSection}>
            <h3 className={cls.dfSectionTitle}>{t('houseRules')}</h3>
            <div className={cls.dfGrid}>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('smoking')}</span>
                <select className={cls.dfSelect} value={draft.smokingPolicy} onChange={(e) => set('smokingPolicy', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="no">{t('rules.no')}</option>
                  <option value="yes">{t('rules.yes')}</option>
                  <option value="only_balcony">{t('rules.onlyBalcony')}</option>
                </select>
              </label>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('pets')}</span>
                <select className={cls.dfSelect} value={draft.petsPolicy} onChange={(e) => set('petsPolicy', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="no">{t('rules.no')}</option>
                  <option value="yes">{t('rules.yes')}</option>
                  <option value="cats_only">{t('rules.catsOnly')}</option>
                  <option value="small_pets_only">{t('rules.smallPetsOnly')}</option>
                  <option value="discuss">{t('rules.discuss')}</option>
                </select>
              </label>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('guests')}</span>
                <select className={cls.dfSelect} value={draft.guestsPolicy} onChange={(e) => set('guestsPolicy', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="no">{t('rules.no')}</option>
                  <option value="rare">{t('rules.rare')}</option>
                  <option value="allowed">{t('rules.allowed')}</option>
                </select>
              </label>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('parties')}</span>
                <select className={cls.dfSelect} value={draft.partiesPolicy} onChange={(e) => set('partiesPolicy', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="no">{t('rules.no')}</option>
                  <option value="rare">{t('rules.rare')}</option>
                  <option value="allowed">{t('rules.allowed')}</option>
                </select>
              </label>
            </div>
          </div>

          {/* F) Who lives */}
          <div className={cls.dfSection}>
            <h3 className={cls.dfSectionTitle}>{t('whoLives')}</h3>
            <div className={cls.dfGrid}>
              <div className={cls.dfRangeRow}>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('residentsFrom')}</span>
                  <input type="number" className={cls.dfInput} value={draft.minResidents} onChange={(e) => set('minResidents', e.target.value)} />
                </label>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('residentsTo')}</span>
                  <input type="number" className={cls.dfInput} value={draft.maxResidents} onChange={(e) => set('maxResidents', e.target.value)} />
                </label>
              </div>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('hasKids')}</span>
                <select className={cls.dfSelect} value={draft.hasKids} onChange={(e) => set('hasKids', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="true">{t('yes')}</option>
                  <option value="false">{t('no')}</option>
                </select>
              </label>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('hasPets')}</span>
                <select className={cls.dfSelect} value={draft.hasPets} onChange={(e) => set('hasPets', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="true">{t('yes')}</option>
                  <option value="false">{t('no')}</option>
                </select>
              </label>
            </div>
          </div>

          {/* G) Who they want */}
          <div className={cls.dfSection}>
            <h3 className={cls.dfSectionTitle}>{t('whoTheyWant')}</h3>
            <div className={cls.dfGrid}>
              <label className={cls.dfField}>
                <span className={cls.dfLabel}>{t('genderPref')}</span>
                <select className={cls.dfSelect} value={draft.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="">{t('any')}</option>
                  <option value="male">{t('genders.male')}</option>
                  <option value="female">{t('genders.female')}</option>
                </select>
              </label>
              <div className={cls.dfRangeRow}>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('ageFrom')}</span>
                  <input type="number" className={cls.dfInput} value={draft.ageMin} onChange={(e) => set('ageMin', e.target.value)} />
                </label>
                <label className={cls.dfField}>
                  <span className={cls.dfLabel}>{t('ageTo')}</span>
                  <input type="number" className={cls.dfInput} value={draft.ageMax} onChange={(e) => set('ageMax', e.target.value)} />
                </label>
              </div>
            </div>
            <div className={cls.dfChipsGrid}>
              <label className={`${cls.dfChip} ${draft.allowedWithPets ? cls.dfChipActive : ''}`}>
                <input type="checkbox" hidden checked={draft.allowedWithPets} onChange={() => toggle('allowedWithPets')} />
                <span>{t('acceptPets')}</span>
              </label>
              <label className={`${cls.dfChip} ${draft.allowedWithKids ? cls.dfChipActive : ''}`}>
                <input type="checkbox" hidden checked={draft.allowedWithKids} onChange={() => toggle('allowedWithKids')} />
                <span>{t('acceptKids')}</span>
              </label>
              <label className={`${cls.dfChip} ${draft.allowedSmoking ? cls.dfChipActive : ''}`}>
                <input type="checkbox" hidden checked={draft.allowedSmoking} onChange={() => toggle('allowedSmoking')} />
                <span>{t('acceptSmoking')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className={cls.dfFooter}>
          <button type="button" className={cls.dfClearBtn} onClick={() => onChange({ ...EMPTY_DEEP })}>{t('clearAll')}</button>
          <button type="button" className={cls.dfApplyBtn} onClick={onApply}>
            {t('apply')}
            {deepFiltersCount(draft) > 0 && <span className={cls.dfApplyCount}>{deepFiltersCount(draft)}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── AdsFeed ──

const AdsFeed: React.FC = () => {
  const t = useTranslations('CoLivingLanding.feed')
  const tAds = useTranslations('Ads')
  const locale = useLocale()

  // Basic filters
  const [q, setQ] = React.useState('')
  const [city, setCity] = React.useState('')
  const [minPrice, setMinPrice] = React.useState('')
  const [maxPrice, setMaxPrice] = React.useState('')
  const [placeType, setPlaceType] = React.useState('')

  // Quick chips (boolean)
  const [utilitiesIncluded, setUtilitiesIncluded] = React.useState(false)
  const [noDeposit, setNoDeposit] = React.useState(false)
  const [petsAllowed, setPetsAllowed] = React.useState(false)
  const [noSmoking, setNoSmoking] = React.useState(false)

  // Deep filters
  const [deepModalOpen, setDeepModalOpen] = React.useState(false)
  const [deep, setDeep] = React.useState<DeepFilters>({ ...EMPTY_DEEP })
  const [deepDraft, setDeepDraft] = React.useState<DeepFilters>({ ...EMPTY_DEEP })

  const openDeepModal = () => { setDeepDraft({ ...deep }); setDeepModalOpen(true) }
  const applyDeep = () => { setDeep({ ...deepDraft }); setDeepModalOpen(false) }

  const buildParams = React.useCallback((): HousemateFilterParams => {
    const p: HousemateFilterParams = { sortOrder: 'desc' }
    if (q) p.q = q
    if (city) p.city = city
    if (minPrice) p.minPrice = Number(minPrice)
    if (maxPrice) p.maxPrice = Number(maxPrice)
    if (placeType) p.housemateOfferedPlaceType = placeType as HousemateFilterParams['housemateOfferedPlaceType']
    p.sortBy = 'publishedAt'
    p.lang = locale === 'kg' || locale === 'en' || locale === 'ru' ? locale : 'ru'

    // Quick chips
    if (utilitiesIncluded) p.utilitiesIncluded = true
    if (noDeposit) p.noDeposit = true
    if (petsAllowed) p.petsAllowed = true
    if (noSmoking) p.noSmoking = true

    // Deep filters
    if (deep.maxDeposit) p.maxDeposit = Number(deep.maxDeposit)
    if (deep.utilitiesPaymentType) p.utilitiesPaymentType = deep.utilitiesPaymentType as HousemateFilterParams['utilitiesPaymentType']
    if (deep.isNegotiable) p.isNegotiable = true
    if (deep.propertyType) p.propertyType = deep.propertyType as HousemateFilterParams['propertyType']
    if (deep.minRooms) p.minRooms = Number(deep.minRooms)
    if (deep.maxRooms) p.maxRooms = Number(deep.maxRooms)
    if (deep.minFloor) p.minFloor = Number(deep.minFloor)
    if (deep.maxFloor) p.maxFloor = Number(deep.maxFloor)
    if (deep.hasElevator) p.hasElevator = true
    if (deep.minArea) p.minArea = Number(deep.minArea)
    if (deep.maxArea) p.maxArea = Number(deep.maxArea)
    if (deep.furnished) p.furnished = true
    if (deep.minRoomArea) p.minRoomArea = Number(deep.minRoomArea)
    if (deep.maxRoomArea) p.maxRoomArea = Number(deep.maxRoomArea)
    if (deep.wifi) p.wifi = true
    if (deep.washingMachine) p.washingMachine = true
    if (deep.fridge) p.fridge = true
    if (deep.kitchen) p.kitchen = true
    if (deep.airConditioner) p.airConditioner = true
    if (deep.balcony) p.balcony = true
    if (deep.parking) p.parking = true
    if (deep.smokingPolicy) p.smokingPolicy = deep.smokingPolicy as HousemateFilterParams['smokingPolicy']
    if (deep.petsPolicy) p.petsPolicy = deep.petsPolicy as HousemateFilterParams['petsPolicy']
    if (deep.guestsPolicy) p.guestsPolicy = deep.guestsPolicy as HousemateFilterParams['guestsPolicy']
    if (deep.partiesPolicy) p.partiesPolicy = deep.partiesPolicy as HousemateFilterParams['partiesPolicy']
    if (deep.minResidents) p.minResidents = Number(deep.minResidents)
    if (deep.maxResidents) p.maxResidents = Number(deep.maxResidents)
    if (deep.hasKids === 'true') p.hasKids = true
    if (deep.hasKids === 'false') p.hasKids = false
    if (deep.hasPets === 'true') p.hasPets = true
    if (deep.hasPets === 'false') p.hasPets = false
    if (deep.allowedWithPets) p.allowedWithPets = true
    if (deep.allowedWithKids) p.allowedWithKids = true
    if (deep.allowedSmoking) p.allowedSmoking = true
    if (deep.gender) p.gender = deep.gender as HousemateFilterParams['gender']
    if (deep.ageMin) p.ageMin = Number(deep.ageMin)
    if (deep.ageMax) p.ageMax = Number(deep.ageMax)

    return p
  }, [q, city, minPrice, maxPrice, placeType, locale, utilitiesIncluded, noDeposit, petsAllowed, noSmoking, deep])

  const { items, isLoading, totalPages, page, search, goToPage } = useAds<HousemateAd>(
    housemateAdsAPI.list,
    buildParams,
  )

  // Re-search when quick chips or deep filters change
  React.useEffect(() => { search() }, [utilitiesIncluded, noDeposit, petsAllowed, noSmoking, deep]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasBasicFilters = city || minPrice || maxPrice || placeType
  const deepCount = deepFiltersCount(deep)
  const hasAnyFilter = hasBasicFilters || utilitiesIncluded || noDeposit || petsAllowed || noSmoking || deepCount > 0

  const clearAll = () => {
    setCity(''); setMinPrice(''); setMaxPrice(''); setPlaceType('')
    setUtilitiesIncluded(false); setNoDeposit(false); setPetsAllowed(false); setNoSmoking(false)
    setDeep({ ...EMPTY_DEEP })
  }

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); search() }

  return (
    <div>
      {/* Search bar */}
      <form className={cls.filterBar} onSubmit={handleSubmit}>
        <div className={cls.searchWrap}>
          <Search size={16} className={cls.searchIcon} />
          <input className={cls.searchInput} placeholder={t('searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <input className={cls.filterInput} placeholder={tAds('filters.city')} value={city} onChange={(e) => setCity(e.target.value)} style={{ minWidth: 120, maxWidth: 160 }} />
        <div className={cls.priceRange}>
          <input type="number" className={cls.filterInput} placeholder={tAds('filters.priceFrom')} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <span className={cls.priceDash}>&mdash;</span>
          <input type="number" className={cls.filterInput} placeholder={tAds('filters.priceTo')} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <button type="submit" className={cls.searchBtn}>{tAds('filters.apply')}</button>
      </form>

      {/* Place type tabs */}
      <div className={cls.placeTypeTabs}>
        {[
          { value: '', label: t('placeTypeAll') },
          { value: 'separate_room', label: t('place.separate_room') },
          { value: 'shared_room', label: t('place.shared_room') },
          { value: 'bed_place', label: t('place.bed_place') },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${cls.placeTypeTab} ${placeType === opt.value ? cls.placeTypeTabActive : ''}`}
            onClick={() => { setPlaceType(opt.value); setTimeout(search, 0) }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Quick chips + deep filter button */}
      <div className={cls.quickRow}>
        <div className={cls.quickChips}>
          <button
            type="button"
            className={`${cls.quickChip} ${utilitiesIncluded ? cls.quickChipActive : ''}`}
            onClick={() => setUtilitiesIncluded(!utilitiesIncluded)}
          >
            <Wallet size={14} />
            {t('chips.utilitiesIncluded')}
          </button>
          <button
            type="button"
            className={`${cls.quickChip} ${noDeposit ? cls.quickChipActive : ''}`}
            onClick={() => setNoDeposit(!noDeposit)}
          >
            <Banknote size={14} />
            {t('chips.noDeposit')}
          </button>
          <button
            type="button"
            className={`${cls.quickChip} ${petsAllowed ? cls.quickChipActive : ''}`}
            onClick={() => setPetsAllowed(!petsAllowed)}
          >
            <PawPrint size={14} />
            {t('chips.petsAllowed')}
          </button>
          <button
            type="button"
            className={`${cls.quickChip} ${noSmoking ? cls.quickChipActive : ''}`}
            onClick={() => setNoSmoking(!noSmoking)}
          >
            <Cigarette size={14} />
            {t('chips.noSmoking')}
          </button>
        </div>
        <button type="button" className={`${cls.deepFilterBtn} ${deepCount > 0 ? cls.deepFilterBtnActive : ''}`} onClick={openDeepModal}>
          <SlidersHorizontal size={16} />
          <span>{t('allFilters')}</span>
          {deepCount > 0 && <span className={cls.deepFilterCount}>{deepCount}</span>}
        </button>
        {hasAnyFilter && (
          <button type="button" className={cls.clearBtn} onClick={clearAll}><X size={14} />{tAds('filters.clear')}</button>
        )}
      </div>

      {/* Deep filter modal */}
      {deepModalOpen && (
        <DeepFilterModal
          draft={deepDraft}
          onChange={setDeepDraft}
          onApply={applyDeep}
          onClose={() => setDeepModalOpen(false)}
        />
      )}

      {/* Results */}
      {isLoading ? (
        <div className={cls.loaderWrap}><Loader2 size={32} className={cls.spinner} /></div>
      ) : items.length === 0 ? (
        <div className={cls.empty}>
          <div className={cls.emptyIcon}><Home size={40} /></div>
          <p className={cls.emptyTitle}>{t('noResults')}</p>
          <p className={cls.emptyText}>{t('noResultsHint')}</p>
        </div>
      ) : (
        <div className={cls.adsGrid}>
          {items.map((ad, i) => (
            <div key={ad.id} className={cls.adsGridItem} style={{ animationDelay: `${i * 60}ms` }}>
              <CoLivingAdCard ad={ad} />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={cls.pagination}>
          <button className={cls.pageBtn} disabled={page <= 1} onClick={() => goToPage(page - 1)}>{tAds('prev')}</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1]
              const ellipsis = prev !== undefined && p - prev > 1
              return (
                <React.Fragment key={p}>
                  {ellipsis && <span className={cls.ellipsis}>...</span>}
                  <button className={`${cls.pageBtn} ${p === page ? cls.pageBtnActive : ''}`} onClick={() => goToPage(p)}>{p}</button>
                </React.Fragment>
              )
            })}
          <button className={cls.pageBtn} disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>{tAds('next')}</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PROFILES FEED
// ═══════════════════════════════════════════════════════════

const ProfilesFeedNew: React.FC = () => {
  const t = useTranslations('CoLivingLanding.feed')
  const tAds = useTranslations('Ads')

  const [items, setItems] = React.useState<HousemateProfileEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [q, setQ] = React.useState('')
  const [pg, setPg] = React.useState(1)
  const [totalPg, setTotalPg] = React.useState(1)

  const load = React.useCallback(async (page: number, query: string) => {
    setIsLoading(true)
    try {
      const params: HousemateProfileFilterParams = { page, limit: 12 }
      if (query) params.q = query
      const data = await housemateProfilesAPI.list(params)
      setItems(data.items); setPg(data.page); setTotalPg(data.totalPages)
    } catch { setItems([]) }
    finally { setIsLoading(false) }
  }, [])

  React.useEffect(() => { load(1, '') }, [load])

  return (
    <div>
      <form className={cls.filterBar} onSubmit={(e) => { e.preventDefault(); load(1, q) }}>
        <div className={cls.searchWrap}>
          <Search size={16} className={cls.searchIcon} />
          <input className={cls.searchInput} placeholder={t('searchProfiles')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="submit" className={cls.searchBtn}>{tAds('filters.apply')}</button>
      </form>

      {isLoading ? (
        <div className={cls.loaderWrap}><Loader2 size={32} className={cls.spinner} /></div>
      ) : items.length === 0 ? (
        <div className={cls.empty}>
          <div className={cls.emptyIcon}><Users size={40} /></div>
          <p className={cls.emptyTitle}>{t('noProfiles')}</p>
          <p className={cls.emptyText}>{t('noProfilesHint')}</p>
        </div>
      ) : (
        <div className={cls.profilesGrid}>
          {items.map((entry, i) => (
            <div key={entry.user.userId} className={cls.profilesGridItem} style={{ animationDelay: `${i * 60}ms` }}>
              <ProfileCardNew entry={entry} />
            </div>
          ))}
        </div>
      )}

      {totalPg > 1 && (
        <div className={cls.pagination}>
          <button className={cls.pageBtn} disabled={pg <= 1} onClick={() => load(pg - 1, q)}>{tAds('prev')}</button>
          <span className={cls.pageInfo}>{pg} / {totalPg}</span>
          <button className={cls.pageBtn} disabled={pg >= totalPg} onClick={() => load(pg + 1, q)}>{tAds('next')}</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════

const CtaSection: React.FC = () => {
  const t = useTranslations('CoLivingLanding.cta')
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className={`${cls.cta} ${inView ? cls.ctaVisible : ''}`}>
      <div className={cls.ctaBg} />
      <div className={cls.ctaContent}>
        <h2 className={cls.ctaTitle}>{t('title')}</h2>
        <p className={cls.ctaText}>{t('text')}</p>
        <Link href="/create-ad" className={cls.ctaBtn}>
          {t('btn')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN LANDING COMPONENT
// ═══════════════════════════════════════════════════════════

const CompatBanner: React.FC = () => {
  const t = useTranslations('CoLivingLanding.compat')
  const { isAuthenticated } = useAuth()
  const [state, setState] = React.useState<'loading' | 'no-auth' | 'no-profile' | 'has-profile'>('loading')
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    if (!isAuthenticated) { setState('no-auth'); return }
    roommateProfileAPI.get()
      .then(res => setState(res.exists ? 'has-profile' : 'no-profile'))
      .catch(() => setState('no-auth'))
  }, [isAuthenticated])

  if (state === 'loading' || state === 'has-profile' || dismissed) return null

  if (state === 'no-auth') {
    return (
      <div className={cls.compatBanner}>
        <div className={cls.compatBannerIcon}><Sparkles size={20} /></div>
        <div className={cls.compatBannerText}>
          <p className={cls.compatBannerTitle}>{t('loginTitle')}</p>
          <p className={cls.compatBannerDesc}>{t('loginDesc')}</p>
        </div>
        <button type="button" className={cls.compatBannerClose} onClick={() => setDismissed(true)}><X size={16} /></button>
      </div>
    )
  }

  return (
    <div className={cls.compatBanner}>
      <div className={cls.compatBannerIcon}><Sparkles size={20} /></div>
      <div className={cls.compatBannerText}>
        <p className={cls.compatBannerTitle}>{t('title')}</p>
        <p className={cls.compatBannerDesc}>{t('desc')}</p>
      </div>
      <Link href="/roommate-profile" className={cls.compatBannerBtn}>{t('btn')}</Link>
      <button type="button" className={cls.compatBannerClose} onClick={() => setDismissed(true)}><X size={16} /></button>
    </div>
  )
}

export const CoLivingLanding: React.FC = () => {
  const t = useTranslations('CoLivingLanding.tabs')
  const [activeTab, setActiveTab] = React.useState<'ads' | 'profiles'>('ads')

  return (
    <div className={cls.landing}>
      <HeroSection />

      <section className={cls.mainSection}>
        <CompatBanner />

        <div className={cls.tabsBar}>
          <div className={cls.tabsTrack}>
            <div
              className={cls.tabsIndicator}
              style={{ transform: activeTab === 'ads' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button
              type="button"
              className={`${cls.tabBtn} ${activeTab === 'ads' ? cls.tabBtnActive : ''}`}
              onClick={() => setActiveTab('ads')}
            >
              <Home size={16} />
              {t('ads')}
            </button>
            <button
              type="button"
              className={`${cls.tabBtn} ${activeTab === 'profiles' ? cls.tabBtnActive : ''}`}
              onClick={() => setActiveTab('profiles')}
            >
              <Users size={16} />
              {t('profiles')}
            </button>
          </div>
        </div>

        {activeTab === 'ads' ? <AdsFeed /> : <ProfilesFeedNew />}
      </section>

      <CtaSection />
    </div>
  )
}
