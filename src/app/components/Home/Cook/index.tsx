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
    <section className='relative py-20 lg:py-28 bg-[#FEEBB1] overflow-hidden' id='aboutus'>
      {/* Ambient Honey Yellow Glow Orbs & Geometric Decorative Accents */}
      <div className='absolute top-0 right-0 w-1/2 h-full bg-[#fed869]/20 -skew-x-12 origin-top-right pointer-events-none' />
      <div className='absolute top-1/4 -left-20 w-96 h-96 bg-[#fed869]/30 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute bottom-10 right-0 w-80 h-80 bg-[#fed869]/25 rounded-full blur-[100px] pointer-events-none' />

      <div className='container relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-20'>
          <div className='lg:col-span-6 relative'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className='relative z-20 rounded-3xl sm:rounded-[4.5rem] overflow-hidden border-6 sm:border-8 border-white shadow-2xl shadow-[#fed869]/30 ring-1 ring-[#fed869]/50 bg-white aspect-4/5'
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

            {/* Absolute decorative food dish badge */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className='absolute -right-3 -bottom-3 sm:-right-6 sm:-bottom-6 w-32 h-32 sm:w-44 sm:h-44 z-30 drop-shadow-2xl'
            >
              <div className='w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center ring-2 ring-[#fed869]/40'>
                <img src={accentImage} alt='accent dish' className='w-full h-full object-cover' />
              </div>
            </motion.div>
          </div>

          <div className='lg:col-span-6'>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='mb-4'
            >
              <span className='text-grey-dark text-xs sm:text-sm font-black tracking-widest uppercase inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fed869] border border-[#fed869] shadow-xs'>
                <Icon icon='solar:heart-bold' className='text-sm text-amber-900' />
                {badgeText}
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className='text-3.5xl sm:text-5xl lg:text-6xl font-black text-grey-dark tracking-tight leading-[1.15] mb-6 sm:mb-8'
            >
              {heading.includes('Passion') ? (
                <>
                  Crafted with <span className='text-amber-700 italic underline decoration-[#fed869] underline-offset-8'>Passion</span>, Served with Pride
                </>
              ) : (
                heading
              )}
            </motion.h2>

            <div className='space-y-5 text-sm sm:text-base font-medium text-grey-dark/85 leading-relaxed bg-white/60 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-[#fed869]/40 shadow-lg shadow-[#fed869]/10'>
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
