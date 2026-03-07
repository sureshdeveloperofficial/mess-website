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
        <section className='py-32 bg-white overflow-hidden'>
            <div className='container'>
                <div className='text-center mb-24'>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className='text-[#FF7A3D] text-sm font-black mb-4 tracking-[0.5em] uppercase'
                    >
                        Simple Process
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='text-5xl md:text-7xl font-black text-[#2D2A26] tracking-tighter leading-none'
                    >
                        How It <span className='text-[#FF7A3D] italic'>Works</span>
                    </motion.h2>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className='relative flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8 lg:px-20'
                >
                    {/* Connector Line (Desktop) */}
                    <div className='absolute top-24 left-40 right-40 h-1 bg-[#FF7A3D]/5 hidden lg:block'>
                        <motion.div
                            variants={lineVariants}
                            className='h-full bg-[#FF7A3D]/20 w-full origin-left'
                        ></motion.div>
                    </div>

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className='relative z-10 flex flex-col items-center text-center lg:w-1/3'
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className='w-48 h-48 rounded-[3rem] bg-[#FFF9F5] border-4 border-white shadow-2xl shadow-[#FF7A3D]/10 flex items-center justify-center mb-10 group relative transition-all duration-500 hover:bg-[#FF7A3D]'
                            >
                                <Icon icon={step.icon} className='text-6xl text-[#FF7A3D] group-hover:text-white transition-colors duration-500' />

                                {/* Step Number */}
                                <div className='absolute -top-4 -right-4 w-12 h-12 bg-[#2D2A26] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl'>
                                    {i + 1}
                                </div>
                            </motion.div>

                            <h3 className='text-3xl font-black text-[#2D2A26] mb-4 tracking-tight'>{step.title}</h3>
                            <p className='text-lg font-medium text-[#2D2A26]/50 max-w-xs leading-relaxed'>{step.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default HowItWorks
