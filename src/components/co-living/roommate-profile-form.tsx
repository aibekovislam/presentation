'use client'

import React, { useState, useEffect, useCallback } from 'react'

import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  Users,
  Cigarette,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'
import { roommateProfileAPI } from '@/lib/ads/api'
import type { UpdateRoommateProfileRequest, HousemateProfile } from '@/lib/ads/types'
import { ProtectedRoute } from '@/lib/auth/protected-route'

import cls from './roommate-profile-form.module.css'

// ── Form State ────────────────────────────────────────

interface FormState {
  // Step 1 — Budget
  currencyCode: string
  monthlyRentMin: string
  monthlyRentMax: string
  isDepositAcceptable: boolean
  maxDepositAmount: string
  rentPeriodType: string
  // Step 2 — Roommate preferences
  preferredGender: string
  minAge: string
  maxAge: string
  isOkWithCouples: boolean
  isOkWithChildren: boolean
  // Step 3 — Lifestyle
  smokingPolicy: string
  petsPolicy: string
  guestsPolicy: string
  alcoholPreference: string
  scheduleFrom: string
  scheduleTo: string
  roommateComment: string
  // Step 4 — About me
  homeType: string
  district: string
  homeDescription: string
  notes: string
}

const INITIAL_STATE: FormState = {
  currencyCode: 'KGS',
  monthlyRentMin: '',
  monthlyRentMax: '',
  isDepositAcceptable: true,
  maxDepositAmount: '',
  rentPeriodType: 'long_term',
  preferredGender: 'any',
  minAge: '',
  maxAge: '',
  isOkWithCouples: true,
  isOkWithChildren: true,
  smokingPolicy: 'no_smoking',
  petsPolicy: 'any',
  guestsPolicy: 'any',
  alcoholPreference: '',
  scheduleFrom: '',
  scheduleTo: '',
  roommateComment: '',
  homeType: '',
  district: '',
  homeDescription: '',
  notes: '',
}

const STEPS = ['budget', 'roommate', 'lifestyle', 'about'] as const
type StepKey = (typeof STEPS)[number]

function profileToForm(p: HousemateProfile): FormState {
  return {
    currencyCode: p.budget?.currencyCode ?? 'KGS',
    monthlyRentMin: p.budget?.monthlyRentMin != null ? String(p.budget.monthlyRentMin) : '',
    monthlyRentMax: p.budget?.monthlyRentMax != null ? String(p.budget.monthlyRentMax) : '',
    isDepositAcceptable: p.budget?.isDepositAcceptable ?? true,
    maxDepositAmount: p.budget?.maxDepositAmount != null ? String(p.budget.maxDepositAmount) : '',
    rentPeriodType: p.budget?.rentPeriodType ?? 'long_term',
    preferredGender: p.preferredGender ?? 'any',
    minAge: p.minAge != null ? String(p.minAge) : '',
    maxAge: p.maxAge != null ? String(p.maxAge) : '',
    isOkWithCouples: p.roommatePreferences?.isOkWithCouples ?? true,
    isOkWithChildren: p.roommatePreferences?.isOkWithChildren ?? true,
    smokingPolicy: p.roommatePreferences?.lifestyle?.smokingPreference ?? p.smokingPolicy ?? 'no_smoking',
    petsPolicy: p.roommatePreferences?.lifestyle?.petsPreference ?? p.petsPolicy ?? 'any',
    guestsPolicy: p.roommatePreferences?.lifestyle?.guestsPreference ?? p.guestsPolicy ?? 'any',
    alcoholPreference: p.roommatePreferences?.lifestyle?.alcoholPreference ?? '',
    scheduleFrom: p.roommatePreferences?.scheduleFrom != null ? String(p.roommatePreferences.scheduleFrom) : '',
    scheduleTo: p.roommatePreferences?.scheduleTo != null ? String(p.roommatePreferences.scheduleTo) : '',
    roommateComment: p.roommatePreferences?.roommateComment ?? '',
    homeType: p.currentHome?.homeType ?? '',
    district: p.currentHome?.district ?? '',
    homeDescription: p.currentHome?.description ?? '',
    notes: p.notes ?? '',
  }
}

