'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'

import {
  ArrowLeft,
  ArrowRight,
  Home,
  ShoppingBag,
  Users,
  MapPin,
  FileText,
  ImagePlus,
  Plus,
  CheckCircle2,
  Send,
  AlertCircle,
  X,
  Camera,
  Check,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useLocale, useTranslations } from 'next-intl'

const MapPicker = dynamic(() => import('./map-picker'), { ssr: false })

import { useRouter } from '@/i18n/navigation'
import { rentAdsAPI, saleAdsAPI, housemateAdsAPI, mediaAPI } from '@/lib/ads/api'
import type {
  AdKind,
  Currency,
  RentType,
  RentPropertyType,
  SalePropertyType,
  HousematePropertyType,
  OfferedPlaceType,
  UtilitiesPaymentType,
} from '@/lib/ads/types'
import { ProtectedRoute } from '@/lib/auth/protected-route'
import { normalizeContactInput } from '@/lib/auth/utils'
import api from '@/shared/api/axios'
import { useAuth } from '@/shared/providers/auth-provider'

import cls from './create-ad-form.module.css'

// ── Types ──────────────────────────────────────────────

interface District {
  id: number
  name: string
}

interface FormState {
  kind: AdKind | null
  title: string
  description: string
  city: string
  districtId: string
  street: string
  houseNumber: string
  landmark: string
  geoLat: number | null
  geoLng: number | null
  price: string
  currency: Currency
  // Rent
  rentType: RentType
  rentPropertyType: RentPropertyType
  roomsCount: string
  maxResidents: string
  depositAmount: string
  totalAreaM2: string
  livingAreaM2: string
  kitchenAreaM2: string
  floor: string
  totalFloors: string
  yearBuilt: string
  commissionPercent: string
  prepaymentMonths: string
  minLeaseMonths: string
  utilitiesPaymentType: string
  isNegotiable: boolean
  amenities: string[]
  // Rent rules
  allowedWithKids: boolean
  allowedWithPets: boolean
  smokingAllowed: boolean
  alcoholAllowed: boolean
  partiesAllowed: boolean
  instrumentsAllowed: boolean
  guestsAllowed: boolean
  quietHoursFrom: string
  quietHoursTo: string
  cleaningRequired: boolean
  shoesOffRequired: boolean
  additionalRulesText: string
  // Sale
  salePropertyType: SalePropertyType
  saleTotalArea: string
  saleRoomsCount: string
  // Housemate
  housematePropertyType: HousematePropertyType
  offeredPlaceType: OfferedPlaceType
  residentsCount: string
}

const INITIAL_STATE: FormState = {
  kind: null,
  title: '',
  description: '',
  city: 'Бишкек',
  districtId: '',
  street: '',
  houseNumber: '',
  landmark: '',
  geoLat: null,
  geoLng: null,
  price: '',
  currency: 'KGS',
  rentType: 'long_term',
  rentPropertyType: 'flat',
  roomsCount: '',
  maxResidents: '',
  depositAmount: '',
  totalAreaM2: '',
  livingAreaM2: '',
  kitchenAreaM2: '',
  floor: '',
  totalFloors: '',
  yearBuilt: '',
  commissionPercent: '',
  prepaymentMonths: '',
  minLeaseMonths: '',
  utilitiesPaymentType: '',
  isNegotiable: false,
  amenities: [],
  allowedWithKids: false,
  allowedWithPets: false,
  smokingAllowed: false,
  alcoholAllowed: false,
  partiesAllowed: false,
  instrumentsAllowed: false,
  guestsAllowed: false,
  quietHoursFrom: '',
  quietHoursTo: '',
  cleaningRequired: false,
  shoesOffRequired: false,
  additionalRulesText: '',
  salePropertyType: 'flat',
  saleTotalArea: '',
  saleRoomsCount: '',
  housematePropertyType: 'flat',
  offeredPlaceType: 'separate_room',
  residentsCount: '',
}

const RENT_AMENITIES = [
  'wifi', 'washer', 'fridge', 'ac', 'tv', 'parking',
  'balcony', 'furniture', 'dishwasher', 'microwave',
]

const STEPS = ['type', 'basic', 'details', 'review'] as const
type Step = (typeof STEPS)[number]

// ── Component ──────────────────────────────────────────

