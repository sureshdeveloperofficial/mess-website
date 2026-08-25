'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import Logo from '../Header/Logo'
import { FooterLinkType } from '@/app/types/footerlink'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const Footer: FC = () => {
  const [footerlink, SetFooterlink] = useState<FooterLinkType[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings')
      return res.data
    },
    staleTime: 60000,
  })

  let restaurantName = settings?.restaurant_name || settings?.site_name || 'PREMIUM MESS'
  if (!restaurantName || restaurantName.toLowerCase().includes('shamil')) {
    restaurantName = 'PREMIUM MESS'
  }
  const siteBio = settings?.site_bio || 'Authentic home-style meals served daily with love. High quality, hygienic, and nutritious dining for every guest since 2015.'
  const contactPhone = settings?.contact_phone || '+971 4 264 2613'
  const contactAddress = settings?.contact_address || 'Al Nahda & Deira, Dubai, United Arab Emirates'
  const socialFacebook = settings?.social_facebook || 'https://facebook.com'
  const socialInstagram = settings?.social_instagram || 'https://instagram.com'
  const socialTwitter = settings?.social_twitter || 'https://twitter.com'
  const socialYoutube = settings?.social_youtube || 'https://youtube.com'

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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe')
      setSubscribed(true)
      toast.success(data.message || 'Thank you for subscribing to our newsletter!')
      setEmail('')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className='relative bg-neutral-50/50 pt-16 pb-12 overflow-hidden'>
      {/* Premium Animated Top Border */}
      <div className='absolute top-0 left-0 w-full h-[2px] animate-gradient-border opacity-70'></div>

      <div className='container relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-16 border-b border-grey/10'>
          {/* Logo and About Section */}
          <div className='lg:col-span-4 space-y-6'>
            <Logo />
            <p className='text-grey/80 text-sm md:text-base font-medium leading-relaxed max-w-sm'>
              {siteBio}
            </p>
            <div className='flex gap-3 items-center pt-2'>
              {[
                { icon: 'fa6-brands:facebook-f', href: socialFacebook },
                { icon: 'fa6-brands:instagram', href: socialInstagram },
                { icon: 'fa6-brands:x-twitter', href: socialTwitter },
                { icon: 'fa6-brands:youtube', href: socialYoutube },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group bg-white hover:bg-primary transition-all duration-300 rounded-full shadow-sm hover:shadow-primary/20 p-2.5 flex items-center justify-center'
                >
                  <Icon
                    icon={social.icon}
                    width='16'
                    height='16'
                    className='group-hover:text-white text-grey/70 transition-colors'
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Links Sections */}
          <div className='lg:col-span-4 grid grid-cols-2 gap-6'>
            {footerlink.map((product, i) => (
              <div key={i} className='space-y-4'>
                <h4 className='text-black text-base font-bold uppercase tracking-wider'>
                  {product.section}
                </h4>
                <ul className='space-y-3'>
                  {product.links.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        className='text-grey/70 hover:text-primary transition-colors text-sm font-medium'
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className='lg:col-span-4 space-y-4'>
            <h4 className='text-black text-base font-bold uppercase tracking-wider'>
              Subscribe to Newsletter
            </h4>
            <p className='text-grey/70 text-xs md:text-sm font-medium'>
              Get weekly menu updates and exclusive offers delivered directly to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className='relative flex items-center mt-3'>
              <input
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email...'
                className='w-full bg-white border border-grey/20 focus:border-primary/50 text-grey text-xs md:text-sm rounded-full py-3.5 pl-5 pr-28 focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-sm transition-all'
              />
              <button
                type='submit'
                disabled={loading}
                className='absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-70 text-white font-bold px-6 rounded-full transition-all text-xs shadow flex items-center justify-center min-w-[76px]'
              >
                {loading ? (
                  <Icon icon='line-md:loading-loop' className='text-base' />
                ) : (
                  'Join'
                )}
              </button>
            </form>

            {subscribed && (
              <p className='text-xs font-semibold text-green-600 flex items-center gap-1.5 pt-1'>
                <Icon icon='solar:check-circle-bold' className='text-sm' />
                Thank you for subscribing!
              </p>
            )}

            {/* Contact Details Integration */}
            <div className='pt-3 space-y-2.5'>
              <div className='flex items-start gap-2.5'>
                <Icon icon='solar:point-on-map-perspective-bold' className='text-primary text-lg mt-0.5 shrink-0' />
                <p className='text-grey/70 text-xs leading-relaxed'>
                  {contactAddress}
                </p>
              </div>
              <div className='flex items-center gap-2.5'>
                <Icon icon='solar:phone-bold' className='text-primary text-lg shrink-0' />
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className='text-grey/70 hover:text-primary transition-colors text-xs font-medium'>
                  {contactPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-xs font-medium text-grey/60 text-center md:text-left'>
            © {new Date().getFullYear()} {restaurantName}. All rights reserved.
          </p>

          <div className='flex gap-6'>
            <Link href='/privacy' className='text-xs font-bold text-grey/50 hover:text-primary uppercase tracking-wider transition-colors'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='text-xs font-bold text-grey/50 hover:text-primary uppercase tracking-wider transition-colors'>
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
