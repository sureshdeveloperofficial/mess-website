'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const Logo: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings')
      return res.data
    },
    staleTime: 60000,
  })

  const restaurantName = settings?.restaurant_name || settings?.site_name || 'AL SHAMIL MESS.'
  const logoUrl = settings?.site_logo || ''

  return (
    <Link href='/' className='flex items-center gap-3 group'>
      {logoUrl ? (
        <img
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
