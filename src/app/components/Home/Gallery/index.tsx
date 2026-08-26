'use client'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import gsap from 'gsap'
import { motion } from 'framer-motion'

const GALLERY_DATA = [
  { name: 'Nandan Ghee Rice', price: '14', src: '/images/food/biryani_premium.png' },
  { name: 'Special Biryani', price: '15', src: '/images/food/biryani_premium.png' },
  { name: 'Malabar Parotta', price: '10', src: '/images/food/parotta.png' },
  { name: 'Spicy Fish Curry', price: '14', src: '/images/food/fish_curry.png' },
  { name: 'Premium Breakfast', price: '10', src: '/images/hero/idli-vada-with-sambar-chutney.jpg' },
  { name: 'Lacy Appam Set', price: '8', src: '/images/food/appetizer.png' },
]

const Gallery = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gallery-item', {
        y: 60,
        opacity: 0,
        scale: 0.9,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id='gallery' className='py-16 bg-[#FFFDF5] relative overflow-hidden'>
      {/* Ambient background glow */}
      <div className='absolute top-1/3 right-0 w-80 h-80 bg-[#FFD54F]/10 rounded-full blur-3xl pointer-events-none' />

      <div className='container relative z-10'>
        <div className='text-center mb-12'>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-amber-600 text-xs font-black mb-4 tracking-widest uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD54F]/20 border border-[#FFD54F]/40'
          >
            <Icon icon='solar:gallery-wide-bold-duotone' className='text-amber-600' />
            Visual Feast
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-3.5xl sm:text-5xl md:text-6xl font-extrabold text-grey-dark tracking-tight leading-tight'
          >
            Explore Our <span className='text-amber-500 italic'>Signature Dishes</span>
          </motion.h2>
        </div>

        <div className='mb-12'>
          <Masonry
            breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
            className='flex gap-6 sm:gap-8 w-auto'
            columnClassName='masonry-column'
          >
            {GALLERY_DATA.map((item, index) => (
              <div
                key={index}
                className='gallery-item overflow-hidden rounded-3xl sm:rounded-[3rem] mb-6 sm:mb-8 relative group bg-white shadow-xl shadow-[#FFD54F]/10 border border-[#FFD54F]/25 hover:border-[#FFD54F] transition-all duration-300'
              >
                <div className='relative aspect-square sm:aspect-4/3 overflow-hidden'>
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={600}
                    height={500}
                    sizes='(max-width: 640px) 95vw, (max-width: 1024px) 50vw, 400px'
                    className='object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-108'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-[#171717]/90 via-[#171717]/40 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300'></div>

                  <div className='absolute bottom-0 left-0 w-full p-5 sm:p-8 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300'>
                    <p className='text-white text-lg sm:text-2xl font-extrabold mb-2 sm:mb-3 tracking-tight'>{item.name}</p>
                    <div className='flex items-center justify-between'>
                      <p className='text-[#FFD54F] text-base sm:text-lg font-black'>AED {item.price}</p>
                      <Link
                        href='/plans'
                        className='bg-[#FFD54F] text-grey-dark px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#F59E0B] shadow-md shadow-[#FFD54F]/30 transition-all duration-300 cursor-pointer'
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>
        </div>

      </div>
    </section>
  )
}

export default Gallery
