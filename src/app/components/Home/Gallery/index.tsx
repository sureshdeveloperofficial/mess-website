'use client'
import React from 'react'
import Masonry from 'react-masonry-css'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useSettings } from '@/app/hooks/useSettings'

const DEFAULT_GALLERY_DATA = [
  { name: 'Nandan Ghee Rice', src: 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/biryani_premium.png' },
  { name: 'Special Biryani', src: 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/biryani.png' },
  { name: 'Malabar Parotta', src: 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/parotta.png' },
  { name: 'Spicy Fish Curry', src: 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/fish_curry.png' },
  { name: 'Traditional Kerala Thali', src: 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/thali.png' },
  { name: 'Lacy Appam Set', src: 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/appetizer.png' },
]

const DEFAULT_LOCATIONS_SUBTITLE =
  'Explore our signature dishes at our restaurants - Malabari Restaurant, Frij Al Murar, Naif, Dubai. Al Shamil Restaurants & Cafeteria, Madina Mall Food Court & Premium Chef Restaurant, Near Galadari Driving Centre - Al Qusais Industrial Area 4 - Dubai'

const Gallery = () => {
  const { data: settings } = useSettings()

  const badgeText = settings?.gallery_badge_text || 'Visual Feast'
  const headingText = settings?.gallery_heading || 'Explore Our Signature Dishes'
  const subtitleText = settings?.gallery_subtitle || DEFAULT_LOCATIONS_SUBTITLE

  const items = Array.isArray(settings?.gallery_items) && settings.gallery_items.length > 0
    ? settings.gallery_items
    : DEFAULT_GALLERY_DATA

  // Safely render heading preserving spaces around highlight keywords
  const renderHeading = (text: string) => {
    if (!text) return 'Explore Our Signature Dishes'
    const keyword = 'Signature Dishes'
    if (!text.includes(keyword)) {
      return text
    }
    const index = text.indexOf(keyword)
    const before = text.substring(0, index)
    const after = text.substring(index + keyword.length)

    return (
      <>
        {before}
        <span className='text-amber-600 italic inline-block px-1.5'>
          {keyword}
        </span>
        {after}
      </>
    )
  }

  return (
    <section id='gallery' className='py-20 sm:py-28 bg-[#FFFDF5] relative overflow-hidden'>
      {/* Ambient background glow */}
      <div className='absolute top-1/4 right-0 w-96 h-96 bg-[#fed869]/20 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-10 left-10 w-96 h-96 bg-[#fed869]/20 rounded-full blur-3xl pointer-events-none' />

      <div className='container relative z-10 px-4 sm:px-6 lg:px-8'>
        {/* Clean, Spaced-out Section Header */}
        <div className='text-center max-w-4.5xl mx-auto mb-16 sm:mb-20'>
          {/* Top Badge */}
          {badgeText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='mb-5 sm:mb-6'
            >
              <span className='text-amber-800 text-xs sm:text-sm font-black tracking-widest uppercase inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#fed869]/30 border border-[#fed869]/50 shadow-xs'>
                <Icon icon='solar:gallery-wide-bold-duotone' className='text-amber-700 text-base' />
                {badgeText}
              </span>
            </motion.div>
          )}

          {/* Main Heading with proper word spacing & larger size */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-3.5xl sm:text-5xl md:text-6xl lg:text-6.5xl font-black text-grey-dark tracking-tight leading-tight sm:leading-tight md:leading-tight mb-6 sm:mb-8'
          >
            {renderHeading(headingText)}
          </motion.h2>

          {/* Subtitle / Restaurant Locations Description with Larger Font & Clean Spacing */}
          {subtitleText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className='space-y-6 max-w-3.5xl mx-auto'
            >
              <p className='text-grey-dark/85 text-base sm:text-lg md:text-xl font-semibold leading-relaxed md:leading-loose px-2'>
                {subtitleText}
              </p>
              <div className='w-20 h-1.5 bg-[#fed869] rounded-full mx-auto' />
            </motion.div>
          )}
        </div>

        {/* Gallery Masonry Grid */}
        <div className='mb-8'>
          <Masonry
            breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
            className='flex gap-6 sm:gap-8 w-auto'
            columnClassName='masonry-column'
          >
            {items.map((item, index) => {
              const imageSrc = item.src || 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/biryani_premium.png'
              return (
                <motion.div
                  key={`${item.name}-${index}-${imageSrc}`}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
                  className='gallery-item overflow-hidden rounded-3xl sm:rounded-[3rem] mb-6 sm:mb-8 relative group bg-white shadow-xl shadow-[#fed869]/15 border border-[#fed869]/30 hover:border-[#fed869] transition-all duration-300'
                >
                  <div className='relative aspect-square sm:aspect-4/3 overflow-hidden bg-[#FFFDF5]'>
                    <img
                      key={imageSrc}
                      src={imageSrc}
                      alt={item.name}
                      loading='lazy'
                      className='object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-108'
                    />
                    <div className='absolute inset-0 bg-linear-to-t from-[#171717]/85 via-[#171717]/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300'></div>

                    <div className='absolute bottom-0 left-0 w-full p-5 sm:p-7 translate-y-0 sm:translate-y-3 sm:group-hover:translate-y-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300'>
                      <p className='text-white text-lg sm:text-2xl font-extrabold tracking-tight drop-shadow-md'>{item.name}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </Masonry>
        </div>

      </div>
    </section>
  )
}

export default Gallery
