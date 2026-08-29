'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useSettings } from '@/app/hooks/useSettings'

const Cook = () => {
  const { data: settings } = useSettings()

  const mainImage = settings?.cook_main_image || '/images/Cook/cook.webp'
  const accentImage = settings?.cook_accent_image || '/images/food/parotta.png'
  const badgeText = settings?.cook_badge_text || 'The Heart of our Mess'
  const heading = settings?.cook_heading || 'Crafted with Passion, Served with Pride'
  const restaurantName = settings?.restaurant_name || 'PREMIUM MESS'

  return (
    <section className='relative py-20 bg-[#FFFDF5] overflow-hidden' id='aboutus'>
      {/* Ambient Honey Yellow Glow Orbs */}
      <div className='absolute top-1/4 -left-20 w-96 h-96 bg-[#FFD54F]/15 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-10 right-0 w-80 h-80 bg-[#FFD54F]/10 rounded-full blur-3xl pointer-events-none' />

      <div className='container relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-20'>
          <div className='lg:col-span-6 relative'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className='relative z-20 rounded-[3rem] sm:rounded-[5rem] overflow-hidden border-8 sm:border-[1.5rem] border-white shadow-2xl shadow-[#FFD54F]/15 ring-1 ring-[#FFD54F]/30 bg-white aspect-4/5'
            >
              {mainImage.startsWith('/') ? (
                <Image
                  src={mainImage}
                  alt='chef and kitchen'
                  fill
                  sizes='(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 550px'
                  className='w-full h-full object-cover'
                />
              ) : (
                <img
                  src={mainImage}
                  alt='chef and kitchen'
                  className='w-full h-full object-cover'
                />
              )}
            </motion.div>

            {/* Absolute decorative food image */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className='absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 w-32 h-32 sm:w-48 sm:h-48 z-30 drop-shadow-2xl'
            >
              <div className='w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-white flex items-center justify-center'>
                <img src={accentImage} alt='accent dish' className='w-full h-full object-cover' />
              </div>
            </motion.div>
          </div>

          <div className='lg:col-span-6'>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='text-amber-600 text-xs font-black mb-4 tracking-widest uppercase inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD54F]/20 border border-[#FFD54F]/40'
            >
              <Icon icon='solar:heart-bold-duotone' className='text-sm text-amber-600' />
              {badgeText}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className='text-4xl md:text-6xl font-extrabold text-grey-dark tracking-tight leading-tight mb-8'
            >
              {heading.includes('Passion') ? (
                <>
                  Crafted with <span className='text-amber-500 italic'>Passion</span>, Served with Pride
                </>
              ) : (
                heading
              )}
            </motion.h2>

            <div className='space-y-6 text-base font-normal text-grey-dark/80 leading-relaxed'>
              <p>
                At <span className='text-grey-dark font-extrabold'>{restaurantName}</span>, every dish tells a story. Our team blends
                tradition with quality to deliver a hearty home-style dining experience that
                delights the senses.
              </p>
              <p>
                {settings?.site_bio ||
                  'From handpicked farm-fresh ingredients to generous servings, we’re here to make every meal feel like home. Whether you’re stopping by for a reliable daily meal plan or just for a nostalgic taste of home, we promise something truly satisfying.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Cook
