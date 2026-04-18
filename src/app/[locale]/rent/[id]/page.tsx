import { setRequestLocale } from 'next-intl/server'

import { RentDetail } from '@/components/ads/rent-detail/rent-detail'
import { TopAdBanner } from '@/shared/components/top-ad-banner/top-ad-banner'
import { Footer } from '@/widgets/footer/ui/footer'
import { MainHeader } from '@/widgets/main-header/ui/main-header'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function RentDetailPage({ params }: Props) {
  const { locale, id } = await params

  setRequestLocale(locale)

  return (
    <>
      <TopAdBanner />
      <main className="container">
        <MainHeader sticky={false} />
        <RentDetail id={id} />
      </main>
      <Footer />
    </>
  )
}
