'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSettings } from '@/app/hooks/useSettings'

const Logo: React.FC = () => {
  const { data: settings } = useSettings()

  let restaurantName = settings?.restaurant_name || settings?.site_name || 'PREMIUM MESS'
  if (!restaurantName || restaurantName.toLowerCase().includes('shamil')) {
    restaurantName = 'PREMIUM MESS'
  }
  const logoUrl = settings?.site_logo || ''

  return (
    <Link href='/' className='flex items-center gap-3 group'>
      {logoUrl ? (
        <img
          key={logoUrl}
          src={logoUrl}
          alt={restaurantName}
          className='h-9 md:h-11 w-auto max-w-[140px] object-contain transition-transform group-hover:scale-105 duration-200'
        />
      ) : (
        <Image
          src='/images/Logo/Logo.svg'
          alt='logo'
          width={117}
          height={34}
          className='w-fit transition-transform group-hover:scale-105 duration-200'
          quality={100}
        />
      )}
      <p className='text-black text-xl xl:text-2xl font-bold whitespace-nowrap tracking-tight'>
        {restaurantName}
      </p>
    </Link>
  )
}

export default Logo
