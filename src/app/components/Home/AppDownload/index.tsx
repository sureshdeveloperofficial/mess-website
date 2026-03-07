'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import gsap from 'gsap'

const AppDownload = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const phoneRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Floating animation for phone
            gsap.to(phoneRef.current, {
                y: -30,
                rotation: 2,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            })

            // Reveal animation
            gsap.from('.app-content', {
                x: -100,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                }
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className='py-32 bg-[#2D2A26] overflow-hidden relative'>
            {/* Background Decorative */}
            <div className='absolute top-0 right-0 w-1/2 h-full bg-[#FF7A3D]/5 -skew-x-12 origin-top-right'></div>

            <div className='container relative z-10'>
                <div className='grid grid-cols-1 lg:grid-cols-2 items-center gap-20'>
                    <div className='app-content'>
                        <p className='text-[#FF7A3D] text-sm font-black mb-4 tracking-[0.5em] uppercase'>
                            Mobile App
                        </p>
                        <h2 className='text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8'>
                            Order Mess Food <span className='text-[#FF7A3D] italic underline decoration-white/10 underline-offset-8'>Anytime</span>
                        </h2>
                        <p className='text-white/60 text-xl font-medium mb-12 max-w-xl leading-relaxed'>
                            Download the Al Shamil Mess app to manage your subscriptions, view daily menus, and track your deliveries in real-time.
                        </p>

                        <div className='flex flex-wrap gap-6'>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className='flex items-center gap-4 bg-white text-[#2D2A26] px-10 py-5 rounded-[2.5rem] shadow-2xl transition-all duration-300 group'
                            >
                                <Icon icon='ion:logo-google-playstore' className='text-4xl text-[#FF7A3D]' />
                                <div className='text-left'>
                                    <p className='text-[10px] font-black uppercase tracking-widest opacity-40'>Get it on</p>
                                    <p className='text-lg font-black'>Google Play</p>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className='flex items-center gap-4 border-2 border-white/10 text-white px-10 py-5 rounded-[2.5rem] transition-all duration-300 hover:bg-white hover:text-[#2D2A26] group'
                            >
                                <Icon icon='ion:logo-apple' className='text-4xl group-hover:text-[#FF7A3D]' />
                                <div className='text-left'>
                                    <p className='text-[10px] font-black uppercase tracking-widest opacity-40'>Download on the</p>
                                    <p className='text-lg font-black'>App Store</p>
                                </div>
                            </motion.button>
                        </div>
                    </div>

                    <div className='flex justify-center relative'>
                        <div ref={phoneRef} className='relative z-20 w-fit'>
                            <div className='relative rounded-[4rem] overflow-hidden border-[1rem] border-[#1d1b19] shadow-[0_50px_100px_-20px_rgba(255,122,61,0.2)]'>
                                <Image
                                    src='/images/food/app_mockup.png'
                                    alt='App Mockup'
                                    width={400}
                                    height={800}
                                    className='max-w-[300px] md:max-w-md'
                                />
                            </div>

                            {/* Decorative elements around phone */}
                            <div className='absolute -top-10 -right-10 w-40 h-40 bg-[#FF7A3D]/20 rounded-full blur-3xl animate-pulse'></div>
                            <div className='absolute -bottom-10 -left-10 w-64 h-64 bg-[#FF7A3D]/10 rounded-full blur-[100px]'></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AppDownload
