import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Footer } from '@/widgets/footer/ui/footer'
import { HomeHero } from '@/widgets/home-hero/ui/home-hero'
import { MainHeader } from '@/widgets/main-header/ui/main-header'

import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  setRequestLocale(locale)

  return (
    <>
      <main className="container">
        <MainHeader />
        <HomeHero />
      </main>
      <Footer />
    </>
  )
}
