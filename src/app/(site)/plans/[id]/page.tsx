'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { getFullImageUrl } from '@/utils/image'
import { useParams, useRouter } from 'next/navigation'

type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    monthlyPrice?: number | null
    category: { name: string }
}

type FoodPlan = {
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

export default function PlanDetailPage() {
    const { id } = useParams()
    const router = useRouter()

    const { data: plan, isLoading, error } = useQuery<FoodPlan>({
        queryKey: ['food-plan', id],
        queryFn: async () => {
            const response = await axios.get(`/api/food-plans/${id}`)
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

    if (error || !plan) {
        return (
            <div className='min-h-screen pt-32 flex flex-col items-center justify-center bg-[#FFF9F5]'>
                <h1 className='text-3xl font-black text-grey mb-6'>Oops! Plan Not Found</h1>
                <button
                    onClick={() => router.push('/plans')}
                    className='px-8 py-3 bg-primary text-white rounded-full font-black'
                >
                    Back to Plans
                </button>
            </div>
        )
    }

    return (
        <main className='min-h-screen pt-20 bg-[#FFF9F5] pb-20'>
            {/* Header / Banner Area */}
            <div className='relative h-[40vh] md:h-[50vh] overflow-hidden bg-grey flex items-center justify-center'>
                <div className='absolute inset-0 opacity-40'>
                    <Image
                        src={PREMIUM_IMAGES[0]}
                        alt='Background'
                        fill
                        className='object-cover blur-sm'
                    />
                </div>
                <div className='absolute inset-0 bg-linear-to-b from-transparent via-grey/50 to-grey'></div>

                <div className='container relative z-10 text-center text-white'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='inline-flex items-center gap-2 px-6 py-2 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-full mb-6'
                    >
                        <Icon icon='ion:star' className='text-primary' />
                        <span className='text-[10px] font-black uppercase tracking-[0.3em]'>Signature Choice</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='text-5xl md:text-8xl font-black tracking-tighter capitalize leading-none mb-6'
                    >
                        {plan.name}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className='text-white/60 text-lg md:text-xl font-medium italic max-w-2xl mx-auto'
                    >
                        "{plan.description || "A masterfully crafted selection for the discerning palette."}"
                    </motion.p>
                </div>
            </div>

            {/* Content Container */}
            <div className='container -mt-20 relative z-20 pb-20'>
                <div className='bg-white rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl border border-white/50 flex flex-col'>

                    {/* Secondary Header / Quick Stats */}
                    <div className='p-8 md:p-12 lg:p-16 border-b border-grey/5 flex flex-col md:flex-row items-center justify-between gap-10 bg-white/80 backdrop-blur-md'>
                        <div className='grid grid-cols-2 gap-12'>
                            <div className='space-y-2'>
                                <span className='text-[10px] font-black text-grey/40 uppercase tracking-[0.3em] block'>Varieties</span>
                                <div className='flex items-center gap-3'>
                                    <div className='w-12 h-12 rounded-2xl bg-grey/5 flex items-center justify-center'>
                                        <Icon icon='ion:restaurant-outline' className='text-primary text-2xl' />
                                    </div>
                                    <span className='text-2xl font-black text-grey'>{plan.foodItems.length} Dishes</span>
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <span className='text-[10px] font-black text-grey/40 uppercase tracking-[0.3em] block'>Experience</span>
                                <div className='flex items-center gap-3'>
                                    <div className='w-12 h-12 rounded-2xl bg-grey/5 flex items-center justify-center'>
                                        <Icon icon='ion:star-outline' className='text-primary text-2xl' />
                                    </div>
                                    <span className='text-2xl font-black text-grey'>Premium</span>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Food Items Grid */}
                    <div className='flex-1 p-8 md:p-20 bg-[#fafafa]'>
                        <div className='mb-12'>
                            <h2 className='text-3xl font-black text-grey tracking-tight mb-2'>What's Included</h2>
                            <p className='text-grey/40 font-medium'>Every dish in this plan is curated with passion and prepared fresh daily.</p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
                            {plan.foodItems.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => router.push(`/food/${item.id}`)}
                                    className='bg-white p-5 rounded-[2.5rem] border border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 group cursor-pointer active:scale-95'
                                >
                                    <div className='relative aspect-square rounded-[2rem] overflow-hidden mb-6'>
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
                    <div className='p-10 md:p-16 bg-white border-t border-grey/5 flex flex-col md:flex-row items-center justify-between gap-8'>
                        <div className='flex items-center gap-8'>
                            <div className='hidden sm:flex items-center gap-4'>
                                <div className='flex -space-x-4'>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className='w-14 h-14 rounded-full border-4 border-white overflow-hidden bg-grey/5 shadow-lg shadow-grey/10'>
                                            <Image src={PREMIUM_IMAGES[i % PREMIUM_IMAGES.length]} alt='Diner' width={56} height={56} className='object-cover' />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className='text-lg font-black text-grey tracking-tight'>Join 12k+ Diners</p>
                                    <p className='text-xs font-bold text-grey/40 uppercase tracking-widest'>Secure & Verified Subscription</p>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 30px 60px -15px rgba(250,203,21,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full md:w-auto px-16 py-8 bg-primary text-white rounded-4xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-6'
                            onClick={() => router.push('/#contact')}
                        >
                            <span>Subscribe Now</span>
                            <Icon icon='ion:arrow-forward' className='text-2xl' />
                        </motion.button>
                    </div>
                </div>

                {/* Back Button */}
                <div className='mt-16 text-center'>
                    <button
                        onClick={() => router.push('/plans')}
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
