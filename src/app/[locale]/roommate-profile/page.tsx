import { setRequestLocale } from 'next-intl/server'

import { RoommateProfileForm } from '@/components/co-living/roommate-profile-form'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function RoommateProfilePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return <RoommateProfileForm />
}
