import { Suspense } from 'react'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { SaleFeed } from '@/components/ads/sale-feed'
import { Footer } from '@/widgets/footer/ui/footer'
import { MainHeader } from '@/widgets/main-header/ui/main-header'

import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SalePage' })

  const path = locale === 'ru' ? '/sale' : `/${locale}/sale`

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: path,
      languages: {
        ru: '/sale',
        en: '/en/sale',
        kg: '/kg/sale',
      },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `https://bolmo.kg${path}`,
      siteName: 'Bolmo',
      type: 'website',
    },
  }
}

export default async function SalePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('SalePage')

  return (
    <>
      <main>
        <MainHeader />
        <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--neutral-text)' }}>
              {t('heading')}
            </h1>
            <p style={{ fontSize: 15, color: '#6b7280', marginTop: 6 }}>
              {t('subheading')}
            </p>
          </div>
          <Suspense>
            <SaleFeed />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
