'use client'

import React, { useState, useEffect, useCallback } from 'react'

import {
  FileText,
  Heart,
  Settings,
  Home,
  ShoppingBag,
  Users,
  Loader2,
  Plus,
  Archive,
  Eye,
  EyeOff,
  Send,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AdCard } from '@/components/ads/ad-card'
import { Link, useRouter } from '@/i18n/navigation'
import { rentAdsAPI, saleAdsAPI, housemateAdsAPI, favoritesAPI } from '@/lib/ads/api'
import type { RentAd, SaleAd, HousemateAd, AdBase, AdStatus, FavoriteItem } from '@/lib/ads/types'
import { ProtectedRoute } from '@/lib/auth/protected-route'
import { normalizeContactInput } from '@/lib/auth/utils'
import { normalizeMediaUrl } from '@/shared/api/axios'
import { useAuth } from '@/shared/providers/auth-provider'

import cls from './profile-page.module.css'

// ── Types ──

type Tab = 'ads' | 'favorites' | 'settings'
type StatusFilter = 'all' | AdStatus

type MyAd = (RentAd | SaleAd | HousemateAd) & { status: AdStatus }

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getAdLink(ad: AdBase): string {
  switch (ad.kind) {
    case 'RENT': return `/rent/${ad.id}`
    case 'SALE': return `/sale/${ad.id}`
    case 'HOUSEMATE': return `/co-living/${ad.id}`
    default: return '/'
  }
}

// ── Component ──

