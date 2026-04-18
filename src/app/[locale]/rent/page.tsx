import { Suspense } from 'react'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { RentFeed } from '@/components/ads/rent-feed'
import { Footer } from '@/widgets/footer/ui/footer'
import { MainHeader } from '@/widgets/main-header/ui/main-header'

import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'RentPage' })

  const baseUrl = 'https://bolmo.kg'
  const path = locale === 'ru' ? '/rent' : `/${locale}/rent`

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: path,
      languages: {
        ru: '/rent',
        en: '/en/rent',
        kg: '/kg/rent',
      },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${baseUrl}${path}`,
      siteName: 'Bolmo',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  }
}

export default async function RentPage({ params }: Props) {
  const { locale } = await params

  setRequestLocale(locale)

  return (
    <>
      <main className="container">
        <MainHeader />
        <Suspense>
          <RentFeed />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
