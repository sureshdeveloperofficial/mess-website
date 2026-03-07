'use client'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Newsletter = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth floating animation for ingredients
      gsap.to('.floating-ingredient', {
        y: 'random(-15, 15)',
        x: 'random(-10, 10)',
        rotation: 'random(-10, 10)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2
      })

      // Subtle pulse for the main dish
      gsap.to('.main-dish', {
        scale: 1.05,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className='relative overflow-hidden py-24 sm:py-32'>
      {/* Decorative background gradients */}
      <div className='absolute top-0 left-0 w-full h-full bg-[#FFF9F5] pointer-events-none' />
      <div className='absolute -top-24 -right-24 w-96 h-96 bg-[#FF7A3D]/5 rounded-full blur-[100px] pointer-events-none' />
      <div className='absolute -bottom-24 -left-24 w-96 h-96 bg-[#2D2A26]/5 rounded-full blur-[100px] pointer-events-none' />

      <div className='container relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className='bg-[#2D2A26] rounded-[4rem] px-8 py-16 md:p-20 lg:p-24 relative overflow-hidden shadow-2xl shadow-[#2D2A26]/20'
        >
          {/* Inner decorative shapes */}
          <div className='absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-white/5 to-transparent skew-x-12 translate-x-1/2 pointer-events-none' />

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-16 items-center'>
            {/* Left Content Side */}
            <div className='lg:col-span-7 relative z-10'>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className='flex items-center gap-3 mb-6'
              >
                <div className='w-10 h-[2px] bg-[#FF7A3D]' />
                <span className='text-[10px] font-black uppercase tracking-[0.4em] text-[#FF7A3D]'>
                  Daily Broadcast
                </span>
              </motion.div>

              <h2 className='text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none'>
                Today's Special <br />
                <span className='text-[#FF7A3D] italic'>Revealed Daily.</span>
              </h2>

              <p className='text-white/40 text-lg md:text-xl font-medium mb-12 max-w-xl leading-relaxed italic'>
                "Never miss a favorite. Join the Al Shamil Mess daily list for fresh menu updates, regional specialties, and exclusive tasting notes."
              </p>

              <div className='relative max-w-lg group'>
                <div className='absolute -inset-1 bg-linear-to-r from-[#FF7A3D] to-[#FF9D6E] rounded-full opacity-20 group-focus-within:opacity-40 transition duration-500 blur'></div>
                <div className='relative flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2 pr-4 focus-within:bg-white transition-all duration-500'>
                  <input
                    type='email'
                    className='flex-1 pl-6 py-4 bg-transparent border-none text-white focus:text-[#2D2A26] focus:outline-none font-bold placeholder:text-white/20 focus:placeholder:text-[#2D2A26]/30'
                    placeholder='yourname@email.com'
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className='w-12 h-12 bg-linear-to-br from-[#FF7A3D] to-[#FF9D6E] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF7A3D]/20 transition-transform duration-500 group-hover:scale-110'>
                      <Icon icon='tabler:arrow-narrow-right' width='24' className='text-white' />
                    </div>
                  </motion.button>
                </div>
              </div>

              <div className='mt-8 flex items-center gap-4 text-white/20'>
                <Icon icon='ion:shield-checkmark' className='text-xl' />
                <p className='text-[10px] font-bold uppercase tracking-widest'>Pure Taste. 100% Privacy. Al Shamil Mess Quality.</p>
              </div>
            </div>

            {/* Right Image Side */}
            <div className='lg:col-span-5 relative hidden lg:block'>
              <div className='relative group'>
                {/* Main dish circle glow */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FF7A3D]/20 rounded-full blur-[60px] animate-pulse pointer-events-none' />

                <div className='main-dish relative z-10'>
                  <Image
                    src='/images/food/parotta.png'
                    alt='Mess Specialty'
                    width={500}
                    height={500}
                    className='drop-shadow-[0_50px_50px_rgba(0,0,0,0.5)] transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000'
                  />
                </div>

                {/* Floating Elements with GSAP classes */}
                <motion.div className='floating-ingredient absolute -top-10 -left-10 z-20'>
                  <Image src='/images/Newsletter/onion.webp' alt='onion' width={180} height={100} className='drop-shadow-2xl opacity-80' />
                </motion.div>

                <motion.div className='floating-ingredient absolute top-1/4 -right-12 z-20'>
                  <Image src='/images/Newsletter/lec.webp' alt='lettuce' width={160} height={120} className='drop-shadow-2xl opacity-80' />
                </motion.div>

                {/* Abstract decorative shapes */}
                <div className='floating-ingredient absolute bottom-10 left-10 w-8 h-8 bg-[#FFD43D] rounded-full' />
                <div className='floating-ingredient absolute top-10 right-10 w-4 h-4 bg-[#4D8CFF] rounded-full' />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Newsletter
