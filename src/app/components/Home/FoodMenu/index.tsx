'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { Icon } from '@iconify/react'

type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    category?: { name: string }
}

type MealType = {
    id: string
    name: string
    icon?: string
}

type FoodMenu = {
    id: string
    name: string
    description: string | null
    price: number
    days?: number
    isActive?: boolean
    availableDays?: string[]
    scheduleJson?: any
    mealType?: MealType | null
    foodItems: FoodItem[]
}

const MealPlanCard = ({ menu, index, isPopular }: { menu: FoodMenu; index: number; isPopular: boolean }) => {
    const days = menu.days || 30
    const dishCount = menu.foodItems?.length || 0
    const mealTypeName = menu.mealType?.name || (menu.name.toLowerCase().includes('lunch') ? 'Lunch' : menu.name.toLowerCase().includes('dinner') ? 'Dinner' : 'Breakfast')

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-500 bg-white group ${
                isPopular
                    ? 'shadow-2xl shadow-primary/20 border-2 border-primary scale-100 lg:scale-105 z-20'
                    : 'shadow-xl shadow-grey/5 border border-grey/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10'
            }`}
        >
            {/* Top Featured Ribbon / Badge */}
            {isPopular && (
                <div className='absolute -top-4 right-6 sm:right-8 bg-primary text-grey-dark font-extrabold text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5'>
                    <Icon icon='solar:star-bold' className='text-xs' />
                    <span>MOST POPULAR</span>
                </div>
            )}

            <div>
                {/* Header: Plan Name & Meal Tag */}
                <div className='flex items-center justify-between gap-3 mb-4'>
                    <span className='px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 bg-primary/15 text-grey-dark border border-primary/30'>
                        <Icon icon='solar:clock-circle-bold' className='text-sm text-grey-dark' />
                        {mealTypeName}
                    </span>
                    <span className='text-xs font-bold text-grey-muted bg-grey/5 px-3 py-1 rounded-full border border-grey/10'>
                        {days} Days Pass
                    </span>
                </div>

                <h3 className='text-2xl sm:text-3xl font-extrabold text-grey-dark tracking-tight capitalize mb-2'>
                    {menu.name}
                </h3>

                <p className='text-sm text-grey-muted line-clamp-2 min-h-[40px] mb-6 font-medium'>
                    {menu.description || `${mealTypeName} meals prepared with authentic home-style flavors and fresh ingredients.`}
                </p>

                {/* Price Display */}
                <div className='mb-6 pb-6 border-b border-grey/10'>
                    <div className='flex items-baseline gap-2'>
                        <span className='text-4xl sm:text-5xl font-black text-grey-dark tracking-tight'>
                            AED {menu.price.toFixed(0)}
                        </span>
                        <span className='text-sm font-bold text-grey-muted'>
                            / {days} days
                        </span>
                    </div>
                    <p className='text-xs text-grey-muted font-bold mt-2 flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-primary inline-block' />
                        Special price for monthly mess subscribers
                    </p>
                </div>

                {/* Features Checklist */}
                <div className='space-y-3.5 mb-8'>
                    <div className='flex items-start gap-3 text-sm'>
                        <div className='w-5 h-5 rounded-full bg-primary/20 text-grey-dark flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon icon='solar:check-read-linear' className='text-xs font-black' />
                        </div>
                        <span className='text-grey-dark font-medium'>
                            <strong className='text-grey-dark font-bold'>{dishCount > 0 ? `${dishCount} Dishes` : 'Full Meal Variety'}</strong> scheduled in rotation
                        </span>
                    </div>

                    <div className='flex items-start gap-3 text-sm'>
                        <div className='w-5 h-5 rounded-full bg-primary/20 text-grey-dark flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon icon='solar:check-read-linear' className='text-xs font-black' />
                        </div>
                        <span className='text-grey-dark font-medium'>Daily rotating South Indian & Kerala menu</span>
                    </div>

                    <div className='flex items-start gap-3 text-sm'>
                        <div className='w-5 h-5 rounded-full bg-primary/20 text-grey-dark flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon icon='solar:check-read-linear' className='text-xs font-black' />
                        </div>
                        <span className='text-grey-dark font-medium'>Free doorstep delivery to your room/flat</span>
                    </div>

                    <div className='flex items-start gap-3 text-sm'>
                        <div className='w-5 h-5 rounded-full bg-primary/20 text-grey-dark flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon icon='solar:check-read-linear' className='text-xs font-black' />
                        </div>
                        <span className='text-grey-dark font-medium'>Non-Veg, Veg & Fish rotation options</span>
                    </div>

                    <div className='flex items-start gap-3 text-sm'>
                        <div className='w-5 h-5 rounded-full bg-primary/20 text-grey-dark flex items-center justify-center shrink-0 mt-0.5'>
                            <Icon icon='solar:check-read-linear' className='text-xs font-black' />
                        </div>
                        <span className='text-grey-dark font-medium'>Flexible pause & resume when travelling</span>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className='pt-2'>
                <Link
                    href='/get-started'
                    className='w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-primary hover:bg-primary/90 text-grey-dark shadow-md hover:shadow-lg hover:shadow-primary/20 text-center cursor-pointer'
                >
                    <span>Order Meal Plan</span>
                    <Icon icon='solar:arrow-right-bold' className='text-base' />
                </Link>
            </div>
        </motion.div>
    )
}

const FoodMenu = () => {
    const { data: menus = [], isLoading } = useQuery<FoodMenu[]>({
        queryKey: ['public-food-plans'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu?activeOnly=true')
            return response.data
        },
        staleTime: 1000 * 60 * 10,
    })

    const activePlans = menus.filter((m) => m.isActive !== false)

    return (
        <section id='plans' className='py-12 sm:py-20 bg-[#FFF9F5] text-grey-dark relative overflow-hidden'>
            {/* Ambient Background Accents */}
            <div className='absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none' />
            <div className='absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none' />

            <div className='max-w-[1300px] relative z-10 mx-auto px-4 sm:px-6 lg:px-8'>
                {isLoading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='h-[580px] bg-white rounded-3xl animate-pulse border border-grey/10 shadow-xs' />
                        ))}
                    </div>
                ) : activePlans.length === 0 ? (
                    <div className='text-center py-20 bg-white rounded-3xl border border-grey/10 shadow-xs'>
                        <Icon icon='solar:calendar-broken' className='text-6xl text-primary mx-auto mb-4' />
                        <h3 className='text-2xl font-bold text-grey-dark mb-2'>No Active Meal Plans Available</h3>
                        <p className='text-grey-muted max-w-md mx-auto'>Check back soon or contact our kitchen directly for custom meal packages.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch'>
                        {activePlans.map((menu, idx) => (
                            <MealPlanCard
                                key={menu.id}
                                menu={menu}
                                index={idx}
                                isPopular={idx === 1 || activePlans.length === 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default FoodMenu
