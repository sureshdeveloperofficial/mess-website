'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { getFullImageUrl } from '@/utils/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    days?: number
    mealTypeId?: string | null
    availableDays?: string[]
    scheduleJson?: any
    mealType?: {
        name: string
        icon?: string
    } | null
    foodItems: FoodItem[]
}

const PREMIUM_IMAGES = [
    '/images/food/biryani_premium.png',
    '/images/food/parotta.png',
    '/images/food/appetizer.png',
    '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg'
]

export default function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)

    const { data: menu, isLoading, error } = useQuery<FoodMenu>({
        queryKey: ['food-plan-detail', id],
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
            <div className='min-h-screen pt-40 pb-20 text-center bg-[#FFF9F5] text-grey-dark'>
                <Icon icon='solar:calendar-broken' className='text-6xl text-primary mx-auto mb-4' />
                <h2 className='text-3xl font-black text-grey-dark'>Meal Plan Not Found</h2>
                <button
                    onClick={() => router.push('/plans')}
                    className='mt-6 px-8 py-3 bg-primary text-grey-dark rounded-xl font-bold hover:bg-primary/90 transition-all cursor-pointer'
                >
                    Back to Meal Plans
                </button>
            </div>
        )
    }

    const days = menu.days || 30

    return (
        <main className='pt-20 bg-[#FFF9F5] text-grey-dark min-h-screen'>
            {/* Hero Section */}
            <div className='relative pt-24 pb-16 overflow-hidden bg-linear-to-b from-primary/10 via-primary/5 to-[#FFF9F5]'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='max-w-4xl'
                    >
                        <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 text-grey-dark rounded-full mb-6 border border-primary/30'>
                            <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
                            <span className='text-[10px] font-black uppercase tracking-[0.2em]'>
                                {menu.mealType?.name || 'Daily'} Subscription Pass • {days} Days
                            </span>
                        </div>

                        <h1 className='text-4xl sm:text-6xl md:text-7xl font-black text-grey-dark mb-6 tracking-tight capitalize'>
                            {menu.name}
                        </h1>

                        <p className='text-lg sm:text-xl text-grey-muted font-medium leading-relaxed max-w-2xl border-l-4 border-primary pl-6'>
                            "{menu.description || "Experience our authentic home-cooked meals crafted daily with fresh ingredients and traditional recipes."}"
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Container */}
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-20'>
                <div className='bg-white rounded-3xl overflow-hidden shadow-xl border border-grey/10 flex flex-col'>

                    {/* Secondary Header / Quick Stats */}
                    <div className='p-6 sm:p-10 border-b border-grey/10 bg-grey/5'>
                        <div className='flex flex-wrap items-center justify-between gap-6'>
                            <div className='flex flex-wrap items-center gap-8'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-grey-dark text-2xl'>
                                        <Icon icon='solar:chef-hat-heart-bold-duotone' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-xs font-bold text-grey-muted uppercase tracking-wider'>Included Variety</span>
                                        <span className='text-xl sm:text-2xl font-black text-grey-dark'>{menu.foodItems.length} Signature Dishes</span>
                                    </div>
                                </div>

                                <div className='flex items-center gap-4'>
                                    <div className='w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-grey-dark text-2xl'>
                                        <Icon icon='solar:tag-price-bold-duotone' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-xs font-bold text-grey-muted uppercase tracking-wider'>Subscription Price</span>
                                        <span className='text-xl sm:text-2xl font-black text-grey-dark'>AED {menu.price.toFixed(2)} / {days} days</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/get-started?planId=${menu.id}`}
                                className='px-8 py-3.5 bg-primary hover:bg-primary/90 text-grey-dark rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-md transition-all'
                            >
                                <span>Order This Plan</span>
                                <Icon icon='solar:arrow-right-bold' />
                            </Link>
                        </div>
                    </div>

                    {/* Food Items Grid */}
                    <div className='p-6 sm:p-10'>
                        <div className='mb-8'>
                            <h2 className='text-2xl sm:text-3xl font-black text-grey-dark tracking-tight mb-2'>Scheduled Dishes & Recipes</h2>
                            <p className='text-sm text-grey-muted'>Every dish is cooked fresh daily and delivered hot directly to your room or flat.</p>
                        </div>

                        {menu.foodItems.length === 0 ? (
                            <div className='text-center py-12 bg-grey/5 rounded-2xl border border-grey/10'>
                                <p className='text-grey-muted'>Dishes for this plan rotate dynamically based on weekly kitchen chef specials.</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {menu.foodItems.map((item: FoodItem, idx: number) => (
                                    <div
                                        key={item.id}
                                        className='bg-white p-4 rounded-2xl border border-grey/10 hover:border-primary/50 shadow-xs hover:shadow-md transition-all group'
                                    >
                                        <div className='relative aspect-4/3 rounded-xl overflow-hidden mb-4 bg-grey/5'>
                                            <Image
                                                src={getFullImageUrl(item.image) || PREMIUM_IMAGES[idx % PREMIUM_IMAGES.length]}
                                                alt={item.name}
                                                fill
                                                className='object-cover group-hover:scale-105 transition-transform duration-500'
                                            />
                                            {item.category?.name && (
                                                <div className='absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-[10px] font-bold text-grey-dark uppercase tracking-wider shadow-xs'>
                                                    {item.category.name}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className='text-lg font-extrabold text-grey-dark capitalize mb-1 group-hover:text-primary transition-colors'>
                                            {item.name}
                                        </h3>
                                        <span className='text-xs text-grey-muted font-medium block'>Included in regular daily rotation</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Back Button */}
                <div className='mt-12 text-center'>
                    <button
                        onClick={() => router.push('/plans')}
                        className='text-grey-muted font-bold uppercase tracking-widest text-xs hover:text-grey-dark transition-colors inline-flex items-center gap-2 cursor-pointer'
                    >
                        <Icon icon='solar:arrow-left-linear' className='text-lg' />
                        Back to All Meal Plans
                    </button>
                </div>
            </div>
        </main>
    )
}
