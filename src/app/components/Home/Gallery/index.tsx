'use client'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import gsap from 'gsap'
import { motion } from 'framer-motion'

const GALLERY_DATA = [
  { name: 'Traditional Thali', price: '12', src: '/images/food/thali.png' },
  { name: 'Special Biryani', price: '15', src: '/images/food/biryani_premium.png' },
  { name: 'Malabar Parotta', price: '10', src: '/images/food/parotta.png' },
  { name: 'Spicy Fish Curry', price: '14', src: '/images/food/fish_curry.png' },
  { name: 'Grilled Prawns', price: '18', src: '/images/food/prawns.png' },
  { name: 'Daily Side Pack', price: '8', src: '/images/food/appetizer.png' },
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
    <section ref={sectionRef} id='gallery' className='py-32 bg-white'>
      <div className='container'>
        <div className='text-center mb-24'>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className='text-[#FACB15] text-sm font-black mb-4 tracking-[0.5em] uppercase'
          >
            Visual Feast
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className='text-5xl md:text-7xl font-black text-[#2D2A26] tracking-tighter leading-none'
          >
            Explore Our <span className='text-[#FACB15] italic'>Signature Dishes</span>
          </motion.h2>
        </div>

        <div className='px-4 mb-20'>
          <Masonry
            breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
            className='flex gap-10 w-auto'
            columnClassName='masonry-column'
          >
            {GALLERY_DATA.map((item, index) => (
              <div
                key={index}
                className='gallery-item overflow-hidden rounded-[3rem] mb-10 relative group bg-white shadow-2xl shadow-[#FACB15]/5 border border-[#FACB15]/5'
              >
                <div className='relative aspect-square md:aspect-auto overflow-hidden'>
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={600}
                    height={500}
                    className='object-cover w-full h-full transform transition-transform duration-[2s] group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-[#2D2A26]/80 via-[#2D2A26]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                  <div className='absolute bottom-0 left-0 w-full p-10 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500'>
                    <p className='text-white text-3xl font-black mb-4 tracking-tight'>{item.name}</p>
                    <div className='flex items-center justify-between'>
                      <p className='text-white text-xl font-bold'>$ {item.price}</p>
                      <Link
                        href='/plans'
                        className='bg-[#FACB15] text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest hover:bg-white hover:text-[#FACB15] transition-all duration-300'
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