export const CreateAdForm: React.FC = () => {
  const t = useTranslations('CreateAd')
  const router = useRouter()
  const locale = useLocale()
  const { user, addPhone } = useAuth()

  const [step, setStep] = useState<Step>('type')
  const [districts, setDistricts] = useState<District[]>([])

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const lang = locale === 'kg' || locale === 'en' || locale === 'ru' ? locale : 'ru'
        const res = await api.get('/taxonomy/districts', { params: { lang } })
        const items = Array.isArray(res.data) ? res.data
          : Array.isArray(res.data?.items) ? res.data.items
          : Array.isArray(res.data?.results) ? res.data.results
          : []
        setDistricts(items)
      } catch {
        // silently fail
      }
    }
    loadDistricts()
  }, [locale])
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdAdId, setCreatedAdId] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [customAmenity, setCustomAmenity] = useState('')
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  // ── Phone Verification State ──
  const [showVerify, setShowVerify] = useState(false)
  const [verifyPhone, setVerifyPhone] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  const stepIndex = STEPS.indexOf(step)

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const toggleAmenity = useCallback((amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }, [])

  // ── Geocode address → coordinates ──
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const geocodeAddress = useCallback((street: string, houseNumber: string, city: string) => {
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current)
    if (!street.trim()) return

    geocodeTimerRef.current = setTimeout(async () => {
      try {
        const query = [street, houseNumber, city, 'Кыргызстан'].filter(Boolean).join(', ')
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=ru`,
        )
        const data = await res.json()
        if (data?.[0]) {
          setForm(prev => ({ ...prev, geoLat: parseFloat(data[0].lat), geoLng: parseFloat(data[0].lon) }))
        }
      } catch {
        // silently fail
      }
    }, 800)
  }, [])

  // ── Photos ──

  const handlePhotoAdd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files).slice(0, 8 - photoFiles.length)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))

    setPhotoFiles(prev => [...prev, ...newFiles])
    setPhotoPreviews(prev => [...prev, ...newPreviews])
    e.target.value = ''
  }, [photoFiles.length])

  const removePhoto = useCallback((index: number) => {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }, [photoPreviews])

  // ── Validation ──

  const validateBasic = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = t('errors.titleRequired')
    if (!form.price.trim() || Number(form.price) <= 0) errs.price = t('errors.priceRequired')
    if (!form.city.trim()) errs.city = t('errors.cityRequired')
    if (!form.districtId) errs.districtId = t('errors.districtRequired')
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateDetails = (): boolean => {
    const errs: Record<string, string> = {}

    if (form.kind === 'RENT') {
      if (form.roomsCount && (Number(form.roomsCount) < 1 || Number(form.roomsCount) > 20)) {
        errs.roomsCount = t('errors.roomsInvalid')
      }
    }

    if (form.kind === 'SALE') {
      if (form.saleTotalArea && Number(form.saleTotalArea) <= 0) {
        errs.saleTotalArea = t('errors.areaInvalid')
      }
    }

    if (form.kind === 'HOUSEMATE') {
      if (!form.residentsCount.trim() || Number(form.residentsCount) < 1) {
        errs.residentsCount = t('errors.residentsRequired')
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Navigation ──

  const goNext = () => {
    if (step === 'type' && !form.kind) return
    if (step === 'basic' && !validateBasic()) return
    if (step === 'details' && !validateDetails()) return

    const nextIndex = stepIndex + 1
    if (nextIndex < STEPS.length) setStep(STEPS[nextIndex])
  }

  const goBack = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) setStep(STEPS[prevIndex])
  }

  // ── Phone Verification ──

  const handleAddPhone = async () => {
    if (!verifyPhone.trim()) {
      setVerifyError(t('verify.phoneRequired'))
      return
    }
    setVerifyLoading(true)
    setVerifyError('')
    try {
      await addPhone(normalizeContactInput(verifyPhone))
      setShowVerify(false)
      doSubmit()
    } catch {
      setVerifyError(t('verify.sendFailed'))
    } finally {
      setVerifyLoading(false)
    }
  }

  // ── Submit ──

  const isPhoneVerified = user?.contactVerified

  const handleSubmit = async () => {
    if (!isPhoneVerified) {
      setShowVerify(true)
      setVerifyPhone('')
      setVerifyError('')
      return
    }
    doSubmit()
  }

  const doSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setGlobalError('')

    try {
      let adId: string

      // Upload photos first
      let photoUrls: string[] | undefined
      if (photoFiles.length > 0) {
        photoUrls = await mediaAPI.upload(photoFiles)
      }

      const base = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        city: form.city.trim(),
        districtId: form.districtId ? Number(form.districtId) : undefined,
        price: Number(form.price),
        currency: form.currency,
        photos: photoUrls,
      }

      if (form.kind === 'RENT') {
        const result = await rentAdsAPI.create({
          ...base,
          rent: {
            rentType: form.rentType,
            propertyType: form.rentPropertyType,
            roomsCount: form.roomsCount ? Number(form.roomsCount) : undefined,
            maxResidents: form.maxResidents ? Number(form.maxResidents) : undefined,
            depositAmount: form.depositAmount ? Number(form.depositAmount) : undefined,
            totalAreaM2: form.totalAreaM2 ? Number(form.totalAreaM2) : undefined,
            livingAreaM2: form.livingAreaM2 ? Number(form.livingAreaM2) : undefined,
            kitchenAreaM2: form.kitchenAreaM2 ? Number(form.kitchenAreaM2) : undefined,
            floor: form.floor ? Number(form.floor) : undefined,
            totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
            yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
            commissionPercent: form.commissionPercent ? Number(form.commissionPercent) : undefined,
            prepaymentMonths: form.prepaymentMonths ? Number(form.prepaymentMonths) : undefined,
            minLeaseMonths: form.minLeaseMonths ? Number(form.minLeaseMonths) : undefined,
            utilitiesPaymentType: (form.utilitiesPaymentType as UtilitiesPaymentType) || undefined,
            isNegotiable: form.isNegotiable || undefined,
            amenities: form.amenities.length > 0 ? form.amenities : undefined,
            address: (form.street.trim() || form.houseNumber.trim() || form.landmark.trim() || (form.geoLat && form.geoLng)) ? {
              street: form.street.trim() || undefined,
              houseNumber: form.houseNumber.trim() || undefined,
              landmark: form.landmark.trim() || undefined,
              geo: form.geoLat && form.geoLng ? { lat: form.geoLat, lng: form.geoLng } : undefined,
            } : undefined,
            allowedWithKids: form.allowedWithKids || undefined,
            allowedWithPets: form.allowedWithPets || undefined,
            smokingAllowed: form.smokingAllowed || undefined,
            alcoholAllowed: form.alcoholAllowed || undefined,
            partiesAllowed: form.partiesAllowed || undefined,
            instrumentsAllowed: form.instrumentsAllowed || undefined,
            guestsAllowed: form.guestsAllowed || undefined,
            quietHoursFrom: form.quietHoursFrom || undefined,
            quietHoursTo: form.quietHoursTo || undefined,
            cleaningRequired: form.cleaningRequired || undefined,
            shoesOffRequired: form.shoesOffRequired || undefined,
            additionalRulesText: form.additionalRulesText.trim() || undefined,
          },
        })
        adId = result.id
      } else if (form.kind === 'SALE') {
        const result = await saleAdsAPI.create({
          ...base,
          sale: {
            propertyType: form.salePropertyType,
            roomsCount: form.saleRoomsCount ? Number(form.saleRoomsCount) : undefined,
            totalAreaM2: form.saleTotalArea ? Number(form.saleTotalArea) : undefined,
          },
        })
        adId = result.id
      } else {
        const result = await housemateAdsAPI.create({
          ...base,
          housemate: {
            propertyType: form.housematePropertyType,
            offeredPlaceType: form.offeredPlaceType,
            residentsCount: Number(form.residentsCount),
          },
        })
        adId = result.id
      }

      setCreatedAdId(adId)

      // Publish
      if (form.kind === 'RENT') await rentAdsAPI.publish(adId)
      else if (form.kind === 'SALE') await saleAdsAPI.publish(adId)
      else await housemateAdsAPI.publish(adId)
      setIsPublished(true)

      setStep('review')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.generic')
      setGlobalError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Step Labels ──

  const stepLabels = [
    t('steps.type'),
    t('steps.basic'),
    t('steps.details'),
    t('steps.review'),
  ]

  // ── Render ──

  return (
    <ProtectedRoute>
      <div className={cls.page}>
        <div className={cls.container}>
          <button type="button" className={cls.backLink} onClick={() => router.back()}>
            <ArrowLeft size={16} />
            {t('back')}
          </button>

          <h1 className={cls.title}>{t('title')}</h1>
          <p className={cls.subtitle}>{t('subtitle')}</p>

          {/* Steps indicator */}
          {!createdAdId && (
            <div className={cls.steps}>
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`${cls.step} ${i === stepIndex ? cls.stepActive : ''} ${i < stepIndex ? cls.stepDone : ''}`}>
                    <div className={cls.stepCircle}>
                      {i < stepIndex ? <Check size={14} /> : i + 1}
                    </div>
                    <span className={cls.stepLabel}>{stepLabels[i]}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`${cls.stepLine} ${i < stepIndex ? cls.stepLineDone : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {globalError && (
            <div className={cls.globalError}>
              <AlertCircle size={16} />
              {globalError}
            </div>
          )}

          {/* ── Step 1: Type Selection ── */}
          {step === 'type' && !createdAdId && (
            <>
              <div className={cls.typeGrid}>
                <div
                  className={`${cls.typeCard} ${form.kind === 'RENT' ? cls.typeCardActive : ''}`}
                  onClick={() => updateField('kind', 'RENT')}
                >
                  <div className={cls.typeIcon}><Home size={24} /></div>
                  <div className={cls.typeName}>{t('types.rent')}</div>
                  <div className={cls.typeDesc}>{t('types.rentDesc')}</div>
                </div>

                <div
                  className={`${cls.typeCard} ${form.kind === 'SALE' ? cls.typeCardActive : ''}`}
                  onClick={() => updateField('kind', 'SALE')}
                >
                  <div className={cls.typeIcon}><ShoppingBag size={24} /></div>
                  <div className={cls.typeName}>{t('types.sale')}</div>
                  <div className={cls.typeDesc}>{t('types.saleDesc')}</div>
                </div>

                <div
                  className={`${cls.typeCard} ${form.kind === 'HOUSEMATE' ? cls.typeCardActive : ''}`}
                  onClick={() => updateField('kind', 'HOUSEMATE')}
                >
                  <div className={cls.typeIcon}><Users size={24} /></div>
                  <div className={cls.typeName}>{t('types.housemate')}</div>
                  <div className={cls.typeDesc}>{t('types.housemateDesc')}</div>
                </div>
              </div>

              <div className={cls.actions}>
                <div />
                <button type="button" className={cls.btnNext} disabled={!form.kind} onClick={goNext}>
                  {t('next')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Basic Info ── */}
          {step === 'basic' && !createdAdId && (
            <>
              <div className={cls.section}>
                <div className={cls.sectionTitle}>
                  <FileText size={18} className={cls.sectionIcon} />
                  {t('sections.basicInfo')}
                </div>

                <div className={cls.field}>
                  <label className={cls.label}>
                    {t('fields.title')}
                    <span className={cls.required}>*</span>
                  </label>
                  <input
                    className={`${cls.input} ${errors.title ? cls.inputError : ''}`}
                    value={form.title}
                    onChange={e => updateField('title', e.target.value)}
                    placeholder={t('placeholders.title')}
                    maxLength={120}
                  />
                  {errors.title && <div className={cls.errorText}>{errors.title}</div>}
                </div>

                <div className={cls.field}>
                  <label className={cls.label}>{t('fields.description')}</label>
                  <textarea
                    className={cls.textarea}
                    value={form.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder={t('placeholders.description')}
                    maxLength={2000}
                  />
                </div>
              </div>

              <div className={cls.section}>
                <div className={cls.sectionTitle}>
                  <MapPin size={18} className={cls.sectionIcon} />
                  {t('sections.location')}
                </div>

                <div className={cls.field}>
                  <label className={cls.label}>
                    {t('fields.city')}
                    <span className={cls.required}>*</span>
                  </label>
                  <select
                    className={cls.select}
                    value={form.city}
                    onChange={e => updateField('city', e.target.value)}
                  >
                    <option value="Бишкек">{t('cities.bishkek')}</option>
                    <option value="Ош">{t('cities.osh')}</option>
                    <option value="Джалал-Абад">{t('cities.jalalabad')}</option>
                    <option value="Каракол">{t('cities.karakol')}</option>
                    <option value="Токмок">{t('cities.tokmok')}</option>
                  </select>
                  {errors.city && <div className={cls.errorText}>{errors.city}</div>}
                </div>

                <div className={cls.field}>
                  <label className={cls.label}>
                    {t('fields.district')}
                    <span className={cls.required}>*</span>
                  </label>
                  <select
                    className={`${cls.select} ${errors.districtId ? cls.inputError : ''}`}
                    value={form.districtId}
                    onChange={e => updateField('districtId', e.target.value)}
                  >
                    <option value="">{t('placeholders.district')}</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.districtId && <div className={cls.errorText}>{errors.districtId}</div>}
                </div>

                <div className={cls.row}>
                  <div className={cls.field}>
                    <label className={cls.label}>{t('fields.street')}</label>
                    <input
                      className={cls.input}
                      value={form.street}
                      onChange={e => {
                        updateField('street', e.target.value)
                        geocodeAddress(e.target.value, form.houseNumber, form.city)
                      }}
                      placeholder={t('placeholders.street')}
                    />
                  </div>
                  <div className={cls.field}>
                    <label className={cls.label}>{t('fields.houseNumber')}</label>
                    <input
                      className={cls.input}
                      value={form.houseNumber}
                      onChange={e => {
                        updateField('houseNumber', e.target.value)
                        geocodeAddress(form.street, e.target.value, form.city)
                      }}
                      placeholder={t('placeholders.houseNumber')}
                    />
                  </div>
                </div>

                <div className={cls.field}>
                  <label className={cls.label}>{t('fields.landmark')}</label>
                  <input
                    className={cls.input}
                    value={form.landmark}
                    onChange={e => updateField('landmark', e.target.value)}
                    placeholder={t('placeholders.landmark')}
                  />
                </div>

                <div className={cls.field}>
                  <label className={cls.label}>{t('fields.mapLabel')}</label>
                  <p className={cls.hint}>{t('fields.mapHint')}</p>
                  <MapPicker
                    lat={form.geoLat}
                    lng={form.geoLng}
                    city={form.city}
                    onChange={(lat, lng) => {
                      setForm(prev => ({ ...prev, geoLat: lat, geoLng: lng }))
                    }}
                    onGeocode={(street, houseNumber) => {
                      if (street && !form.street) updateField('street', street)
                      if (houseNumber && !form.houseNumber) updateField('houseNumber', houseNumber)
                    }}
                  />
                </div>
              </div>

              <div className={cls.section}>
                <div className={cls.sectionTitle}>
                  {t('sections.price')}
                </div>

                <div className={cls.row}>
                  <div className={cls.field}>
                    <label className={cls.label}>
                      {t('fields.price')}
                      <span className={cls.required}>*</span>
                    </label>
                    <input
                      className={`${cls.input} ${errors.price ? cls.inputError : ''}`}
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={e => updateField('price', e.target.value)}
                      placeholder={t('placeholders.price')}
                    />
                    {errors.price && <div className={cls.errorText}>{errors.price}</div>}
                  </div>

                  <div className={cls.field}>
                    <label className={cls.label}>{t('fields.currency')}</label>
                    <select
                      className={cls.select}
                      value={form.currency}
                      onChange={e => updateField('currency', e.target.value as Currency)}
                    >
                      <option value="KGS">KGS (сом)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (&euro;)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={cls.actions}>
                <button type="button" className={cls.btnBack} onClick={goBack}>
                  <ArrowLeft size={16} />
                  {t('prev')}
                </button>
                <button type="button" className={cls.btnNext} onClick={goNext}>
                  {t('next')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: Type-Specific Details ── */}
          {step === 'details' && !createdAdId && (
            <>
              {/* RENT details */}
              {form.kind === 'RENT' && (
                <>
                  <div className={cls.section}>
                    <div className={cls.sectionTitle}>
                      <Home size={18} className={cls.sectionIcon} />
                      {t('sections.rentDetails')}
                    </div>

                    <div className={cls.row}>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.rentType')}</label>
                        <select
                          className={cls.select}
                          value={form.rentType}
                          onChange={e => updateField('rentType', e.target.value as RentType)}
                        >
                          <option value="long_term">{t('rentTypes.long_term')}</option>
                          <option value="daily">{t('rentTypes.daily')}</option>
                        </select>
                      </div>

                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.propertyType')}</label>
                        <select
                          className={cls.select}
                          value={form.rentPropertyType}
                          onChange={e => updateField('rentPropertyType', e.target.value as RentPropertyType)}
                        >
                          <option value="flat">{t('propertyTypes.flat')}</option>
                          <option value="room">{t('propertyTypes.room')}</option>
                          <option value="house">{t('propertyTypes.house')}</option>
                          <option value="cottage">{t('propertyTypes.cottage')}</option>
                          <option value="studio">{t('propertyTypes.studio')}</option>
                        </select>
                      </div>
                    </div>

                    <div className={cls.row}>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.roomsCount')}</label>
                        <input
                          className={`${cls.input} ${errors.roomsCount ? cls.inputError : ''}`}
                          type="number"
                          min="1"
                          max="20"
                          value={form.roomsCount}
                          onChange={e => updateField('roomsCount', e.target.value)}
                          placeholder={t('placeholders.roomsCount')}
                        />
                        {errors.roomsCount && <div className={cls.errorText}>{errors.roomsCount}</div>}
                      </div>

                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.maxResidents')}</label>
                        <input
                          className={cls.input}
                          type="number"
                          min="1"
                          value={form.maxResidents}
                          onChange={e => updateField('maxResidents', e.target.value)}
                          placeholder={t('placeholders.maxResidents')}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>{t('fields.depositAmount')}</label>
                      <input
                        className={cls.input}
                        type="number"
                        min="0"
                        value={form.depositAmount}
                        onChange={e => updateField('depositAmount', e.target.value)}
                        placeholder={t('placeholders.depositAmount')}
                      />
                    </div>
                  </div>

                  {/* Property parameters */}
                  <div className={cls.section}>
                    <div className={cls.sectionTitle}>{t('sections.propertyParams')}</div>

                    <div className={cls.row}>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.totalAreaM2')}</label>
                        <input className={cls.input} type="number" min="1" value={form.totalAreaM2} onChange={e => updateField('totalAreaM2', e.target.value)} placeholder="м²" />
                      </div>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.livingAreaM2')}</label>
                        <input className={cls.input} type="number" min="1" value={form.livingAreaM2} onChange={e => updateField('livingAreaM2', e.target.value)} placeholder="м²" />
                      </div>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.kitchenAreaM2')}</label>
                        <input className={cls.input} type="number" min="1" value={form.kitchenAreaM2} onChange={e => updateField('kitchenAreaM2', e.target.value)} placeholder="м²" />
                      </div>
                    </div>

                    <div className={cls.row}>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.floor')}</label>
                        <input className={cls.input} type="number" min="1" value={form.floor} onChange={e => updateField('floor', e.target.value)} placeholder={t('placeholders.floor')} />
                      </div>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.totalFloors')}</label>
                        <input className={cls.input} type="number" min="1" value={form.totalFloors} onChange={e => updateField('totalFloors', e.target.value)} placeholder={t('placeholders.totalFloors')} />
                      </div>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.yearBuilt')}</label>
                        <input className={cls.input} type="number" min="1900" max="2030" value={form.yearBuilt} onChange={e => updateField('yearBuilt', e.target.value)} placeholder={t('placeholders.yearBuilt')} />
                      </div>
                    </div>
                  </div>

                  {/* Rental conditions */}
                  <div className={cls.section}>
                    <div className={cls.sectionTitle}>{t('sections.rentalConditions')}</div>

                    <div className={cls.row}>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.utilitiesPaymentType')}</label>
                        <select className={cls.select} value={form.utilitiesPaymentType} onChange={e => updateField('utilitiesPaymentType', e.target.value)}>
                          <option value="">{t('placeholders.utilitiesPaymentType')}</option>
                          <option value="included">{t('utilities.included')}</option>
                          <option value="separate">{t('utilities.separate')}</option>
                          <option value="partly">{t('utilities.partly')}</option>
                          <option value="excluded">{t('utilities.excluded')}</option>
                        </select>
                      </div>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.commissionPercent')}</label>
                        <input className={cls.input} type="number" min="0" max="100" value={form.commissionPercent} onChange={e => updateField('commissionPercent', e.target.value)} placeholder="%" />
                      </div>
                    </div>

                    <div className={cls.row}>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.prepaymentMonths')}</label>
                        <input className={cls.input} type="number" min="0" value={form.prepaymentMonths} onChange={e => updateField('prepaymentMonths', e.target.value)} placeholder={t('placeholders.prepaymentMonths')} />
                      </div>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('fields.minLeaseMonths')}</label>
                        <input className={cls.input} type="number" min="1" value={form.minLeaseMonths} onChange={e => updateField('minLeaseMonths', e.target.value)} placeholder={t('placeholders.minLeaseMonths')} />
                      </div>
                    </div>

                    <div className={cls.checkGroup} style={{ marginTop: 8 }}>
                      <div
                        className={`${cls.chip} ${form.isNegotiable ? cls.chipActive : ''}`}
                        onClick={() => updateField('isNegotiable', !form.isNegotiable)}
                      >
                        {form.isNegotiable && <Check size={14} />}
                        {t('fields.isNegotiable')}
                      </div>
                    </div>
                  </div>

                  <div className={cls.section}>
                    <div className={cls.sectionTitle}>{t('sections.amenities')}</div>
                    <div className={cls.checkGroup}>
                      {RENT_AMENITIES.map(a => (
                        <div
                          key={a}
                          className={`${cls.chip} ${form.amenities.includes(a) ? cls.chipActive : ''}`}
                          onClick={() => toggleAmenity(a)}
                        >
                          {form.amenities.includes(a) && <Check size={14} />}
                          {t(`amenities.${a}`)}
                        </div>
                      ))}
                      {form.amenities
                        .filter(a => !RENT_AMENITIES.includes(a))
                        .map(a => (
                          <div
                            key={a}
                            className={`${cls.chip} ${cls.chipActive}`}
                            onClick={() => toggleAmenity(a)}
                          >
                            <Check size={14} />
                            {a}
                            <X size={12} style={{ marginLeft: 4 }} />
                          </div>
                        ))}
                    </div>
                    <div className={cls.row} style={{ marginTop: 12, alignItems: 'flex-end' }}>
                      <div className={cls.field} style={{ flex: 1 }}>
                        <label className={cls.label}>{t('amenities.custom')}</label>
                        <input
                          className={cls.input}
                          value={customAmenity}
                          onChange={e => setCustomAmenity(e.target.value)}
                          placeholder={t('placeholders.customAmenity')}
                          maxLength={40}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const val = customAmenity.trim()
                              if (val && !form.amenities.includes(val)) {
                                updateField('amenities', [...form.amenities, val])
                                setCustomAmenity('')
                              }
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className={cls.btnBack}
                        style={{ height: 40, marginBottom: 0 }}
                        onClick={() => {
                          const val = customAmenity.trim()
                          if (val && !form.amenities.includes(val)) {
                            updateField('amenities', [...form.amenities, val])
                            setCustomAmenity('')
                          }
                        }}
                      >
                        <Plus size={16} />
                        {t('amenities.add')}
                      </button>
                    </div>
                  </div>

                  <div className={cls.section}>
                    <div className={cls.sectionTitle}>{t('sections.rules')}</div>
                    <div className={cls.checkGroup}>
                      {([
                        ['allowedWithKids', t('rules.allowedWithKids')],
                        ['allowedWithPets', t('rules.allowedWithPets')],
                        ['smokingAllowed', t('rules.smokingAllowed')],
                        ['alcoholAllowed', t('rules.alcoholAllowed')],
                        ['partiesAllowed', t('rules.partiesAllowed')],
                        ['instrumentsAllowed', t('rules.instrumentsAllowed')],
                        ['guestsAllowed', t('rules.guestsAllowed')],
                        ['cleaningRequired', t('rules.cleaningRequired')],
                        ['shoesOffRequired', t('rules.shoesOffRequired')],
                      ] as const).map(([key, label]) => (
                        <div
                          key={key}
                          className={`${cls.chip} ${form[key] ? cls.chipActive : ''}`}
                          onClick={() => updateField(key, !form[key])}
                        >
                          {form[key] && <Check size={14} />}
                          {label}
                        </div>
                      ))}
                    </div>

                    <div className={cls.row} style={{ marginTop: 12 }}>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('rules.quietHoursFrom')}</label>
                        <input
                          className={cls.input}
                          type="time"
                          value={form.quietHoursFrom}
                          onChange={e => updateField('quietHoursFrom', e.target.value)}
                        />
                      </div>
                      <div className={cls.field}>
                        <label className={cls.label}>{t('rules.quietHoursTo')}</label>
                        <input
                          className={cls.input}
                          type="time"
                          value={form.quietHoursTo}
                          onChange={e => updateField('quietHoursTo', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field} style={{ marginTop: 12 }}>
                      <label className={cls.label}>{t('rules.additionalRulesText')}</label>
                      <textarea
                        className={cls.textarea}
                        value={form.additionalRulesText}
                        onChange={e => updateField('additionalRulesText', e.target.value)}
                        placeholder={t('placeholders.additionalRules')}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SALE details */}
              {form.kind === 'SALE' && (
                <div className={cls.section}>
                  <div className={cls.sectionTitle}>
                    <ShoppingBag size={18} className={cls.sectionIcon} />
                    {t('sections.saleDetails')}
                  </div>

                  <div className={cls.field}>
                    <label className={cls.label}>{t('fields.propertyType')}</label>
                    <select
                      className={cls.select}
                      value={form.salePropertyType}
                      onChange={e => updateField('salePropertyType', e.target.value as SalePropertyType)}
                    >
                      <option value="flat">{t('propertyTypes.flat')}</option>
                      <option value="house">{t('propertyTypes.house')}</option>
                      <option value="cottage">{t('propertyTypes.cottage')}</option>
                      <option value="land">{t('propertyTypes.land')}</option>
                    </select>
                  </div>

                  <div className={cls.row}>
                    <div className={cls.field}>
                      <label className={cls.label}>{t('fields.roomsCount')}</label>
                      <input
                        className={cls.input}
                        type="number"
                        min="1"
                        max="20"
                        value={form.saleRoomsCount}
                        onChange={e => updateField('saleRoomsCount', e.target.value)}
                        placeholder={t('placeholders.roomsCount')}
                      />
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>{t('fields.totalArea')}</label>
                      <input
                        className={`${cls.input} ${errors.saleTotalArea ? cls.inputError : ''}`}
                        type="number"
                        min="1"
                        value={form.saleTotalArea}
                        onChange={e => updateField('saleTotalArea', e.target.value)}
                        placeholder={t('placeholders.totalArea')}
                      />
                      {errors.saleTotalArea && <div className={cls.errorText}>{errors.saleTotalArea}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* HOUSEMATE details */}
              {form.kind === 'HOUSEMATE' && (
                <div className={cls.section}>
                  <div className={cls.sectionTitle}>
                    <Users size={18} className={cls.sectionIcon} />
                    {t('sections.housemateDetails')}
                  </div>

                  <div className={cls.row}>
                    <div className={cls.field}>
                      <label className={cls.label}>{t('fields.housematePropertyType')}</label>
                      <select
                        className={cls.select}
                        value={form.housematePropertyType}
                        onChange={e => updateField('housematePropertyType', e.target.value as HousematePropertyType)}
                      >
                        <option value="flat">{t('propertyTypes.flat')}</option>
                        <option value="house">{t('propertyTypes.house')}</option>
                      </select>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>{t('fields.offeredPlaceType')}</label>
                      <select
                        className={cls.select}
                        value={form.offeredPlaceType}
                        onChange={e => updateField('offeredPlaceType', e.target.value as OfferedPlaceType)}
                      >
                        <option value="separate_room">{t('placeTypes.separate_room')}</option>
                        <option value="shared_room">{t('placeTypes.shared_room')}</option>
                        <option value="bed_place">{t('placeTypes.bed_place')}</option>
                        <option value="bed">{t('placeTypes.bed')}</option>
                      </select>
                    </div>
                  </div>

                  <div className={cls.field}>
                    <label className={cls.label}>
                      {t('fields.residentsCount')}
                      <span className={cls.required}>*</span>
                    </label>
                    <input
                      className={`${cls.input} ${errors.residentsCount ? cls.inputError : ''}`}
                      type="number"
                      min="1"
                      value={form.residentsCount}
                      onChange={e => updateField('residentsCount', e.target.value)}
                      placeholder={t('placeholders.residentsCount')}
                    />
                    {errors.residentsCount && <div className={cls.errorText}>{errors.residentsCount}</div>}
                  </div>
                </div>
              )}

              {/* Photos section (all types) */}
              <div className={cls.section}>
                <div className={cls.sectionTitle}>
                  <Camera size={18} className={cls.sectionIcon} />
                  {t('sections.photos')}
                </div>
                <p className={cls.hint} style={{ marginBottom: 12, marginTop: -8 }}>
                  {t('photosHint')}
                </p>
                <div className={cls.photoGrid}>
                  {photoPreviews.map((src, i) => (
                    <div key={i} className={`${cls.photoSlot} ${cls.photoSlotFilled}`}>
                      <img src={src} alt="" className={cls.photoPreview} />
                      <button
                        type="button"
                        className={cls.photoRemove}
                        onClick={() => removePhoto(i)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {photoFiles.length < 8 && (
                    <label className={cls.photoSlot}>
                      <ImagePlus size={22} style={{ color: 'var(--muted-foreground)' }} />
                      <span className={cls.photoPlaceholder}>{t('addPhoto')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className={cls.photoInput}
                        onChange={handlePhotoAdd}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className={cls.actions}>
                <button type="button" className={cls.btnBack} onClick={goBack}>
                  <ArrowLeft size={16} />
                  {t('prev')}
                </button>
                <button
                  type="button"
                  className={cls.btnPublish}
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  <Send size={16} />
                  {isSubmitting ? t('publishing') : t('publish')}
                </button>
              </div>
            </>
          )}

          {/* ── Step 4: Success ── */}
          {step === 'review' && createdAdId && (
            <div className={cls.success}>
              <div className={cls.successIcon}>
                <CheckCircle2 size={32} />
              </div>
              <h2 className={cls.successTitle}>
                {isPublished ? t('success.publishedTitle') : t('success.draftTitle')}
              </h2>
              <p className={cls.successDesc}>
                {isPublished ? t('success.publishedDesc') : t('success.draftDesc')}
              </p>
              <div className={cls.successActions}>
                <button
                  type="button"
                  className={cls.btnNext}
                  onClick={() => {
                    if (form.kind === 'RENT') router.push(`/rent/${createdAdId}`)
                    else if (form.kind === 'SALE') router.push('/sale')
                    else router.push('/co-living')
                  }}
                >
                  {t('success.viewAd')}
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className={cls.btnBack}
                  onClick={() => {
                    setForm(INITIAL_STATE)
                    setCreatedAdId(null)
                    setIsPublished(false)
                    setStep('type')
                    setPhotoFiles([])
                    setPhotoPreviews([])
                  }}
                >
                  {t('success.createAnother')}
                </button>
              </div>
            </div>
          )}
          {/* ── Phone Verification Modal ── */}
          {showVerify && (
            <div className={cls.verifyOverlay}>
              <div className={cls.verifyBackdrop} onClick={() => setShowVerify(false)} />
              <div className={cls.verifyModal}>
                <button
                  type="button"
                  className={cls.verifyClose}
                  onClick={() => setShowVerify(false)}
                >
                  <X size={18} />
                </button>

                <div className={cls.verifyIcon}>
                  <ShieldCheck size={28} />
                </div>

                <h3 className={cls.verifyTitle}>{t('verify.title')}</h3>
                <p className={cls.verifyDesc}>{t('verify.desc')}</p>

                {verifyError && (
                  <div className={cls.globalError}>
                    <AlertCircle size={14} />
                    {verifyError}
                  </div>
                )}

                <div className={cls.field}>
                  <label className={cls.label}>
                    <Phone size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                    {t('verify.phoneLabel')}
                  </label>
                  <input
                    className={cls.input}
                    type="tel"
                    value={verifyPhone}
                    onChange={e => setVerifyPhone(e.target.value)}
                    placeholder="+996 700 123 456"
                  />
                </div>
                <button
                  type="button"
                  className={cls.btnPublish}
                  style={{ width: '100%', marginTop: 12 }}
                  disabled={verifyLoading}
                  onClick={handleAddPhone}
                >
                  <CheckCircle2 size={16} />
                  {verifyLoading ? t('verify.verifying') : t('verify.confirm')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
