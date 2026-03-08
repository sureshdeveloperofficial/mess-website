'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { getFullImageUrl } from '@/utils/image'
import { useRouter } from 'next/navigation'

type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    monthlyPrice?: number | null
    category: { name: string }
}

type FoodMenu = {
    id: string
    name: string
    description: string | null
    price: number
    foodItems: FoodItem[]
}

const PREMIUM_IMAGES = [
    '/images/food/biryani_premium.png',
    '/images/food/parotta.png',
    '/images/food/appetizer.png',
    '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg'
]

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)

    const { data: menu, isLoading, error } = useQuery<FoodMenu>({
        queryKey: ['food-menu', id],
        queryFn: async () => {
            const response = await axios.get(`/api/food-menu/${id}`)
            return response.data
        },
        enabled: !!id
    })

    if (isLoading) {
        return (
            <div className='min-h-screen pt-32 flex items-center justify-center bg-[#FFF9F5]'>
                <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
            </div>
        )
    }

    if (error || !menu) {
        return (
            <div className='pt-40 pb-20 text-center'>
                <h2 className='text-3xl font-black text-grey'>Menu Not Found</h2>
                <button
                    onClick={() => router.push('/menu')}
                    className='mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-grey transition-all'
                >
                    Back to Menus
                </button>
            </div>
        )
    }

    return (
        <main className='pt-20 bg-[#FFF9F5]'>
            {/* Hero Section */}
            <div className='relative pt-32 pb-20 overflow-hidden'>
                <div className='container relative z-10'>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='max-w-4xl'
                    >
                        <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6'>
                            <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
                            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-primary'>Monthly Menu Selection</span>
                        </div>

                        <h1 className='text-6xl md:text-8xl font-black text-grey mb-8 tracking-tighter leading-none capitalize'>
                            {menu.name.split(' ').map((word: string, i: number) => (
                                <span key={i} className={i === 0 ? 'text-primary' : 'ml-4'}>
                                    {word}
                                </span>
                            ))}
                        </h1>

                        <p className='text-xl md:text-2xl text-grey/60 font-medium leading-relaxed max-w-2xl border-l-8 border-primary/20 pl-8 italic'>
                            "{menu.description || "Experience our signature daily meals crafted with the finest ingredients and authentic recipes."}"
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Container */}
            <div className='container -mt-20 relative z-20 pb-20'>
                <div className='bg-white rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl border border-white/50 flex flex-col'>

                    {/* Secondary Header / Quick Stats */}
                    <div className='p-8 md:p-12 lg:p-16 border-b border-grey/5 bg-white/80 backdrop-blur-md'>
                        <div className='flex flex-wrap items-center gap-12'>
                            <div className='flex items-center gap-5 group'>
                                <div className='w-16 h-16 rounded-3xl bg-white shadow-xl shadow-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform'>
                                    <Icon icon='ion:restaurant' className='text-3xl text-primary' />
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-xs font-black text-grey/40 uppercase tracking-widest mb-1'>Menu Content</span>
                                    <span className='text-2xl font-black text-grey'>{menu.foodItems.length} Signature Dishes</span>
                                </div>
                            </div>

                            <div className='flex items-center gap-5 group'>
                                <div className='w-16 h-16 rounded-3xl bg-white shadow-xl shadow-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform'>
                                    <Icon icon='ion:wallet' className='text-3xl text-primary' />
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-xs font-black text-grey/40 uppercase tracking-widest mb-1'>Monthly Price</span>
                                    <span className='text-2xl font-black text-grey'>AED {menu.price.toFixed(2)}/mo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Food Items Grid */}
                    <div className='flex-1 p-8 md:p-20 bg-[#fafafa]'>
                        <div className='mb-12'>
                            <h2 className='text-3xl font-black text-grey tracking-tight mb-2'>What's Included</h2>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
                            {menu.foodItems.map((item: FoodItem, idx: number) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => router.push(`/food/${item.id}`)}
                                    className='bg-white p-5 rounded-[2.5rem] border border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 group cursor-pointer active:scale-95'
                                >
                                    <div className='relative aspect-square rounded-4xl overflow-hidden mb-6'>
                                        <Image
                                            src={getFullImageUrl(item.image) || PREMIUM_IMAGES[idx % PREMIUM_IMAGES.length]}
                                            alt={item.name}
                                            fill
                                            className='object-cover group-hover:scale-110 transition-transform duration-1000'
                                        />
                                        <div className='absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full'>
                                            <span className='text-[8px] font-black uppercase tracking-widest text-primary'>
                                                {item.category.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='px-2'>
                                        <h3 className='text-2xl font-black text-grey capitalize mb-2 group-hover:text-primary transition-colors'>
                                            {item.name}
                                        </h3>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex flex-col'>
                                                <span className='text-lg font-black text-primary'>AED {item.monthlyPrice?.toFixed(2) || (item.price * 25).toFixed(2)}/mo</span>
                                            </div>
                                            <div className='w-12 h-12 rounded-full bg-grey/5 flex items-center justify-center text-grey opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45'>
                                                <Icon icon='ion:add' className='text-2xl' />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className='p-10 md:p-16 bg-white border-t border-grey/5'>
                        <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
                            <div className='flex items-center gap-8'>
                                <div className='hidden sm:flex items-center gap-4'>
                                    <div className='flex -space-x-4'>
                                        {[1, 2, 3, 4].map((i: number) => (
                                            <div key={i} className='w-14 h-14 rounded-full border-4 border-white overflow-hidden bg-grey/5 shadow-lg shadow-grey/10'>
                                                <Image src={PREMIUM_IMAGES[i % PREMIUM_IMAGES.length]} alt='Diner' width={56} height={56} className='object-cover' />
                                            </div>
                                        ))}
                                    </div>
                                    <div className='flex flex-col'>
                                        <h4 className='text-3xl font-black text-grey mb-2 capitalize'>{menu.name}</h4>
                                        <p className='text-grey/40 font-bold'>Starting from AED {menu.price.toFixed(2)}/month per person</p>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 30px 60px -15px rgba(250,203,21,0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                className='px-12 py-6 bg-grey text-white rounded-full font-black shadow-2xl hover:bg-primary transition-all flex items-center gap-3'
                                onClick={() => router.push('/menu')}
                            >
                                <span>Explore Other Menus</span>
                                <Icon icon='ion:arrow-back' className='rotate-180' />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className='mt-16 text-center'>
                    <button
                        onClick={() => router.push('/menu')}
                        className='text-grey/40 font-black uppercase tracking-[0.4em] text-xs hover:text-primary transition-colors flex items-center gap-4 mx-auto group'
                    >
                        <Icon icon='ion:arrow-back' className='text-xl group-hover:-translate-x-2 transition-transform' />
                        Back to Signature Collection
                    </button>
                </div>
            </div>
        </main>
    )
}
