'use client'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const PremiumBanner = () => {
    return (
        <section className='relative py-24 bg-[#FFF9F5] overflow-hidden'>
            {/* Background elements */}
            <div className='absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none'>
                <div className='absolute top-10 left-10 text-9xl rotate-12'>
                    <Icon icon='ion:restaurant-outline' />
                </div>
                <div className='absolute bottom-10 right-10 text-9xl -rotate-12'>
                    <Icon icon='ion:wine-outline' />
                </div>
            </div>

            <div className='container relative z-10'>
                <div className='max-w-4xl mx-auto text-center'>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className='inline-flex items-center gap-2 px-6 py-2 bg-[#FACB15]/10 rounded-full mb-8'
                    >
                        <Icon icon='ion:star' className='text-[#FACB15]' />
                        <span className='text-[10px] font-black uppercase tracking-[0.3em] text-[#FACB15]'>The Ultimate Mess Experience</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className='text-5xl md:text-7xl font-black text-[#2D2A26] tracking-tighter leading-none mb-10'
                    >
                        Where Every Grain Tells a Story of <span className='text-[#FACB15] italic'>Tradition.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className='text-xl md:text-2xl font-medium text-[#2D2A26]/60 leading-relaxed italic border-l-4 border-l-[#FACB15]/20 pl-8 mb-12'
                    >
                        "Join the hundreds of satisfied food lovers who enjoy our meticulously crafted, home-style daily meals. From farm-fresh ingredients to your plate, we bring the premium mess experience you deserve."
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className='flex flex-wrap justify-center gap-10 opacity-40'
                    >
                        <div className='flex items-center gap-3'>
                            <Icon icon='ion:checkmark-circle' className='text-2xl text-[#FACB15]' />
                            <span className='font-black uppercase tracking-widest text-xs'>Zero Preservatives</span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Icon icon='ion:checkmark-circle' className='text-2xl text-[#FACB15]' />
                            <span className='font-black uppercase tracking-widest text-xs'>Farm Fresh Sourced</span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Icon icon='ion:checkmark-circle' className='text-2xl text-[#FACB15]' />
                            <span className='font-black uppercase tracking-widest text-xs'>Hygiene First</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Ambient background glow */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FACB15]/5 rounded-full blur-[120px] pointer-events-none'></div>
        </section>
    )
}

export default PremiumBanner
