'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const SPECIAL_MENU = [
    {
        title: 'Breakfast Classic',
        name: 'Soft Puttu & Kadala Curry',
        price: '$4',
        items: '2 Steam sets',
        image: '/images/hero/idli-vada-with-sambar-chutney.jpg',
        tag: 'Morning Fresh'
    },
    {
        title: 'Dinner Special',
        name: 'Malabar Porata & Beef Masala',
        price: '$10',
        items: '3 Layers',
        image: '/images/food/parotta.png',
        tag: 'Pure Bliss'
    },
    {
        title: 'Weekend Treat',
        name: 'Aromatic Chicken Chukka Special',
        price: '$12',
        items: 'Full Serving',
        image: '/images/food/biryani_premium.png',
        tag: 'Chef Choice'
    }
]

const MenuPreview = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    }

    const cardVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.9 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "backOut"
            }
        }
    }

    return (
        <section id='menu' className='py-32 bg-[#FFF9F5]'>
            <div className='container'>
                <div className='flex flex-col md:flex-row justify-between items-end mb-20 gap-8'>
                    <div className='max-w-2xl'>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className='text-[#FF7A3D] text-sm font-black mb-4 tracking-[0.5em] uppercase'
                        >
                            Wholesome Goodness
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className='text-5xl md:text-7xl font-black text-[#2D2A26] tracking-tighter leading-none'
                        >
                            Today's <span className='text-[#FF7A3D] italic'>Soul-Satiating</span> Specials
                        </motion.h2>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='flex items-center gap-2 text-[#FF7A3D] font-black uppercase tracking-widest text-sm bg-white px-8 py-4 rounded-full border border-[#FF7A3D]/10 hover:bg-[#FF7A3D] hover:text-white transition-all duration-300'
                    >
                        Full Menu <Icon icon='ion:arrow-forward' />
                    </motion.button>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'
                >
                    {SPECIAL_MENU.map((item, i) => (
                        <motion.div
                            key={i}
                            variants={cardVariants}
                            className='menu-card group'
                        >
                            <motion.div
                                whileHover={{ y: -15 }}
                                className='relative bg-white rounded-[4rem] overflow-hidden shadow-2xl shadow-[#FF7A3D]/5 border border-[#FF7A3D]/5'
                            >
                                {/* Image Container */}
                                <div className='relative h-80 overflow-hidden'>
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className='object-cover transform transition-transform duration-1000 group-hover:scale-110'
                                    />
                                    <div className='absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full'>
                                        <span className='text-[10px] font-black uppercase tracking-widest text-[#FF7A3D]'>
                                            {item.tag}
                                        </span>
                                    </div>
                                    <div className='absolute inset-0 bg-linear-to-t from-[#2D2A26]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                                </div>

                                {/* Content */}
                                <div className='p-10'>
                                    <div className='flex justify-between items-start mb-4'>
                                        <div>
                                            <p className='text-[10px] font-black uppercase tracking-widest text-[#FF7A3D] mb-1'>{item.title}</p>
                                            <h3 className='text-2xl font-black text-[#2D2A26] tracking-tight group-hover:text-[#FF7A3D] transition-colors'>
                                                {item.name}
                                            </h3>
                                        </div>
                                        <div className='text-2xl font-black text-[#FF7A3D]'>{item.price}</div>
                                    </div>

                                    <div className='flex items-center gap-4 pt-6 border-t border-[#2D2A26]/5'>
                                        <div className='flex items-center gap-2 text-[#2D2A26]/40'>
                                            <Icon icon='ion:list-outline' />
                                            <span className='text-xs font-bold uppercase tracking-widest'>{item.items}</span>
                                        </div>
                                        <div className='flex items-center gap-2 text-[#2D2A26]/40'>
                                            <Icon icon='ion:time-outline' />
                                            <span className='text-xs font-bold uppercase tracking-widest'>30 MINS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tilt highlight effect */}
                                <div className='absolute inset-0 border-[1.5rem] border-transparent group-hover:border-[#FF7A3D]/5 transition-all duration-700 rounded-[4rem] pointer-events-none'></div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default MenuPreview