function formToRequest(f: FormState): UpdateRoommateProfileRequest {
  return {
    preferredGender: f.preferredGender || null,
    minAge: f.minAge ? Number(f.minAge) : null,
    maxAge: f.maxAge ? Number(f.maxAge) : null,
    smokingPolicy: f.smokingPolicy || null,
    petsPolicy: f.petsPolicy || null,
    guestsPolicy: f.guestsPolicy || null,
    notes: f.notes || null,
    budget: {
      currencyCode: f.currencyCode || null,
      monthlyRentMin: f.monthlyRentMin ? Number(f.monthlyRentMin) : null,
      monthlyRentMax: f.monthlyRentMax ? Number(f.monthlyRentMax) : null,
      isDepositAcceptable: f.isDepositAcceptable,
      maxDepositAmount: f.maxDepositAmount ? Number(f.maxDepositAmount) : null,
      rentPeriodType: f.rentPeriodType || null,
    },
    currentHome: {
      homeType: f.homeType || null,
      district: f.district || null,
      description: f.homeDescription || null,
    },
    roommatePreferences: {
      preferredGender: f.preferredGender || null,
      preferredAgeFrom: f.minAge ? Number(f.minAge) : null,
      preferredAgeTo: f.maxAge ? Number(f.maxAge) : null,
      isOkWithCouples: f.isOkWithCouples,
      isOkWithChildren: f.isOkWithChildren,
      lifestyle: {
        smokingPreference: f.smokingPolicy || null,
        alcoholPreference: f.alcoholPreference || null,
        guestsPreference: f.guestsPolicy || null,
        petsPreference: f.petsPolicy || null,
      },
      scheduleFrom: f.scheduleFrom ? Number(f.scheduleFrom) : null,
      scheduleTo: f.scheduleTo ? Number(f.scheduleTo) : null,
      roommateComment: f.roommateComment || null,
    },
  }
}

// ── Component ─────────────────────────────────────────

