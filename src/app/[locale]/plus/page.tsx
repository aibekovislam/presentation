import { setRequestLocale } from 'next-intl/server'

import { PlusHeader } from '@/components/plus/plus-header'
import { PlusLanding } from '@/components/plus/plus-landing'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function PlusPage({ params }: Props) {
  const { locale } = await params

  setRequestLocale(locale)

  return (
    <div className="bg_plus" style={{ minHeight: '100vh' }}>
      <PlusHeader />
      <main className="container">
        <PlusLanding />
      </main>
    </div>
  )
}
