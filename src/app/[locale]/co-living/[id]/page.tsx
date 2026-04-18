import { setRequestLocale } from 'next-intl/server'

import { CoLivingDetail } from '@/components/ads/co-living-detail/co-living-detail'
import { TopAdBanner } from '@/shared/components/top-ad-banner/top-ad-banner'
import { Footer } from '@/widgets/footer/ui/footer'
import { MainHeader } from '@/widgets/main-header/ui/main-header'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function CoLivingDetailPage({ params }: Props) {
  const { locale, id } = await params

  setRequestLocale(locale)

  return (
    <>
      <TopAdBanner />
      <main className="container">
        <MainHeader sticky={false} />
        <CoLivingDetail id={id} />
      </main>
      <Footer />
    </>
  )
}