export const ProfilePage: React.FC = () => {
  const t = useTranslations('Profile')
  const tAds = useTranslations('Ads')
  const { user, logout, changePassword, addPhone } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('ads')

  // ── My Ads State ──
  const [myAds, setMyAds] = useState<MyAd[]>([])
  const [adsLoading, setAdsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── Favorites State ──
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [favsLoading, setFavsLoading] = useState(false)

  // ── Settings State ──
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  // ── Phone Verification State ──
  const [showVerify, setShowVerify] = useState(false)
  const [verifyPhone, setVerifyPhone] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [pendingPublishAd, setPendingPublishAd] = useState<MyAd | null>(null)

  // ── Load My Ads ──
  const loadMyAds = useCallback(async () => {
    setAdsLoading(true)
    try {
      const [rentRes, saleRes, hmRes] = await Promise.all([
        rentAdsAPI.myAds({ limit: 50 }),
        saleAdsAPI.myAds({ limit: 50 }),
        housemateAdsAPI.myAds({ limit: 50 }),
      ])

      const all: MyAd[] = [
        ...rentRes.items as MyAd[],
        ...saleRes.items as MyAd[],
        ...hmRes.items as MyAd[],
      ].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return db - da
      })

      setMyAds(all)
    } catch {
      // silently fail
    } finally {
      setAdsLoading(false)
    }
  }, [])

  // ── Load Favorites ──
  const loadFavorites = useCallback(async () => {
    setFavsLoading(true)
    try {
      const res = await favoritesAPI.list({ limit: 50 })
      setFavorites(res.items)
    } catch {
      // silently fail
    } finally {
      setFavsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'ads') loadMyAds()
    if (activeTab === 'favorites') loadFavorites()
  }, [activeTab, loadMyAds, loadFavorites])

  // ── Ad Actions ──

  const archiveAd = async (ad: MyAd) => {
    setActionLoading(ad.id)
    try {
      if (ad.kind === 'RENT') await rentAdsAPI.archive(ad.id)
      else if (ad.kind === 'SALE') await saleAdsAPI.archive(ad.id)
      else await housemateAdsAPI.archive(ad.id)
      setMyAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'ARCHIVED' as AdStatus } : a))
    } catch { /* */ }
    finally { setActionLoading(null) }
  }

  const toggleActive = async (ad: MyAd) => {
    setActionLoading(ad.id)
    try {
      const fn = ad.isActive
        ? (ad.kind === 'RENT' ? rentAdsAPI.deactivate : ad.kind === 'SALE' ? saleAdsAPI.deactivate : housemateAdsAPI.deactivate)
        : (ad.kind === 'RENT' ? rentAdsAPI.activate : ad.kind === 'SALE' ? saleAdsAPI.activate : housemateAdsAPI.activate)
      const res = await fn(ad.id)
      setMyAds(prev => prev.map(a => a.id === ad.id ? { ...a, isActive: res.isActive } : a))
    } catch { /* */ }
    finally { setActionLoading(null) }
  }

  const isPhoneVerified = user?.contactVerified

  const publishAd = async (ad: MyAd) => {
    if (!isPhoneVerified) {
      setPendingPublishAd(ad)
      setShowVerify(true)
      setVerifyPhone(user?.contactType === 'PHONE' ? (user?.contact ?? '') : '')
      setVerifyError('')
      return
    }
    doPublishAd(ad)
  }

  const doPublishAd = async (ad: MyAd) => {
    setActionLoading(ad.id)
    try {
      if (ad.kind === 'RENT') await rentAdsAPI.publish(ad.id)
      else if (ad.kind === 'SALE') await saleAdsAPI.publish(ad.id)
      else await housemateAdsAPI.publish(ad.id)
      setMyAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: 'PUBLISHED' as AdStatus } : a))
    } catch { /* */ }
    finally { setActionLoading(null) }
  }

  // ── Phone Verification Handlers ──

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
      if (pendingPublishAd) {
        doPublishAd(pendingPublishAd)
        setPendingPublishAd(null)
      }
    } catch {
      setVerifyError(t('verify.sendFailed'))
    } finally {
      setVerifyLoading(false)
    }
  }

  // ── Change Password ──

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!currentPassword) errs.currentPassword = t('settings.currentPwRequired')
    if (!newPassword || newPassword.length < 6) errs.newPassword = t('settings.newPwTooShort')
    if (newPassword !== confirmNewPassword) errs.confirmNewPassword = t('settings.pwMismatch')
    setPwErrors(errs)
    if (Object.keys(errs).length > 0) return

    setPwLoading(true)
    setPwSuccess(false)
    try {
      await changePassword(currentPassword, newPassword)
      setPwSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch {
      setPwErrors({ currentPassword: t('settings.pwChangeFailed') })
    } finally {
      setPwLoading(false)
    }
  }

  // ── Filtered Ads ──

  const filteredAds = statusFilter === 'all'
    ? myAds
    : myAds.filter(a => a.status === statusFilter)

  const adCounts: Record<string, number> = {
    all: myAds.length,
    PUBLISHED: myAds.filter(a => a.status === 'PUBLISHED').length,
    DRAFT: myAds.filter(a => a.status === 'DRAFT').length,
    ARCHIVED: myAds.filter(a => a.status === 'ARCHIVED').length,
    PENDING_MODERATION: myAds.filter(a => a.status === 'PENDING_MODERATION').length,
    REJECTED: myAds.filter(a => a.status === 'REJECTED').length,
  }

  // ── User initials ──

  const initials = user
    ? ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || '?'
    : '?'

  return (
    <ProtectedRoute>
      <div className={cls.page}>
        <div className={cls.container}>
          {/* ── User Header ── */}
          <div className={cls.userHeader}>
            <div className={cls.avatar}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials}
            </div>
            <div className={cls.userInfo}>
              <div className={cls.userName}>
                {user?.firstName} {user?.lastName}
              </div>
              <div className={cls.userContact}>
                {user?.contact}
                {user?.contactVerified ? (
                  <span className={`${cls.verifiedBadge} ${cls.verifiedBadgeOk}`}>
                    <CheckCircle2 size={10} />
                    {t('verified')}
                  </span>
                ) : (
                  <span className={`${cls.verifiedBadge} ${cls.verifiedBadgeNo}`}>
                    <AlertCircle size={10} />
                    {t('notVerified')}
                  </span>
                )}
              </div>
              <div className={cls.memberSince}>
                {t('memberSince', { date: formatDate(user?.createdAt) })}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className={cls.tabs}>
            <button
              type="button"
              className={`${cls.tab} ${activeTab === 'ads' ? cls.tabActive : ''}`}
              onClick={() => setActiveTab('ads')}
            >
              <FileText size={16} />
              {t('tabs.myAds')}
              <span className={cls.tabCount}>{adCounts.all}</span>
            </button>
            <button
              type="button"
              className={`${cls.tab} ${activeTab === 'favorites' ? cls.tabActive : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <Heart size={16} />
              {t('tabs.favorites')}
            </button>
            <button
              type="button"
              className={`${cls.tab} ${activeTab === 'settings' ? cls.tabActive : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              {t('tabs.settings')}
            </button>
          </div>

          {/* ════════ TAB: My Ads ════════ */}
          {activeTab === 'ads' && (
            <>
              <div className={cls.statusFilters}>
                {(['all', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as StatusFilter[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`${cls.statusChip} ${statusFilter === s ? cls.statusChipActive : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s !== 'all' && (
                      <span className={`${cls.statusDot} ${
                        s === 'PUBLISHED' ? cls.dotPublished : s === 'DRAFT' ? cls.dotDraft : cls.dotArchived
                      }`} />
                    )}
                    {t(`statusFilter.${s}`)}
                    {s === 'all'
                      ? ` (${adCounts.all})`
                      : ` (${adCounts[s]})`
                    }
                  </button>
                ))}
              </div>

              {adsLoading ? (
                <div className={cls.loader}>
                  <Loader2 size={28} className={cls.spinner} />
                </div>
              ) : filteredAds.length === 0 ? (
                <div className={cls.empty}>
                  <div className={cls.emptyIcon}>
                    <FileText size={24} />
                  </div>
                  <div className={cls.emptyTitle}>{t('emptyAds.title')}</div>
                  <div className={cls.emptyDesc}>{t('emptyAds.desc')}</div>
                  <Link href="/create-ad" className={cls.emptyBtn}>
                    <Plus size={16} />
                    {t('emptyAds.action')}
                  </Link>
                </div>
              ) : (
                <div className={cls.myAdList}>
                  {filteredAds.map(ad => (
                    <div key={ad.id} className={cls.myAdCard}>
                      <Link href={getAdLink(ad)} className={cls.myAdPhoto}>
                        {(ad.photos?.[0] || (ad.kind === 'RENT' && ad.rent.photos?.[0])) ? (
                          <img
                            src={normalizeMediaUrl(ad.kind === 'RENT' ? (ad.rent.photos?.[0] ?? ad.photos?.[0] ?? '') : (ad.photos?.[0] ?? ''))}
                            alt=""
                          />
                        ) : (
                          <Home size={24} />
                        )}
                      </Link>

                      <div className={cls.myAdBody}>
                        <div className={cls.myAdTop}>
                          <span className={`${cls.myAdStatus} ${
                            ad.status === 'PUBLISHED' ? cls.statusPublished
                              : ad.status === 'DRAFT' ? cls.statusDraft
                              : cls.statusArchived
                          }`}>
                            {t(`status.${ad.status}`)}
                          </span>
                          <span className={cls.myAdKind}>{tAds(`kind.${ad.kind}`)}</span>
                        </div>
                        <div className={cls.myAdTitle}>{ad.title}</div>
                        <div className={cls.myAdPrice}>{formatPrice(ad.price, ad.currency)}</div>
                        <div className={cls.myAdMeta}>
                          {ad.city} &middot; {formatDate(ad.createdAt)}
                          {ad.viewCount !== undefined && ` \u00b7 ${ad.viewCount} ${t('views')}`}
                        </div>
                      </div>

                      <div className={cls.myAdActions}>
                        {ad.status === 'DRAFT' && (
                          <button
                            type="button"
                            className={`${cls.actionBtn} ${cls.actionBtnPrimary}`}
                            disabled={actionLoading === ad.id}
                            onClick={() => publishAd(ad)}
                          >
                            <Send size={13} />
                            {t('actions.publish')}
                          </button>
                        )}
                        {ad.status === 'PUBLISHED' && (
                          <>
                            <button
                              type="button"
                              className={cls.actionBtn}
                              disabled={actionLoading === ad.id}
                              onClick={() => toggleActive(ad)}
                            >
                              {ad.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                              {ad.isActive ? t('actions.deactivate') : t('actions.activate')}
                            </button>
                            <button
                              type="button"
                              className={`${cls.actionBtn} ${cls.actionBtnDanger}`}
                              disabled={actionLoading === ad.id}
                              onClick={() => archiveAd(ad)}
                            >
                              <Archive size={13} />
                              {t('actions.archive')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════════ TAB: Favorites ════════ */}
          {activeTab === 'favorites' && (
            <>
              {favsLoading ? (
                <div className={cls.loader}>
                  <Loader2 size={28} className={cls.spinner} />
                </div>
              ) : favorites.length === 0 ? (
                <div className={cls.empty}>
                  <div className={cls.emptyIcon}>
                    <Heart size={24} />
                  </div>
                  <div className={cls.emptyTitle}>{t('emptyFavs.title')}</div>
                  <div className={cls.emptyDesc}>{t('emptyFavs.desc')}</div>
                  <Link href="/rent" className={cls.emptyBtn}>
                    {t('emptyFavs.action')}
                  </Link>
                </div>
              ) : (
                <div className={cls.favGrid}>
                  {favorites.map(fav => (
                    <AdCard key={fav.postId} ad={fav.post as RentAd | SaleAd | HousemateAd} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════════ TAB: Settings ════════ */}
          {activeTab === 'settings' && (
            <>
              {/* Change Password */}
              <div className={cls.settingsSection}>
                <div className={cls.settingsSectionTitle}>
                  <Lock size={18} className={cls.settingsIcon} />
                  {t('settings.changePassword')}
                </div>

                <form onSubmit={handleChangePassword}>
                  <div className={cls.settingsField}>
                    <label className={cls.settingsLabel}>{t('settings.currentPassword')}</label>
                    <input
                      type="password"
                      className={`${cls.settingsInput} ${pwErrors.currentPassword ? cls.settingsInputError : ''}`}
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setPwErrors(prev => { const n = {...prev}; delete n.currentPassword; return n }) }}
                    />
                    {pwErrors.currentPassword && <div className={cls.errorText}>{pwErrors.currentPassword}</div>}
                  </div>

                  <div className={cls.settingsField}>
                    <label className={cls.settingsLabel}>{t('settings.newPassword')}</label>
                    <input
                      type="password"
                      className={`${cls.settingsInput} ${pwErrors.newPassword ? cls.settingsInputError : ''}`}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPwErrors(prev => { const n = {...prev}; delete n.newPassword; return n }) }}
                    />
                    {pwErrors.newPassword && <div className={cls.errorText}>{pwErrors.newPassword}</div>}
                  </div>

                  <div className={cls.settingsField}>
                    <label className={cls.settingsLabel}>{t('settings.confirmNewPassword')}</label>
                    <input
                      type="password"
                      className={`${cls.settingsInput} ${pwErrors.confirmNewPassword ? cls.settingsInputError : ''}`}
                      value={confirmNewPassword}
                      onChange={e => { setConfirmNewPassword(e.target.value); setPwErrors(prev => { const n = {...prev}; delete n.confirmNewPassword; return n }) }}
                    />
                    {pwErrors.confirmNewPassword && <div className={cls.errorText}>{pwErrors.confirmNewPassword}</div>}
                  </div>

                  {pwSuccess && (
                    <div className={cls.successText}>
                      <CheckCircle2 size={14} />
                      {t('settings.pwChangeSuccess')}
                    </div>
                  )}

                  <button type="submit" className={cls.settingsBtn} disabled={pwLoading}>
                    {pwLoading ? t('settings.saving') : t('settings.savePassword')}
                  </button>
                </form>
              </div>

              {/* Logout */}
              <div className={cls.dangerSection}>
                <div className={cls.settingsSectionTitle}>
                  <LogOut size={18} style={{ color: 'var(--color-error)' }} />
                  {t('settings.logoutTitle')}
                </div>
                <button
                  type="button"
                  className={cls.dangerBtn}
                  onClick={() => void logout()}
                >
                  <LogOut size={16} />
                  {t('settings.logoutBtn')}
                </button>
              </div>
            </>
          )}
          {/* ── Phone Verification Modal ── */}
          {showVerify && (
            <div className={cls.verifyOverlay}>
              <div className={cls.verifyBackdrop} onClick={() => { setShowVerify(false); setPendingPublishAd(null) }} />
              <div className={cls.verifyModal}>
                <button type="button" className={cls.verifyClose} onClick={() => { setShowVerify(false); setPendingPublishAd(null) }}>
                  <X size={18} />
                </button>
                <div className={cls.verifyIcon}><ShieldCheck size={28} /></div>
                <h3 className={cls.verifyTitle}>{t('verify.title')}</h3>
                <p className={cls.verifyDesc}>{t('verify.desc')}</p>

                {verifyError && (
                  <div className={cls.globalError}><AlertCircle size={14} />{verifyError}</div>
                )}

                <div className={cls.settingsField}>
                  <label className={cls.settingsLabel}>
                    <Phone size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                    {t('verify.phoneLabel')}
                  </label>
                  <input
                    className={cls.settingsInput}
                    style={{ maxWidth: '100%' }}
                    type="tel"
                    value={verifyPhone}
                    onChange={e => setVerifyPhone(e.target.value)}
                    placeholder="+996 700 123 456"
                  />
                </div>
                <button
                  type="button"
                  className={cls.settingsBtn}
                  style={{ width: '100%' }}
                  disabled={verifyLoading}
                  onClick={handleAddPhone}
                >
                  <CheckCircle2 size={14} />
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
