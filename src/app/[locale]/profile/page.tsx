import { setRequestLocale } from 'next-intl/server'

import { ProfilePage } from '@/components/profile/profile-page'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function Profile({ params }: Props) {
  const { locale } = await params

  setRequestLocale(locale)

  return <ProfilePage />
}
