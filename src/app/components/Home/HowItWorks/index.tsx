'use client'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const STEPS = [
    {
        title: 'Choose Plan',
        desc: 'Browse our specialized weekly or monthly mess plans that fit your lifestyle.',
        icon: 'ion:grid-outline',
    },
    {
        title: 'Order Online',
        desc: 'Place your order easily via our web app or mobile application with a few taps.',
        icon: 'ion:phone-portrait-outline',
    },
    {
        title: 'Enjoy Fresh Meals',
        desc: 'Get delicious, home-cooked meals delivered hot and fresh to your table daily.',
        icon: 'ion:restaurant-outline',
    }
]

const HowItWorks = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    }

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    }

    const lineVariants = {
        hidden: { scaleX: 0 },
        visible: {
            scaleX: 1,
            transition: {
                delay: 0.5,
                duration: 1.5,
                ease: "easeInOut"
            }
        }
    }

    return (
        <section className='py-20 lg:py-24 bg-[#FEEBB1]/40 overflow-hidden relative'>
            {/* Ambient background glow */}
            <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-[#fed869]/25 rounded-full blur-3xl pointer-events-none' />
            <div className='absolute top-0 right-10 w-80 h-80 bg-[#fed869]/20 rounded-full blur-3xl pointer-events-none' />

            <div className='container relative z-10'>
                <div className='text-center mb-14 sm:mb-16'>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='text-grey-dark text-xs sm:text-sm font-black mb-4 tracking-widest uppercase inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fed869] border border-[#fed869] shadow-xs'
                    >
                        <Icon icon='solar:clock-circle-bold' className='text-amber-900 text-sm' />
                        Simple Process
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className='text-3.5xl sm:text-5xl md:text-6xl font-black text-grey-dark tracking-tight leading-tight'
                    >
                        How It <span className='text-amber-700 italic underline decoration-[#fed869] underline-offset-8'>Works</span>
                    </motion.h2>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className='relative flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 lg:gap-8 lg:px-12'
                >
                    {/* Connector Line (Desktop) */}
                    <div className='absolute top-24 left-40 right-40 h-1 bg-[#fed869]/40 hidden lg:block'>
                        <motion.div
                            variants={lineVariants}
                            className='h-full bg-[#fed869] w-full origin-left shadow-sm shadow-[#fed869]'
                        ></motion.div>
                    </div>

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className='relative z-10 flex flex-col items-center text-center w-full max-w-sm lg:w-1/3 p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#fed869]/40 shadow-lg shadow-[#fed869]/10'
                        >
                            <motion.div
                                whileHover={{ scale: 1.06, rotate: 2 }}
                                whileTap={{ scale: 0.96 }}
                                className='w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-[#fed869] border-4 border-white shadow-xl shadow-[#fed869]/30 flex items-center justify-center mb-6 group relative transition-all duration-300 hover:bg-[#e6c04f]'
                            >
                                <Icon icon={step.icon} className='text-4xl sm:text-5xl text-grey-dark transition-colors duration-300' />

                                {/* Step Number */}
                                <div className='absolute -top-3 -right-3 w-9 h-9 sm:w-10 sm:h-10 bg-grey-dark text-white rounded-xl flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-md'>
                                    {i + 1}
                                </div>
                            </motion.div>

                            <h3 className='text-lg sm:text-xl font-black text-grey-dark mb-2 tracking-tight'>{step.title}</h3>
                            <p className='text-xs sm:text-sm font-medium text-grey-dark/80 max-w-xs leading-relaxed'>{step.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default HowItWorks
