'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface DeliveryZone {
  id?: string
  name: string
  status: 'active' | 'coming_soon' | 'inactive'
  timing: string
  isPopular?: boolean
  notes?: string
}

const FALLBACK_COVERED_ZONES: DeliveryZone[] = [
  { name: 'Al Quoz', status: 'active', timing: 'Lunch & Dinner', isPopular: true },
  { name: 'Al Khail Gate', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true },
  { name: 'International City', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true },
  { name: 'Al Warqa', status: 'active', timing: 'Lunch & Dinner', isPopular: true },
  { name: 'Al Warsan', status: 'active', timing: 'Lunch & Dinner', isPopular: true },
  { name: 'DIP (Dubai Investment Park)', status: 'active', timing: 'Lunch & Dinner', isPopular: true },
  { name: 'Jebel Ali', status: 'active', timing: 'Lunch & Dinner', isPopular: true },
  { name: 'Deira', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true },
  { name: 'Al Nahda', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true },
  { name: 'Al Karama', status: 'active', timing: 'Lunch & Dinner' },
  { name: 'Bur Dubai', status: 'active', timing: 'Lunch & Dinner' },
  { name: 'Business Bay', status: 'active', timing: 'Lunch & Dinner' },
  { name: 'Al Barsha', status: 'active', timing: 'Lunch & Dinner' },
  { name: 'Silicon Oasis', status: 'active', timing: 'Lunch & Dinner' },
  { name: 'Discovery Gardens', status: 'active', timing: 'Lunch & Dinner' },
  { name: 'Muhaisnah', status: 'active', timing: 'Breakfast, Lunch & Dinner' },
]

const HOW_IT_WORKS_STEPS = [
  {
    step: 'STEP 1',
    title: 'Message on WhatsApp',
    description: 'Tell us your plan, area and preferences.',
    icon: 'solar:chat-round-dots-bold-duotone',
  },
  {
    step: 'STEP 2',
    title: 'Confirm your plan',
    description: 'We confirm your menu and delivery schedule.',
    icon: 'solar:clipboard-check-bold-duotone',
  },
  {
    step: 'STEP 3',
    title: 'Complete payment',
    description: 'Bank transfer, cash or card payment link.',
    icon: 'solar:card-bold-duotone',
  },
  {
    step: 'STEP 4',
    title: 'Daily delivery',
    description: 'Fresh meals delivered to your home or office.',
    icon: 'solar:box-minimalistic-bold-duotone',
  },
]

const WHY_CHOOSE_ITEMS = [
  {
    title: 'Authentic flavours',
    description: 'Recipes that taste like home, every single day.',
    icon: 'solar:chef-hat-bold-duotone',
  },
  {
    title: 'Cooked with care',
    description: 'Fresh ingredients, hygienic kitchen, daily preparation.',
    icon: 'solar:heart-bold-duotone',
  },
  {
    title: 'Free home delivery',
    description: 'Doorstep delivery across selected Dubai locations.',
    icon: 'solar:scooter-bold-duotone',
  },
  {
    title: 'Trusted by families',
    description: 'Reliable monthly meal service you can count on.',
    icon: 'solar:users-group-rounded-bold-duotone',
  },
  {
    title: '24x7 support',
    description: 'Reach us anytime on WhatsApp.',
    icon: 'solar:clock-circle-bold-duotone',
  },
  {
    title: 'Flexible plans',
    description: '1, 2 or 3 time monthly plans tailored to you.',
    icon: 'solar:medal-ribbons-star-bold-duotone',
  },
]

