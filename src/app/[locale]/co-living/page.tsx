import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CoLivingLanding } from '@/components/co-living/co-living-landing'
import { Footer } from '@/widgets/footer/ui/footer'
import { MainHeader } from '@/widgets/main-header/ui/main-header'

import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'CoLivingPage' })

  const path = locale === 'ru' ? '/co-living' : `/${locale}/co-living`

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: path,
      languages: {
        ru: '/co-living',
        en: '/en/co-living',
        kg: '/kg/co-living',
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

export default async function CoLivingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <main className="container">
        <MainHeader />
      </main>
      <CoLivingLanding />
      <Footer />
    </>
  )
}
