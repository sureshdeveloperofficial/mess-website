'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import MarqueeRow from '@/app/components/Common/Marquee'
import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PREMIUM_IMAGES = [
  '/images/food/biryani_premium.png',
  '/images/food/parotta.png',
  '/images/food/appetizer.png',
  '/images/Gallery/foodone.webp',
  '/images/Gallery/foodtwo.webp',
]

const SLIDER_IMAGES = [
  '/images/hero/close-up-appetizing-ramadan-meal.jpg',
  '/images/hero/flat-lay-indian-food-frame.jpg',
  '/images/hero/idli-vada-with-sambar-chutney.jpg',
  '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg'
]

const AVATARS = [
  '/images/Expert/boyone.png',
  '/images/Expert/boytwo.png',
  '/images/Expert/girl.png',
  '/images/Expert/boyone.png',
]

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [currentIdx, setCurrentIdx] = useState(0)

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
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDER_IMAGES.length)
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
  }, [])

  return (
    <section ref={containerRef} id='home-section' className='relative bg-[#FFF9F5] overflow-hidden pt-20 lg:pt-32'>
      {/* Background Decorative Elements */}
      <div className='absolute top-0 right-0 w-1/2 h-full bg-[#FF7A3D]/5 -skew-x-12 origin-top-right pointer-events-none'></div>
      <div className='absolute top-20 left-[10%] w-64 h-64 bg-[#FF7A3D]/10 rounded-full blur-[120px] pointer-events-none'></div>

      <div className='container relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center gap-16'>
          <div className='lg:col-span-7'>
            <div className='flex flex-col items-center lg:items-start'>
              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className='flex items-center gap-3 mb-6'
              >
                <span className='px-4 py-1.5 bg-[#FF7A3D]/10 text-[#FF7A3D] text-[10px] font-black uppercase tracking-[0.2em] rounded-full'>
                  Est. 2024 • Authentic Mess Dining
                </span>
                <div className='flex gap-0.5 text-yellow-500 font-bold'>
                  {[1, 2, 3, 4, 5].map(i => <Icon key={i} icon='ion:star' className='text-xs' />)}
                </div>
              </motion.div>

              <motion.h1
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className='text-6xl md:text-8xl font-black text-[#2D2A26] lg:text-start text-center leading-[0.9] tracking-tighter mb-8'
              >
                Deliciously <span className='text-[#FF7A3D] italic'>Home-Made.</span> Daily Delivered.
              </motion.h1>

              <motion.p
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className='text-[#2D2A26]/60 text-xl font-medium mb-12 lg:text-start text-center max-w-2xl leading-relaxed'
              >
                Experience the authentic taste of tradition every day. Wholesome mess meals crafted with fresh ingredients, slow-cooked spices, and a generous dash of home-style love.
              </motion.p>

              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className='flex flex-col sm:flex-row gap-6 items-center justify-center lg:justify-start w-full sm:w-auto'
              >
                <Link href='/#plans'>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(255,122,61,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className='text-xl font-black rounded-4xl text-white py-6 px-12 bg-[#FF7A3D] shadow-2xl shadow-[#FF7A3D]/20 transition-all duration-300 flex items-center gap-3 group'
                  >
                    Explore Food Plans
                    <Icon icon='ion:calendar-outline' className='group-hover:translate-x-2 transition-transform' />
                  </motion.button>
                </Link>
                <Link href='/#menu'>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(45,42,38,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    className='text-xl border-4 border-[#2D2A26]/5 rounded-4xl font-black py-6 px-12 text-[#2D2A26] transition-all duration-300 flex items-center gap-3 bg-transparent'
                  >
                    View Today's Menu
                    <Icon icon='ion:restaurant-outline' />
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={4}
                className='mt-16 flex items-center gap-8 justify-center lg:justify-start opacity-60'
              >
                <div className='flex -space-x-3'>
                  {AVATARS.map((src, i) => (
                    <div key={i} className='w-12 h-12 rounded-full border-4 border-white bg-grey/10 overflow-hidden relative shadow-sm'>
                      <Image src={src} alt='User' fill className='object-cover' />
                    </div>
                  ))}
                </div>
                <p className='text-sm font-bold text-[#2D2A26] capitalize'>
                  <span className='font-black'>2,000+</span> Happy Diners This Month
                </p>
              </motion.div>
            </div>
          </div>

          <div className='lg:col-span-5 relative'>
            <div ref={imageRef} className='relative z-20'>
              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={1.5}
                className='absolute -top-12 -left-8 bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-2xl z-30 flex items-center gap-4 border border-white/20 group'
              >
                <div className='w-12 h-12 bg-linear-to-br from-[#FF7A3D] to-[#FF9D6E] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF7A3D]/20 transition-transform duration-500 group-hover:scale-110'>
                  <Icon icon='ion:heart' className='text-white text-xl animate-pulse' />
                </div>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#FF7A3D]'>Our Promise</p>
                  <p className='font-black text-[#2D2A26] text-base leading-tight'>Tradition in<br />Every Bite</p>
                </div>
              </motion.div>

              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className='main-hero-image-container relative aspect-4/5 rounded-[5rem] overflow-hidden border-[1.5rem] border-white shadow-[0_50px_100px_-20px_rgba(45,42,38,0.1)]'
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={SLIDER_IMAGES[currentIdx]}
                      alt='hero-slide'
                      fill
                      className='object-cover'
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30'>
                  {SLIDER_IMAGES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-8 bg-[#FF7A3D]' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Decorative Items */}
              <motion.div
                className='floating-food absolute -right-16 top-10 w-44 h-44 z-30 hidden lg:block drop-shadow-2xl'
              >
                <Image src='/images/food/biryani_premium.png' alt='biryani' width={180} height={180} className='rounded-full' />
              </motion.div>

              <motion.div
                className='floating-food absolute -left-20 bottom-10 w-36 h-36 z-30 hidden lg:block drop-shadow-2xl'
              >
                <Image src='/images/food/parotta.png' alt='parotta' width={140} height={140} className='rounded-full' />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Scrolling Marquee Section */}
      <div className='mt-32 pb-10 border-t border-[#2D2A26]/5'>
        <div className='py-6 bg-[#2D2A26]/2'>
          <MarqueeRow images={PREMIUM_IMAGES} speed={40} />
          <MarqueeRow images={[...PREMIUM_IMAGES].reverse()} direction='right' speed={50} />
        </div>
      </div>
    </section>
  )
}

export default Hero
