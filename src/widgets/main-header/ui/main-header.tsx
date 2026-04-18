'use client'

import React from 'react'

import { CheckCircle2, Crown, Globe, Home, Library, LogIn, LogOut, Menu, Plus, ShoppingBag, UserCircle2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { formatUserDisplayName } from '@/lib/auth/utils'
import { useAuth } from '@/shared/providers/auth-provider'

import {
  BurgerMenuRentHandbookRoutes,
  BurgerMenuRentRoutes,
  BurgerMenuCoLivingRoutes,
  BurgerMenuSaleRoutes,
} from '../model/main-header-menu-routes'

import cls from './main-header.module.css'

type MegaTabValue = 'rent' | 'coLiving' | 'sale'
type LocaleValue = 'ru' | 'en' | 'kg'

interface MainHeaderProps {
  sticky?: boolean
}

export const MainHeader: React.FC<MainHeaderProps> = ({ sticky = true }) => {
  const t = useTranslations('HomePage.Header')
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth()

  const pathname = usePathname()
  const router = useRouter()

  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false)
  const [activeMegaTab, setActiveMegaTab] = React.useState<MegaTabValue>('rent')
  const [isClientReady, setIsClientReady] = React.useState(false)

  React.useEffect(() => {
    setIsClientReady(true)
  }, [])

  const closeMegaMenu = React.useCallback(() => {
    setIsMegaMenuOpen(false)
  }, [])

  const openMegaMenu = React.useCallback(() => {
    setIsMegaMenuOpen(true)
  }, [])

  const handleBurgerClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (isMegaMenuOpen) {
        closeMegaMenu()

        return
      }

      openMegaMenu()
    },
    [isMegaMenuOpen, closeMegaMenu, openMegaMenu],
  )

  const changeLocale = (nextLocale: LocaleValue) => {
    router.replace(pathname, { locale: nextLocale })
  }

  const languageMenuTriggerId = 'main-header-language-trigger'
  const accountMenuTriggerId = 'main-header-account-trigger'
  const displayName = React.useMemo(() => {
    if (!user) {
      return ''
    }

    const fullName = formatUserDisplayName(user)

    return fullName || user.contact || t('actions.account')
  }, [t, user])

  return (
    <header className={`${cls.header} ${sticky ? '' : cls.headerStatic}`}>
      <div className={cls.navbar}>
        <div onClick={() => router.push('/')} className={cls.logo}>
          <div className={cls.logoCopy}>
            <span className={cls.logoText}>
              {'bolmo'.split('').map((ch, i) => (
                <span key={i} className={cls.logoLetter} style={{ animationDelay: `${i * 0.06}s` }}>{ch}</span>
              ))}
            </span>
          </div>
        </div>

        <nav className={cls.centerNav}>
          <Link
            href="/rent"
            className={`${cls.navLink} ${cls.navLinkRent} ${pathname === '/' || pathname.startsWith('/rent') ? cls.navLinkActive : ''}`}
          >
            <Home size={16} className={cls.navIcon} />
            <span className={cls.navLabel}>{t('nav.rent')}</span>
          </Link>

          <Link
            href="/co-living"
            className={`${cls.navLink} ${cls.navLinkCoLiving} ${pathname.startsWith('/co-living') ? cls.navLinkActive : ''}`}
          >
            <Users size={16} className={cls.navIcon} />
            <span className={cls.navLabel}>{t('nav.coLiving')}</span>
          </Link>

          <Link
            href="/sale"
            className={`${cls.navLink} ${cls.navLinkSale} ${pathname.startsWith('/sale') ? cls.navLinkActive : ''}`}
          >
            <ShoppingBag size={16} className={cls.navIcon} />
            <span className={cls.navLabel}>{t('nav.sale')}</span>
          </Link>
        </nav>

        <div className={cls.rightSide}>
          {isAuthLoading && <div className={cls.authSkeleton} />}

          {!isAuthLoading && !isAuthenticated && (
            <Button asChild size="pill" variant="outline" className={cls.authActionButton}>
              <Link href="/auth/login">
                <LogIn size={16} />
                <span>{t('actions.signIn')}</span>
              </Link>
            </Button>
          )}

          {!isAuthLoading && isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild id={accountMenuTriggerId}>
                <button className={cls.accountButton} aria-label={t('actions.account')} type="button">
                  <UserCircle2 size={18} />
                  <span className={cls.accountName}>{displayName}</span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className={cls.dropdownMenuContentCustom}
                align="end"
                aria-labelledby={accountMenuTriggerId}
              >
                {!user.contactVerified && user.contact && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/auth/verify?contact=${encodeURIComponent(user.contact ?? '')}`)}
                  >
                    <CheckCircle2 size={16} />
                    <span>{t('actions.verifyContact')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserCircle2 size={16} />
                  <span>{t('actions.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className={cls.plusMenuItem} onClick={() => router.push('/plus')}>
                  <Crown size={16} />
                  <span>bolmo Plus</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut size={16} />
                  <span>{t('actions.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button asChild size={'pill'} variant="ghost" className={cls.postButton}>
            <Link href="/create-ad">
              <Plus size={16} />
              <span>{t('actions.postAd')}</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild id={languageMenuTriggerId}>
              <button className={cls.iconButton} aria-label={t('actions.language')} type="button">
                <Globe size={18} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className={cls.dropdownMenuContentCustom}
              align="end"
              aria-labelledby={languageMenuTriggerId}
            >
              <DropdownMenuItem onClick={() => changeLocale('ru')}>
                Русский
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLocale('kg')}>
                Кыргызча
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLocale('en')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className={cls.burgerWrap}>
            <button
              className={`${cls.iconButton} ${cls.burgerButton} ${isMegaMenuOpen ? cls.iconButtonActive : ''}`}
              aria-label={t('actions.menu')}
              type="button"
              onClick={handleBurgerClick}
            >
              <Menu size={18} />
              <span className={cls.closeIcon} />
            </button>
          </div>

        </div>
      </div>

      {isClientReady && (
        <div className={`${cls.megaOverlay} ${isMegaMenuOpen ? cls.megaOverlayOpen : ''}`}>
          <button
            className={cls.megaBackdrop}
            type="button"
            aria-label={t('actions.menu')}
            onMouseDown={closeMegaMenu}
          />
          <div className={cls.megaPanelWrap} onPointerLeave={closeMegaMenu}>
            <div className={`${cls.megaPanel} container`}>
              <Tabs
                value={activeMegaTab}
                onValueChange={(nextValue) => setActiveMegaTab(nextValue as MegaTabValue)}
              >
                <TabsList className={cls.megaTabsList}>
                  <TabsTrigger className={cls.megaTab} value="rent">
                    {t('megaTabs.rent')}
                  </TabsTrigger>
                  <TabsTrigger className={cls.megaTab} value="coLiving">
                    {t('megaTabs.coLiving')}
                  </TabsTrigger>
                  <TabsTrigger className={cls.megaTab} value="sale">
                    {t('megaTabs.sale')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent className={cls.megaContent} value="rent">
                  <div className={cls.megaGrid}>
                    <div className={cls.leftCol}>
                      {BurgerMenuRentRoutes.map((item, index) => (
                        <Link key={index} className={cls.menuItem} href={item.href} onClick={closeMegaMenu}>
                          {t(`rent.${item.key}`)}
                        </Link>
                      ))}
                    </div>

                    <div className={cls.middleCol}>
                      {BurgerMenuRentHandbookRoutes.map((item, index) => (
                        <Link key={index} className={cls.journalItem} href={item.href} onClick={closeMegaMenu}>
                          <Library size={16} className={cls.journalIcon}/>
                          <span>{t(`journal.${item.key}`)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent className={cls.megaContent} value="coLiving">
                  <div className={cls.megaGrid}>
                    <div className={cls.leftCol}>
                      {BurgerMenuCoLivingRoutes.map((item, index) => (
                        <Link key={index} className={cls.menuItem} href={item.href} onClick={closeMegaMenu}>
                          {t(`coLiving.${item.key}`)}
                        </Link>
                      ))}
                    </div>

                    <div className={cls.middleCol}>
                      {BurgerMenuRentHandbookRoutes.map((item, index) => (
                        <Link key={index} className={cls.journalItem} href={item.href} onClick={closeMegaMenu}>
                          <Library size={16} className={cls.journalIcon}/>
                          <span>{t(`journal.${item.key}`)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent className={cls.megaContent} value="sale">
                  <div className={cls.megaGrid}>
                    <div className={cls.leftCol}>
                      {BurgerMenuSaleRoutes.map((item, index) => (
                        <Link key={index} className={cls.menuItem} href={item.href} onClick={closeMegaMenu}>
                          {t(`sale.${item.key}`)}
                        </Link>
                      ))}
                    </div>

                    <div className={cls.middleCol}>
                      {BurgerMenuRentHandbookRoutes.map((item, index) => (
                        <Link key={index} className={cls.journalItem} href={item.href} onClick={closeMegaMenu}>
                          <Library size={16} className={cls.journalIcon}/>
                          <span>{t(`journal.${item.key}`)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
