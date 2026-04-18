'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { HousemateFeed } from './housemate-feed'
import { ProfilesFeed } from './profiles-feed'
import cls from './co-living-tabs.module.css'

export const CoLivingTabs: React.FC = () => {
  const t = useTranslations('CoLivingPage')

  return (
    <Tabs defaultValue="ads">
      <TabsList className={cls.tabsList}>
        <TabsTrigger className={cls.tab} value="ads">
          {t('tabAds')}
        </TabsTrigger>
        <TabsTrigger className={cls.tab} value="profiles">
          {t('tabProfiles')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ads">
        <HousemateFeed />
      </TabsContent>

      <TabsContent value="profiles">
        <ProfilesFeed />
      </TabsContent>
    </Tabs>
  )
}
