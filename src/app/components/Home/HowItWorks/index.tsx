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
        <section className='py-16 bg-[#FFFDF5] overflow-hidden relative'>
            {/* Ambient background glow */}
            <div className='absolute bottom-0 left-1/4 w-96 h-96 bg-[#FFD54F]/10 rounded-full blur-3xl pointer-events-none' />

            <div className='container relative z-10'>
                <div className='text-center mb-12'>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='text-amber-600 text-xs font-black mb-4 tracking-widest uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD54F]/20 border border-[#FFD54F]/40'
                    >
                        <Icon icon='solar:clock-circle-bold-duotone' className='text-amber-600' />
                        Simple Process
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className='text-3.5xl sm:text-5xl md:text-6xl font-extrabold text-grey-dark tracking-tight leading-tight'
                    >
                        How It <span className='text-amber-500 italic'>Works</span>
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
                    <div className='absolute top-24 left-40 right-40 h-1 bg-[#FFD54F]/20 hidden lg:block'>
                        <motion.div
                            variants={lineVariants}
                            className='h-full bg-[#FFD54F] w-full origin-left'
                        ></motion.div>
                    </div>

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className='relative z-10 flex flex-col items-center text-center w-full max-w-sm lg:w-1/3'
                        >
                            <motion.div
                                whileHover={{ scale: 1.06, rotate: 2 }}
                                whileTap={{ scale: 0.96 }}
                                className='w-36 h-36 sm:w-44 sm:h-44 rounded-3xl sm:rounded-[3rem] bg-[#FFF9E6] border-4 border-white shadow-xl shadow-[#FFD54F]/15 flex items-center justify-center mb-6 sm:mb-8 group relative transition-all duration-300 hover:bg-[#FFD54F]'
                            >
                                <Icon icon={step.icon} className='text-5xl sm:text-6xl text-amber-600 group-hover:text-grey-dark transition-colors duration-300' />

                                {/* Step Number */}
                                <div className='absolute -top-3 -right-3 w-10 h-10 sm:w-12 sm:h-12 bg-grey-dark text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base shadow-lg'>
                                    {i + 1}
                                </div>
                            </motion.div>

                            <h3 className='text-xl sm:text-2xl font-extrabold text-grey-dark mb-2 sm:mb-3 tracking-tight'>{step.title}</h3>
                            <p className='text-xs sm:text-base font-normal text-grey-dark/75 max-w-xs leading-relaxed'>{step.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default HowItWorks
