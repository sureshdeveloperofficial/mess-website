'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSettings } from '@/app/hooks/useSettings'

gsap.registerPlugin(ScrollTrigger)

const DEFAULT_SLIDER_IMAGES = [
  '/images/hero/close-up-appetizing-ramadan-meal.jpg',
  '/images/hero/flat-lay-indian-food-frame.jpg',
  '/images/hero/idli-vada-with-sambar-chutney.jpg',
  '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg'
]

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [currentIdx, setCurrentIdx] = useState(0)

  const { data: settings } = useSettings()

  // Dynamic slides calculation
  const sliderImages = Array.isArray(settings?.hero_slider_images) && settings.hero_slider_images.length > 0
    ? settings.hero_slider_images
    : DEFAULT_SLIDER_IMAGES

  const floatingImg1 = settings?.hero_floating_image_1 || '/images/food/biryani_premium.png'
  const floatingImg2 = settings?.hero_floating_image_2 || '/images/food/parotta.png'
  const promiseTitle = settings?.hero_promise_title || 'Tradition in\nEvery Bite'
  const promiseSubtitle = settings?.hero_promise_subtitle || 'Our Promise'

  const revealVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 1,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  }

  useEffect(() => {
    if (sliderImages.length === 0) return
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % sliderImages.length)
    }, 5000)

    const ctx = gsap.context(() => {
      // Floating elements animation
      gsap.to('.floating-food', {
        y: 'random(-20, 20)',
        x: 'random(-10, 10)',
        rotation: 'random(-10, 10)',
        duration: 'random(3, 5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Parallax effect for main image
      gsap.to(imageRef.current, {
        y: -30,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      })
    }, containerRef)

    return () => {
      ctx.revert()
      clearInterval(timer)
    }
  }, [sliderImages.length])

  // Safeguard index bounds
  const activeSlide = sliderImages[currentIdx % sliderImages.length] || sliderImages[0]

  return (
    <section ref={containerRef} id='home-section' className='relative bg-[#FFFDF5] overflow-hidden pt-20 lg:pt-32'>
      {/* Background Decorative Elements */}
      <div className='absolute top-0 right-0 w-1/2 h-full bg-[#FFD54F]/10 -skew-x-12 origin-top-right pointer-events-none'></div>
      <div className='absolute top-20 left-[10%] w-64 h-64 bg-[#FFD54F]/15 rounded-full blur-[120px] pointer-events-none'></div>

      <div className='container relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center gap-16'>
          <div className='lg:col-span-7'>
            <div className='flex flex-col items-center lg:items-start'>

              <motion.h1
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className='text-3xl sm:text-4.5xl md:text-5xl lg:text-5.5xl xl:text-6xl font-extrabold text-grey-dark lg:text-start text-center leading-[1.15] tracking-tight mb-6 sm:mb-8'
              >
                Authentic Taste. <br />
                <span className='text-amber-500 italic'>Everyday Comfort.</span>
              </motion.h1>

              <motion.p
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className='text-grey-dark/75 text-sm sm:text-base md:text-lg font-normal mb-8 sm:mb-12 lg:text-start text-center max-w-2xl leading-relaxed'
              >
                {settings?.site_tagline || 'Traditional flavours, freshly prepared meals, and the comforting taste of home — served fresh every day.'}
              </motion.p>

              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center lg:justify-start w-full sm:w-auto'
              >
                <Link href='/plans' className='w-full sm:w-auto'>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(255, 213, 79, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    className='w-full sm:w-auto text-sm sm:text-base font-extrabold rounded-3xl sm:rounded-4xl text-grey-dark py-4 px-8 sm:py-5 sm:px-10 bg-[#FFD54F] hover:bg-[#F59E0B] shadow-xl shadow-[#FFD54F]/30 transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer'
                  >
                    Explore Food Plans
                    <Icon icon='ion:calendar-outline' className='group-hover:translate-x-1.5 transition-transform' />
                  </motion.button>
                </Link>
                <Link href='/menu' className='w-full sm:w-auto'>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(45,42,38,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    className='w-full sm:w-auto text-sm sm:text-base border-2 sm:border-3 border-grey-dark/15 rounded-3xl sm:rounded-4xl font-extrabold py-4 px-8 sm:py-5 sm:px-10 text-grey-dark hover:border-[#FFD54F] hover:bg-[#FFD54F]/10 transition-all duration-300 flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm cursor-pointer'
                  >
                    View Special Menu
                    <Icon icon='ion:restaurant-outline' />
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={4}
                className='mt-8 sm:mt-10 inline-flex items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/80 shadow-xl shadow-grey-dark/5 group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 max-w-full'
              >
                <div className='w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-br from-[#FFD54F] to-[#FFA000] rounded-xl sm:rounded-2xl flex items-center justify-center text-grey-dark text-lg sm:text-xl shadow-md shadow-[#FFD54F]/25 shrink-0 group-hover:scale-105 transition-transform'>
                  <Icon icon='solar:scooter-bold' />
                </div>
                <div>
                  <h3 className='text-xs sm:text-base font-extrabold text-grey-dark leading-tight'>
                    Daily Meals, Delivered Fresh
                  </h3>
                  <p className='text-[11px] sm:text-xs font-medium text-grey-muted mt-0.5'>
                    Serving homes, offices &amp; accommodations
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className='lg:col-span-5 relative mt-6 lg:mt-0'>
            <div ref={imageRef} className='relative z-20'>
              {/* Promise Badge */}
              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={1.5}
                className='absolute -top-8 -left-4 sm:-top-12 sm:-left-8 bg-white/95 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-[2.5rem] shadow-xl sm:shadow-2xl z-30 flex items-center gap-3 sm:gap-4 border border-white/80 group'
              >
                <div className='w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-[#FFD54F] to-[#FFA000] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFD54F]/20 transition-transform duration-500 group-hover:scale-110 text-grey-dark'>
                  <Icon icon='ion:heart' className='text-grey-dark text-lg sm:text-xl animate-pulse' />
                </div>
                <div>
                  <p className='text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-600'>{promiseSubtitle}</p>
                  <p className='font-extrabold text-grey-dark text-xs sm:text-base leading-tight whitespace-pre-line'>{promiseTitle}</p>
                </div>
              </motion.div>

              {/* Main Rotating Banner */}
              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className='main-hero-image-container relative aspect-4/5 rounded-[3rem] sm:rounded-[5rem] overflow-hidden border-8 sm:border-[1.5rem] border-white shadow-[0_50px_100px_-20px_rgba(45,42,38,0.1)] ring-1 ring-[#FFD54F]/20'
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    {activeSlide?.startsWith('/') ? (
                      <Image
                        src={activeSlide}
                        alt='hero-slide'
                        fill
                        sizes='(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 450px'
                        className='object-cover'
                        priority
                      />
                    ) : (
                      <img
                        src={activeSlide}
                        alt='hero-slide'
                        className='w-full h-full object-cover'
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className='absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 sm:gap-3 z-30'>
                  {sliderImages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === (currentIdx % sliderImages.length) ? 'w-6 sm:w-8 bg-[#FFD54F]' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Dynamic Floating Decorative Items */}
              <motion.div
                className='floating-food absolute -right-10 top-10 w-36 h-36 sm:w-44 sm:h-44 z-30 hidden xl:block drop-shadow-2xl'
              >
                <div className='w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-white'>
                  <img src={floatingImg1} alt='dish decorative' className='w-full h-full object-cover' />
                </div>
              </motion.div>

              <motion.div
                className='floating-food absolute -left-12 bottom-10 w-28 h-28 sm:w-36 sm:h-36 z-30 hidden xl:block drop-shadow-2xl'
              >
                <div className='w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-white'>
                  <img src={floatingImg2} alt='dish decorative' className='w-full h-full object-cover' />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
