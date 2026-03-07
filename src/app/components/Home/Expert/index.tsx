'use client'
import Slider from 'react-slick'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { getFullImageUrl } from '@/utils/image'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const Expert = () => {
  const [dishItems, setDishItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get('/api/food-items?limit=10')
        setDishItems(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch dishes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDishes()
  }, [])

  const settings = {
    dots: true,
    infinite: dishItems.length > 3,
    slidesToShow: Math.min(3, dishItems.length > 0 ? dishItems.length : 1),
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, dishItems.length > 0 ? dishItems.length : 1),
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: Math.min(2, dishItems.length > 0 ? dishItems.length : 1),
        },
      },
      {
        breakpoint: 450,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  return (
    <section className='bg-[#FACB15]/5 py-32 relative overflow-hidden'>
      {/* Decorative background circle */}
      <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[#FACB15]/2 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2'></div>

      <div className='container relative z-10'>
        <div className='text-center mb-16'>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-[#FACB15] text-sm font-black mb-4 tracking-[0.5em] uppercase'
          >
            Crowd Favorites
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-5xl md:text-7xl font-black text-[#2D2A26] tracking-tighter leading-none'
          >
            Legendary Mess <span className='text-[#FACB15] italic underline decoration-[#2D2A26]/5 underline-offset-8 transition-all hover:decoration-[#FACB15]/20 duration-500'>Secrets</span>
          </motion.h2>
        </div>

        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-white/50 animate-pulse rounded-[4rem] aspect-square'></div>
            ))}
          </div>
        ) : dishItems.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-[4rem] border border-dashed border-[#FACB15]/20 text-[#2D2A26]/30 font-bold'>
            <Icon icon='ion:fast-food-outline' className='text-6xl mx-auto mb-4 opacity-10' />
            No food items added in Admin yet.
          </div>
        ) : (
          <Slider {...settings} className='dish-slider'>
            {dishItems.map((item, i) => (
              <div key={i} className='px-4'>
                <motion.div
                  whileHover={{ y: -10 }}
                  className='p-8 text-center bg-white rounded-[4rem] shadow-2xl shadow-[#2D2A26]/5 border border-[#2D2A26]/5 group'
                >
                  <div className='relative aspect-square mb-10 rounded-[3rem] overflow-hidden'>
                    <Image
                      src={getFullImageUrl(item.image)}
                      alt={item.name}
                      fill
                      className='object-cover transform transition-transform duration-700 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-linear-to-t from-[#2D2A26]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  </div>
                  <div className='space-y-3'>
                    <h3 className='text-2xl font-black text-[#2D2A26] tracking-tight group-hover:text-[#FACB15] transition-colors line-clamp-1 capitalize'>
                      {item.name}
                    </h3>
                    <p className='text-sm font-black uppercase tracking-[0.2em] text-[#FACB15]/40'>
                      {item.category?.name || 'Mess Special'}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </section>
  )
}

export default Expert