export const RoommateProfileForm: React.FC = () => {
  const t = useTranslations('RoommateProfile')
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [isEditing, setIsEditing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing profile
  useEffect(() => {
    roommateProfileAPI.get()
      .then(res => {
        if (res.exists && res.profile) {
          setForm(profileToForm(res.profile))
          setIsEditing(true)
        }
      })
      .catch(() => { /* no profile yet */ })
      .finally(() => setPageLoading(false))
  }, [])

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await roommateProfileAPI.update(formToRequest(form))
      setSaved(true)
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const goBack = () => setStep(s => Math.max(s - 1, 0))

  // ── Render ──────────────────────────────────────────

  if (saved) {
    return (
      <ProtectedRoute>
        <div className={cls.page}>
          <div className={cls.container}>
            <div className={cls.success}>
              <div className={cls.successIcon}><CheckCircle2 size={32} /></div>
              <h2 className={cls.successTitle}>{t('success.title')}</h2>
              <p className={cls.successDesc}>{t('success.desc')}</p>
              <div className={cls.successActions}>
                <Link href="/co-living" className={cls.btnNext}>
                  {t('success.btn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className={cls.page}>
        <div className={cls.container}>
          {/* Back link */}
          <button type="button" className={cls.backLink} onClick={() => router.back()}>
            <ArrowLeft size={16} />
            {t('back')}
          </button>

          <h1 className={cls.title}>{isEditing ? t('titleEdit') : t('titleCreate')}</h1>
          <p className={cls.subtitle}>{t('subtitle')}</p>

          {/* Steps indicator */}
          <div className={cls.steps}>
            {STEPS.map((key, i) => (
              <React.Fragment key={key}>
                <div
                  className={`${cls.step} ${i === step ? cls.stepActive : ''} ${i < step ? cls.stepDone : ''}`}
                >
                  <div className={cls.stepCircle}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={cls.stepLabel}>{t(`steps.${key}`)}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`${cls.stepLine} ${i < step ? cls.stepLineDone : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {pageLoading ? (
            <div className={cls.loading}>
              <Loader2 size={32} className={cls.spinner} />
            </div>
          ) : (
            <>
              {error && (
                <div className={cls.globalError}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Step content */}
              {step === 0 && <StepBudget form={form} set={set} t={t} />}
              {step === 1 && <StepRoommate form={form} set={set} t={t} />}
              {step === 2 && <StepLifestyle form={form} set={set} t={t} />}
              {step === 3 && <StepAbout form={form} set={set} t={t} />}

              {/* Actions */}
              <div className={cls.actions}>
                {step > 0 ? (
                  <button type="button" className={cls.btnBack} onClick={goBack}>
                    <ArrowLeft size={16} />
                    {t('prev')}
                  </button>
                ) : (
                  <div />
                )}

                {step < STEPS.length - 1 ? (
                  <button type="button" className={cls.btnNext} onClick={goNext}>
                    {t('next')}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={cls.btnSave}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 size={16} className={cls.spinner} /> : <CheckCircle2 size={16} />}
                    {t('save')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

// ── Step Components ───────────────────────────────────

interface StepProps {
  form: FormState
  set: <K extends keyof FormState>(key: K, val: FormState[K]) => void
  t: ReturnType<typeof useTranslations>
}

// ── Step 1: Budget ────────────────────────────────────

const StepBudget: React.FC<StepProps> = ({ form, set, t }) => (
  <>
    <div className={cls.section}>
      <h3 className={cls.sectionTitle}>
        <Wallet size={18} className={cls.sectionIcon} />
        {t('steps.budget')}
      </h3>

      <div className={cls.field}>
        <label className={cls.label}>{t('budget.currency')}</label>
        <div className={cls.checkGroup}>
          {['KGS', 'USD', 'EUR'].map(c => (
            <button
              key={c}
              type="button"
              className={`${cls.chip} ${form.currencyCode === c ? cls.chipActive : ''}`}
              onClick={() => set('currencyCode', c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={cls.row}>
        <div className={cls.field}>
          <label className={cls.label}>{t('budget.minRent')}</label>
          <input
            type="number"
            className={cls.input}
            placeholder="5 000"
            value={form.monthlyRentMin}
            onChange={e => set('monthlyRentMin', e.target.value)}
          />
        </div>
        <div className={cls.field}>
          <label className={cls.label}>{t('budget.maxRent')}</label>
          <input
            type="number"
            className={cls.input}
            placeholder="15 000"
            value={form.monthlyRentMax}
            onChange={e => set('monthlyRentMax', e.target.value)}
          />
        </div>
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('budget.rentPeriod')}</label>
        <select
          className={cls.select}
          value={form.rentPeriodType}
          onChange={e => set('rentPeriodType', e.target.value)}
        >
          <option value="long_term">{t('budget.periods.long_term')}</option>
          <option value="short_term_daily">{t('budget.periods.short_term_daily')}</option>
          <option value="3_month">{t('budget.periods.3_month')}</option>
          <option value="6_month">{t('budget.periods.6_month')}</option>
          <option value="9_month">{t('budget.periods.9_month')}</option>
        </select>
      </div>

      <div className={cls.toggleRow}>
        <div>
          <div className={cls.toggleLabel}>{t('budget.depositOk')}</div>
          <div className={cls.toggleDesc}>{t('budget.depositOkHint')}</div>
        </div>
        <button
          type="button"
          className={`${cls.toggle} ${form.isDepositAcceptable ? cls.toggleOn : ''}`}
          onClick={() => set('isDepositAcceptable', !form.isDepositAcceptable)}
        />
      </div>

      {form.isDepositAcceptable && (
        <div className={cls.field}>
          <label className={cls.label}>{t('budget.maxDeposit')}</label>
          <input
            type="number"
            className={cls.input}
            placeholder="10 000"
            value={form.maxDepositAmount}
            onChange={e => set('maxDepositAmount', e.target.value)}
          />
        </div>
      )}
    </div>
  </>
)

// ── Step 2: Roommate Preferences ──────────────────────

const StepRoommate: React.FC<StepProps> = ({ form, set, t }) => (
  <>
    <div className={cls.section}>
      <h3 className={cls.sectionTitle}>
        <Users size={18} className={cls.sectionIcon} />
        {t('steps.roommate')}
      </h3>

      <div className={cls.field}>
        <label className={cls.label}>{t('roommate.gender')}</label>
        <div className={cls.checkGroup}>
          {['any', 'male', 'female'].map(g => (
            <button
              key={g}
              type="button"
              className={`${cls.chip} ${form.preferredGender === g ? cls.chipActive : ''}`}
              onClick={() => set('preferredGender', g)}
            >
              {t(`roommate.genders.${g}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={cls.row}>
        <div className={cls.field}>
          <label className={cls.label}>{t('roommate.minAge')}</label>
          <input
            type="number"
            className={cls.input}
            placeholder="18"
            value={form.minAge}
            onChange={e => set('minAge', e.target.value)}
          />
        </div>
        <div className={cls.field}>
          <label className={cls.label}>{t('roommate.maxAge')}</label>
          <input
            type="number"
            className={cls.input}
            placeholder="35"
            value={form.maxAge}
            onChange={e => set('maxAge', e.target.value)}
          />
        </div>
      </div>

      <div className={cls.toggleRow}>
        <div>
          <div className={cls.toggleLabel}>{t('roommate.okCouples')}</div>
        </div>
        <button
          type="button"
          className={`${cls.toggle} ${form.isOkWithCouples ? cls.toggleOn : ''}`}
          onClick={() => set('isOkWithCouples', !form.isOkWithCouples)}
        />
      </div>

      <div className={cls.toggleRow}>
        <div>
          <div className={cls.toggleLabel}>{t('roommate.okChildren')}</div>
        </div>
        <button
          type="button"
          className={`${cls.toggle} ${form.isOkWithChildren ? cls.toggleOn : ''}`}
          onClick={() => set('isOkWithChildren', !form.isOkWithChildren)}
        />
      </div>
    </div>
  </>
)

// ── Step 3: Lifestyle ─────────────────────────────────

const StepLifestyle: React.FC<StepProps> = ({ form, set, t }) => (
  <>
    <div className={cls.section}>
      <h3 className={cls.sectionTitle}>
        <Cigarette size={18} className={cls.sectionIcon} />
        {t('steps.lifestyle')}
      </h3>

      <div className={cls.field}>
        <label className={cls.label}>{t('lifestyle.smoking')}</label>
        <div className={cls.checkGroup}>
          {['no_smoking', 'outside_only', 'any'].map(v => (
            <button
              key={v}
              type="button"
              className={`${cls.chip} ${form.smokingPolicy === v ? cls.chipActive : ''}`}
              onClick={() => set('smokingPolicy', v)}
            >
              {t(`lifestyle.smokingOptions.${v}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('lifestyle.pets')}</label>
        <div className={cls.checkGroup}>
          {['no_pets', 'pets_ok', 'any'].map(v => (
            <button
              key={v}
              type="button"
              className={`${cls.chip} ${form.petsPolicy === v ? cls.chipActive : ''}`}
              onClick={() => set('petsPolicy', v)}
            >
              {t(`lifestyle.petsOptions.${v}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('lifestyle.guests')}</label>
        <div className={cls.checkGroup}>
          {['no_parties', 'sometimes_small', 'any'].map(v => (
            <button
              key={v}
              type="button"
              className={`${cls.chip} ${form.guestsPolicy === v ? cls.chipActive : ''}`}
              onClick={() => set('guestsPolicy', v)}
            >
              {t(`lifestyle.guestsOptions.${v}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('lifestyle.alcohol')}</label>
        <div className={cls.checkGroup}>
          {['no_alcohol', 'sometimes_ok', 'any'].map(v => (
            <button
              key={v}
              type="button"
              className={`${cls.chip} ${form.alcoholPreference === v ? cls.chipActive : ''}`}
              onClick={() => set('alcoholPreference', v)}
            >
              {t(`lifestyle.alcoholOptions.${v}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={cls.row}>
        <div className={cls.field}>
          <label className={cls.label}>{t('lifestyle.scheduleFrom')}</label>
          <input
            type="number"
            className={cls.input}
            placeholder="22"
            min={0}
            max={24}
            value={form.scheduleFrom}
            onChange={e => set('scheduleFrom', e.target.value)}
          />
          <p className={cls.hint}>{t('lifestyle.scheduleHint')}</p>
        </div>
        <div className={cls.field}>
          <label className={cls.label}>{t('lifestyle.scheduleTo')}</label>
          <input
            type="number"
            className={cls.input}
            placeholder="7"
            min={0}
            max={24}
            value={form.scheduleTo}
            onChange={e => set('scheduleTo', e.target.value)}
          />
        </div>
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('lifestyle.comment')}</label>
        <textarea
          className={cls.textarea}
          placeholder={t('lifestyle.commentPlaceholder')}
          value={form.roommateComment}
          onChange={e => set('roommateComment', e.target.value)}
        />
      </div>
    </div>
  </>
)

// ── Step 4: About Me ──────────────────────────────────

const StepAbout: React.FC<StepProps> = ({ form, set, t }) => (
  <>
    <div className={cls.section}>
      <h3 className={cls.sectionTitle}>
        <User size={18} className={cls.sectionIcon} />
        {t('steps.about')}
      </h3>

      <div className={cls.field}>
        <label className={cls.label}>{t('about.homeType')}</label>
        <select
          className={cls.select}
          value={form.homeType}
          onChange={e => set('homeType', e.target.value)}
        >
          <option value="">{t('about.selectHomeType')}</option>
          <option value="apartment">{t('about.homeTypes.apartment')}</option>
          <option value="house">{t('about.homeTypes.house')}</option>
          <option value="hostel">{t('about.homeTypes.hostel')}</option>
          <option value="room">{t('about.homeTypes.room')}</option>
        </select>
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('about.district')}</label>
        <input
          type="text"
          className={cls.input}
          placeholder={t('about.districtPlaceholder')}
          value={form.district}
          onChange={e => set('district', e.target.value)}
        />
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('about.homeDesc')}</label>
        <textarea
          className={cls.textarea}
          placeholder={t('about.homeDescPlaceholder')}
          value={form.homeDescription}
          onChange={e => set('homeDescription', e.target.value)}
        />
      </div>

      <div className={cls.field}>
        <label className={cls.label}>{t('about.notes')}</label>
        <textarea
          className={cls.textarea}
          placeholder={t('about.notesPlaceholder')}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
        <p className={cls.hint}>{t('about.notesHint')}</p>
      </div>
    </div>
  </>
)
