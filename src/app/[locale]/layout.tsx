import './globals.css'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routing } from '@/i18n/routing'

import { font } from './fonts'
import { AuthProvider } from '@/shared/providers'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type LayoutParams = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata(
  { params }: LayoutParams,
): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'LayoutMetadata' })

  const baseUrl = 'https://bolmo.kg'
  const canonicalPath = locale === 'ru' ? '/' : `/${locale}`

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('titleDefault'),
      template: '%s | Bolmo',
    },
    description: t('description'),
    alternates: {
      canonical: canonicalPath,
      languages: {
        ru: '/',
        en: '/en',
        kg: '/kg',
      },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: canonicalPath,
      siteName: 'Bolmo',
      type: 'website',
      locale:
        locale === 'ru'
          ? 'ru_RU'
          : locale === 'kg'
            ? 'ky_KG'
            : 'en_US',
      images: [
        {
          url: '/og/bolmo-og-default.jpg',
          width: 1200,
          height: 630,
          alt: t('ogAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: ['/og/bolmo-twitter-default.jpg'],
    },
    icons: {
      icon: '/favicon.ico',
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html lang={locale} data-theme="light" className={font.className} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
