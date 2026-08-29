'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import Logo from '../Header/Logo'
import { FooterLinkType } from '@/app/types/footerlink'
import { useSettings } from '@/app/hooks/useSettings'

const Footer: FC = () => {
  const [footerlink, SetFooterlink] = useState<FooterLinkType[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const { data: settings } = useSettings()

  let restaurantName = settings?.restaurant_name || settings?.site_name || 'PREMIUM MESS'
  if (!restaurantName || restaurantName.toLowerCase().includes('shamil')) {
    restaurantName = 'PREMIUM MESS'
  }
  let siteBio = settings?.site_bio || 'Authentic home-style meals served daily with love. High quality, hygienic, and nutritious dining for every guest.'
  siteBio = siteBio.replace(/\s*since\s*2015\.?/gi, '.').replace(/\.\./g, '.')
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
    <footer className='relative bg-[#FFFDF5] pt-16 pb-12 overflow-hidden border-t border-[#fed869]/40'>
      {/* Premium Honey Yellow Animated Top Border */}
      <div className='absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-[#fed869] via-[#e6c04f] to-[#fed869] opacity-90'></div>

      <div className='container relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-16 border-b border-[#fed869]/25'>
          {/* Logo and About Section */}
          <div className='lg:col-span-4 space-y-6'>
            <Logo />
            <p className='text-grey-dark/75 text-sm md:text-base font-medium leading-relaxed max-w-sm'>
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
                  className='group bg-white hover:bg-[#fed869] transition-all duration-300 rounded-full shadow-sm hover:shadow-[#fed869]/40 border border-[#fed869]/40 p-2.5 flex items-center justify-center'
                >
                  <Icon
                    icon={social.icon}
                    width='16'
                    height='16'
                    className='group-hover:text-grey-dark text-grey-dark/70 transition-colors'
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Links Sections */}
          <div className='lg:col-span-4 grid grid-cols-2 gap-6'>
            {footerlink.map((product, i) => (
              <div key={i} className='space-y-4'>
                <h4 className='text-grey-dark text-base font-extrabold uppercase tracking-wider'>
                  {product.section}
                </h4>
                <ul className='space-y-3'>
                  {product.links.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        className='text-grey-dark/70 hover:text-amber-700 transition-colors text-sm font-medium'
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
            <h4 className='text-grey-dark text-base font-extrabold uppercase tracking-wider'>
              Subscribe to Newsletter
            </h4>
            <p className='text-grey-dark/70 text-xs md:text-sm font-medium'>
              Get weekly menu updates and exclusive offers delivered directly to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className='relative flex items-center mt-3'>
              <input
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email...'
                className='w-full bg-white border border-[#fed869]/50 focus:border-[#fed869] text-grey-dark text-xs md:text-sm rounded-full py-3.5 pl-5 pr-28 focus:outline-none focus:ring-2 focus:ring-[#fed869]/30 shadow-sm transition-all placeholder:text-grey-dark/40 font-medium'
              />
              <button
                type='submit'
                disabled={loading}
                className='absolute right-1.5 top-1.5 bottom-1.5 bg-[#fed869] hover:bg-[#e6c04f] active:scale-95 disabled:opacity-70 text-grey-dark font-extrabold px-6 rounded-full transition-all text-xs shadow-md shadow-[#fed869]/35 flex items-center justify-center min-w-[76px] cursor-pointer'
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
              <a
                href='https://www.google.com/maps/place/PREMIUM+CHEFFS+RESTAURANT/@25.2912692,55.4030596,594m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3e5f5ff265ef9e23:0x969e78034608b30d!8m2!3d25.2912692!4d55.4030596!16s%2Fg%2F11x36px11g?entry=ttu&g_ep=EgoyMDI2MDgyMy4wIKXMDSoASAFQAw%3D%3D'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2.5 group hover:text-amber-600 transition-colors cursor-pointer'
                title='Open PREMIUM CHEFFS RESTAURANT on Google Maps'
              >
                <Icon icon='solar:map-point-bold' className='text-amber-600 text-lg shrink-0 group-hover:scale-110 transition-all' />
                <span className='text-grey-dark/80 group-hover:text-amber-600 text-xs leading-relaxed transition-colors font-semibold flex items-center gap-1.5'>
                  PREMIUM CHEFFS RESTAURANT
                  <Icon icon='solar:arrow-right-up-linear' className='text-xs opacity-60 group-hover:opacity-100 transition-opacity' />
                </span>
              </a>
              <div className='flex items-center gap-2.5'>
                <Icon icon='solar:phone-bold' className='text-amber-600 text-lg shrink-0' />
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className='text-grey-dark/70 hover:text-amber-600 transition-colors text-xs font-semibold'>
                  {contactPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-xs font-medium text-grey-dark/60 text-center md:text-left'>
            © {new Date().getFullYear()} {restaurantName}. All rights reserved.
          </p>

          <div className='flex gap-6'>
            <Link href='/privacy' className='text-xs font-bold text-grey-dark/50 hover:text-amber-600 uppercase tracking-wider transition-colors'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='text-xs font-bold text-grey-dark/50 hover:text-amber-600 uppercase tracking-wider transition-colors'>
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
