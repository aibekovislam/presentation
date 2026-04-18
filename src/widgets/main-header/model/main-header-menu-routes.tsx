interface MainHeaderBurgerMenuRoutesTypes {
    key: string
    href: string
}

export const BurgerMenuRentRoutes: MainHeaderBurgerMenuRoutesTypes[] = [
  {
    key: 'long',
    href: '/rent?rentType=long_term',
  },
  {
    key: 'flats',
    href: '/rent?rentType=long_term&propertyType=flat',
  },
  {
    key: 'room',
    href: '/rent?rentType=long_term&propertyType=room',
  },
  {
    key: 'houses',
    href: '/rent?rentType=long_term&propertyType=house',
  },
  {
    key: 'daily',
    href: '/rent?rentType=daily',
  },
  {
    key: 'leaseOut',
    href: '/rent/lease-out',
  },
]

export const BurgerMenuCoLivingRoutes: MainHeaderBurgerMenuRoutesTypes[] = [
  {
    key: 'search',
    href: '/co-living',
  },
  {
    key: 'post',
    href: '/co-living?tab=profiles',
  },
]

export const BurgerMenuRentHandbookRoutes: MainHeaderBurgerMenuRoutesTypes[] = [
  {
    key: 'rent',
    href: '/journal/rent',
  },
  {
    key: 'coLiving',
    href: '/journal/co-living',
  },
  {
    key: 'forms',
    href: '/journal/forms',
  },
]