export default function DeliveryAreasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<{
    searched: boolean
    isCovered: boolean
    isComingSoon?: boolean
    areaName: string
    timing?: string
  } | null>(null)

  const { data: dynamicAreas = [] } = useQuery<DeliveryZone[]>({
    queryKey: ['delivery-areas'],
    queryFn: async () => {
      const res = await axios.get('/api/delivery-areas')
      return res.data
    },
    staleTime: 60000,
  })

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings')
      return res.data
    },
    staleTime: 60000,
  })

  const restaurantName = settings?.restaurant_name || settings?.site_name || 'PREMIUM MESS'
  const contactAddress = settings?.contact_address || 'Al Quoz 1, Phase 2, Dubai, United Arab Emirates'
  const whatsappNumber = (settings?.contact_whatsapp || settings?.contact_phone || '+97142642613').replace(/[^0-9]/g, '')

  const activeZones = useMemo(() => {
    if (dynamicAreas.length > 0) {
      return dynamicAreas.filter(z => z.status !== 'inactive')
    }
    return FALLBACK_COVERED_ZONES
  }, [dynamicAreas])

  const popularTags = useMemo(() => {
    const popular = activeZones.filter(z => z.isPopular).map(z => z.name)
    if (popular.length > 0) return popular
    return activeZones.slice(0, 9).map(z => z.name)
  }, [activeZones])

  const handleCheckArea = (areaToTest?: string) => {
    const query = (areaToTest !== undefined ? areaToTest : searchQuery).trim()
    if (!query) {
      setSearchResult(null)
      return
    }

    const matched = activeZones.find(
      (z) =>
        z.name.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(z.name.toLowerCase())
    )

    if (matched) {
      if (matched.status === 'coming_soon') {
        setSearchResult({
          searched: true,
          isCovered: false,
          isComingSoon: true,
          areaName: matched.name,
          timing: matched.timing,
        })
      } else {
        setSearchResult({
          searched: true,
          isCovered: true,
          areaName: matched.name,
          timing: matched.timing,
        })
      }
    } else {
      setSearchResult({
        searched: true,
        isCovered: false,
        areaName: query,
      })
    }
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
    handleCheckArea(tag)
  }

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    searchResult?.areaName
      ? `Hello ${restaurantName}! I want to check meal delivery for ${searchResult.areaName}.`
      : `Hello ${restaurantName}! I would like to inquire about your meal delivery service.`
  )}`

  return (
    <main className='pt-20 bg-[#FFFDF5] min-h-screen'>
      {/* Hero Banner Section */}
      <section className='pt-16 pb-16 bg-linear-to-b from-primary/15 via-primary/5 to-[#FFFDF5] relative overflow-hidden'>
        <div className='absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-10 -right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none' />

        <div className='container max-w-6xl mx-auto px-4 relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch'>
            {/* Left Column: Search and Checker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='lg:col-span-7 flex flex-col justify-between'
            >
              <div>
                <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-grey-dark text-xs font-semibold mb-4 border border-primary/30'>
                  <Icon icon='solar:map-point-wave-bold-duotone' className='text-sm text-primary' />
                  DELIVERY AREAS
                </div>

                <h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold text-grey-dark tracking-tight leading-tight mb-4'>
                  Free delivery across <span className='text-primary'>selected Dubai areas</span>
                </h1>

                <p className='text-grey-muted text-sm sm:text-base font-normal leading-relaxed mb-8 max-w-xl'>
                  Type your area to check coverage. If you don't see your area, message us — we may already serve it.
                </p>

                {/* Area Input Box */}
                <div className='relative mb-6'>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleCheckArea()
                    }}
                    className='relative flex items-center bg-white rounded-full p-2 pl-5 border border-grey/15 shadow-sm focus-within:border-primary focus-within:shadow-md transition-all'
                  >
                    <Icon icon='solar:magnifer-linear' className='text-xl text-grey-dark/50 mr-3 shrink-0' />
                    <input
                      type='text'
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (!e.target.value.trim()) setSearchResult(null)
                      }}
                      placeholder='Enter your area (e.g. Al Quoz, Deira, DIP)'
                      className='w-full bg-transparent text-sm sm:text-base font-semibold text-grey-dark placeholder:text-grey-dark/40 placeholder:font-normal focus:outline-none'
                    />
                    <button
                      type='submit'
                      className='px-6 py-3 bg-primary text-grey-dark font-extrabold text-sm rounded-full hover:bg-primary/90 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95'
                    >
                      Check
                    </button>
                  </form>
                </div>

                {/* Dynamic Coverage Status Result */}
                <AnimatePresence>
                  {searchResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      className={`p-5 rounded-2xl border mb-6 ${
                        searchResult.isCovered
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                          : searchResult.isComingSoon
                          ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                          : 'bg-amber-50/80 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex items-start gap-3'>
                          <Icon
                            icon={
                              searchResult.isCovered
                                ? 'solar:check-circle-bold'
                                : searchResult.isComingSoon
                                ? 'solar:hourglass-bold'
                                : 'solar:info-circle-bold'
                            }
                            className={`text-2xl shrink-0 mt-0.5 ${
                              searchResult.isCovered
                                ? 'text-emerald-600'
                                : searchResult.isComingSoon
                                ? 'text-blue-600'
                                : 'text-amber-600'
                            }`}
                          />
                          <div>
                            <h4 className='text-base font-extrabold mb-1'>
                              {searchResult.isCovered
                                ? `Great news! We deliver to ${searchResult.areaName}`
                                : searchResult.isComingSoon
                                ? `Coming Soon to ${searchResult.areaName}!`
                                : `Custom delivery for ${searchResult.areaName}`}
                            </h4>
                            <p className='text-xs sm:text-sm font-medium leading-relaxed opacity-90'>
                              {searchResult.isCovered
                                ? `Free daily doorstep delivery is available (${searchResult.timing}). Start your monthly subscription now!`
                                : searchResult.isComingSoon
                                ? `We are currently expanding our daily meal delivery routes to ${searchResult.areaName} (${searchResult.timing || 'Lunch & Dinner'}). Join our waitlist on WhatsApp!`
                                : `We may already deliver to your building or can arrange dedicated cluster drops for ${searchResult.areaName}. Chat with us directly on WhatsApp.`}
                            </p>
                          </div>
                        </div>
                        <a
                          href={whatsappUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 flex items-center gap-1.5 transition-all shadow-xs ${
                            searchResult.isCovered
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : searchResult.isComingSoon
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-amber-600 text-white hover:bg-amber-700'
                          }`}
                        >
                          <Icon icon='solar:chat-round-dots-bold' className='text-base' />
                          {searchResult.isComingSoon ? 'WhatsApp Waitlist' : 'Order on WhatsApp'}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Popular Clickable Tags */}
                <div className='flex flex-wrap items-center gap-2 mb-4'>
                  {popularTags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTagClick(tag)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        searchQuery.toLowerCase() === tag.toLowerCase()
                          ? 'bg-primary text-grey-dark border-primary shadow-xs'
                          : 'bg-white/80 text-grey-dark/80 border-grey/15 hover:border-primary hover:text-grey-dark hover:bg-white'
                      }`}
                    >
                      <Icon icon='solar:map-point-linear' className='text-xs text-primary' />
                      {tag}
                    </button>
                  ))}
                </div>

                <p className='text-xs font-medium text-grey-dark/50'>
                  More locations coming soon • Custom corporate and cluster drops available
                </p>
              </div>
            </motion.div>

            {/* Right Column: Kitchen Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className='lg:col-span-5'
            >
              <div className='h-full bg-white p-7 sm:p-8 rounded-3xl border border-grey/10 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow'>
                {/* Decorative Map Grid Pattern */}
                <div className='absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2D2A26_1px,transparent_1px)] [background-size:16px_16px]' />

                <div>
                  <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-grey-dark text-[10px] font-extrabold uppercase tracking-wider mb-4 border border-primary/20'>
                    <Icon icon='solar:chef-hat-bold' className='text-primary' />
                    KITCHEN LOCATION
                  </div>

                  <h3 className='text-2xl font-extrabold text-grey-dark mb-2'>
                    Al Quoz, Dubai
                  </h3>
                  <p className='text-xs sm:text-sm font-normal text-grey-dark/70 leading-relaxed mb-6'>
                    Visit us or call to plan your monthly subscription. Fresh meals dispatched hot every morning and evening.
                  </p>

                  {/* Route & Network Visual Illustration */}
                  <div className='bg-[#FFF9E6] p-5 rounded-2xl border border-primary/20 mb-6 relative overflow-hidden'>
                    <div className='flex items-center justify-between text-xs font-bold text-grey-dark mb-4'>
                      <span className='flex items-center gap-1.5 text-primary font-extrabold'>
                        <span className='w-2 h-2 rounded-full bg-primary animate-ping inline-block' />
                        Kitchen Hub
                      </span>
                      <span className='text-grey-dark/60 font-semibold'>Direct Doorstep Delivery</span>
                    </div>

                    {/* Stylized delivery wave curve */}
                    <div className='relative h-20 w-full flex items-center justify-center'>
                      <svg
                        className='w-full h-full'
                        viewBox='0 0 300 80'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M 20 50 Q 80 10, 150 45 T 280 20'
                          stroke='currentColor'
                          strokeWidth='3'
                          strokeLinecap='round'
                          className='text-primary/70'
                          strokeDasharray='6 6'
                        />
                        <circle cx='20' cy='50' r='6' className='fill-primary' />
                        <circle cx='280' cy='20' r='6' className='fill-emerald-500 animate-pulse' />
                      </svg>
                      <div className='absolute left-1 bottom-1 text-[10px] font-bold text-grey-dark/70 bg-white px-2 py-0.5 rounded-md border border-grey/10 shadow-2xs'>
                        Kitchen Hub
                      </div>
                      <div className='absolute right-1 top-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs'>
                        Your Doorstep
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href='https://maps.google.com/?q=Al+Quoz+1+Dubai'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full py-3.5 px-6 rounded-2xl bg-grey-dark text-white font-extrabold text-sm text-center hover:bg-grey-dark/90 transition-all flex items-center justify-center gap-2 shadow-xs group-hover:scale-[1.01]'
                >
                  <Icon icon='solar:map-point-bold' className='text-primary text-base' />
                  Open in Google Maps
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className='py-16 bg-white relative overflow-hidden'>
        <div className='container max-w-6xl mx-auto px-4'>
          <div className='text-center mb-12'>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='text-primary text-xs font-semibold mb-3 tracking-wider uppercase'
            >
              HOW IT WORKS
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className='text-3xl sm:text-5xl font-extrabold text-grey-dark tracking-tight leading-none'
            >
              From <span className='text-primary'>WhatsApp</span> to your doorstep
            </motion.h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {HOW_IT_WORKS_STEPS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className='bg-[#FFF9E6] p-6 sm:p-7 rounded-3xl border border-primary/20 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between'
              >
                <div>
                  <div className='w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/20 group-hover:scale-105 transition-transform'>
                    <Icon icon={item.icon} className='text-2xl' />
                  </div>
                  <span className='text-[10px] font-extrabold tracking-widest text-primary uppercase block mb-1.5'>
                    {item.step}
                  </span>
                  <h3 className='text-lg font-extrabold text-grey-dark mb-2'>
                    {item.title}
                  </h3>
                  <p className='text-xs sm:text-sm font-normal text-grey-dark/75 leading-relaxed'>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Why PREMIUM MESS */}
      <section className='py-16 bg-[#FFFDF5] relative overflow-hidden'>
        <div className='container max-w-6xl mx-auto px-4'>
          <div className='text-center mb-12'>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='text-amber-600 text-xs font-bold mb-3 tracking-wider uppercase'
            >
              WHY PREMIUM MESS
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className='text-3xl sm:text-5xl font-extrabold text-grey-dark tracking-tight leading-none'
            >
              A monthly meal plan you'll <span className='text-amber-500'>actually keep.</span>
            </motion.h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {WHY_CHOOSE_ITEMS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: idx * 0.06, duration: 0.5 }}
                className='bg-white p-7 rounded-3xl border border-grey/10 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group'
              >
                <div className='w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-amber-600 mb-4 border border-primary/30 group-hover:scale-105 transition-transform'>
                  <Icon icon={item.icon} className='text-2xl' />
                </div>
                <h3 className='text-base sm:text-lg font-extrabold text-grey-dark mb-2'>
                  {item.title}
                </h3>
                <p className='text-xs sm:text-sm font-normal text-grey-dark/75 leading-relaxed'>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className='pb-20 bg-[#FFFDF5]'>
        <div className='container max-w-6xl mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-md'
          >
            <div className='absolute right-0 bottom-0 opacity-10 pointer-events-none'>
              <Icon icon='solar:scooter-bold' className='text-[12rem] -mr-8 -mb-8' />
            </div>

            <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-6'>
              <div className='max-w-xl text-center md:text-left'>
                <h3 className='text-2xl sm:text-3xl font-extrabold text-grey-dark mb-2'>
                  Ready for fresh, home-cooked daily meals?
                </h3>
                <p className='text-sm sm:text-base font-medium text-grey-dark/80 leading-relaxed'>
                  Explore our weekly and monthly subscription plans or talk to our delivery team today.
                </p>
              </div>

              <div className='flex flex-wrap items-center gap-3 shrink-0'>
                <Link
                  href='/plans'
                  className='px-7 py-3.5 bg-grey-dark text-white font-extrabold text-sm rounded-2xl hover:bg-grey-dark/90 transition-all shadow-md hover:shadow-lg'
                >
                  Explore Meal Plans
                </Link>
                <a
                  href={whatsappUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-6 py-3.5 bg-white text-grey-dark font-extrabold text-sm rounded-2xl hover:bg-white/90 transition-all shadow-sm flex items-center gap-2'
                >
                  <Icon icon='solar:chat-round-dots-bold' className='text-emerald-600 text-lg' />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={whatsappUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white'
        title='Chat with PREMIUM MESS on WhatsApp'
      >
        <Icon icon='solar:chat-round-dots-bold' className='text-2xl' />
      </a>
    </main>
  )
}
