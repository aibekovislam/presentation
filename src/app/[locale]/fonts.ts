import localFont from 'next/font/local'

export const font = localFont({
  src: [
    {
      path: './../../../public/fonts/VKSansDisplay-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './../../../public/fonts/VKSansDisplay-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './../../../public/fonts/VKSansDisplay-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './../../../public/fonts/VKSansDisplay-DemiBold.ttf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--main-font',
})
