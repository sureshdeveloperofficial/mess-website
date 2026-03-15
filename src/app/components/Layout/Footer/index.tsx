'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import Logo from '../Header/Logo'
import { FooterLinkType } from '@/app/types/footerlink'

const Footer: FC = () => {
  const [footerlink, SetFooterlink] = useState<FooterLinkType[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        SetFooterlink(data.FooterLinkData)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <footer className='relative bg-neutral-50/50 pt-16 pb-12 overflow-hidden'>
      {/* Premium Animated Top Border */}
      <div className='absolute top-0 left-0 w-full h-[2px] animate-gradient-border opacity-70'></div>

      <div className='container relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-11 gap-12 lg:gap-16 pb-16 border-b border-grey/10'>
          {/* Logo and About Section */}
          <div className='md:col-span-5 lg:col-span-5'>
            <Logo />
            <p className='text-grey/80 text-base font-medium mt-6 mb-8 leading-relaxed max-w-sm'>
              Authentic home-style meals served daily with love. High quality,
              hygienic, and nutritious dining for every guest since 2015.
            </p>
            <div className='flex gap-4 items-center'>
              {[
                { icon: 'fa6-brands:facebook-f', href: '#' },
                { icon: 'fa6-brands:instagram', href: '#' },
                { icon: 'fa6-brands:x-twitter', href: '#' },
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className='group bg-white hover:bg-primary transition-all duration-300 rounded-full shadow-md hover:shadow-primary/20 p-3 flex items-center justify-center'
                >
                  <Icon
                    icon={social.icon}
                    width='18'
                    height='18'
                    className='group-hover:text-white text-grey transition-colors'
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Dynamic Links Sections */}
          <div className='md:col-span-2 lg:col-span-2'>
            <div className='space-y-6'>
              {footerlink.map((product, i) => (
                <div key={i} className='space-y-6'>
                  <h4 className='text-black text-lg font-bold uppercase tracking-wider'>
                    {product.section}
                  </h4>
                  <ul className='space-y-4'>
                    {product.links.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          href={item.href}
                          className='text-grey/70 hover:text-primary transition-colors text-base font-medium flex items-center group'
                        >
                          <span className='w-0 group-hover:w-2 h-[2px] bg-primary mr-0 group-hover:mr-2 transition-all duration-300'></span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className='md:col-span-4 lg:col-span-4 space-y-6'>
            <h4 className='text-black text-lg font-bold uppercase tracking-wider'>
              Newsletter
            </h4>
            <p className='text-grey/70 text-sm'>
              Subscribe to get the latest menus and special offers.
            </p>
            <div className='relative mt-4'>
              <input
                type='email'
                placeholder='Your Email'
                className='w-full bg-white border border-grey/10 rounded-full py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm pr-32'
              />
              <button className='absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 rounded-full transition-all text-sm shadow-md'>
                Join
              </button>
            </div>
            
            {/* Contact Details Integration */}
            <div className='pt-6 space-y-4'>
              <div className='flex items-start gap-3'>
                <Icon icon='solar:point-on-map-perspective-bold' className='text-primary text-xl mt-1 shrink-0' />
                <p className='text-grey/70 text-sm'>925 Filbert Street Pennsylvania 18072</p>
              </div>
              <div className='flex items-center gap-3'>
                <Icon icon='solar:phone-bold' className='text-primary text-xl shrink-0' />
                <p className='text-grey/70 text-sm'>+971 4 264 2613</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 flex flex-col md:flex-row justify-between items-center gap-6'>
          <p className='text-sm font-medium text-grey/60 text-center md:text-left'>
            © {new Date().getFullYear()} AL SHAMIL MESS.
          </p>

          <div className='flex gap-8'>
            <Link href='/privacy' className='text-xs font-bold text-grey/50 hover:text-primary uppercase tracking-widest transition-colors'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='text-xs font-bold text-grey/50 hover:text-primary uppercase tracking-widest transition-colors'>
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
