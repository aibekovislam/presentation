import { setRequestLocale } from 'next-intl/server'

import { CreateAdForm } from '@/components/ads/create-ad/create-ad-form'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CreateAdPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <CreateAdForm />
}
