'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import axios from 'axios'
import Link from 'next/link'
import { Icon } from '@iconify/react'

export type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    category?: { name: string }
}

export type MealType = {
    id: string
    name: string
    icon?: string
}

export type FoodMenu = {
    id: string
    name: string
    description: string | null
    price: number
    orderNo?: number
    days?: number
    servingCount?: number
    isActive?: boolean
    availableDays?: string[]
    scheduleJson?: any
    mealType?: MealType | null
    foodItems: FoodItem[]
    features?: string[]
    isPopular?: boolean
    badgeText?: string
}

const MealPlanCard = ({ menu, index, isPopular }: { menu: FoodMenu; index: number; isPopular: boolean }) => {
    const days = menu.days || 30
    const servingCount = menu.servingCount || 1
    const dishCount = menu.foodItems?.length || 0
    const mealTypeName = menu.mealType?.name || (menu.name.toLowerCase().includes('lunch') ? 'Lunch' : menu.name.toLowerCase().includes('dinner') ? 'Dinner' : 'Breakfast')

    const rawFeatures = Array.isArray(menu.features) && menu.features.length > 0
        ? menu.features
        : (Array.isArray(menu.scheduleJson?.features) && menu.scheduleJson.features.length > 0
            ? menu.scheduleJson.features
            : null)

    const featuresList = rawFeatures && rawFeatures.length > 0
        ? rawFeatures
        : [
            `${servingCount === 1 ? 'Choose Any 1 Meal/Day' : servingCount === 2 ? 'Choose Any 2 Meals/Day' : 'Includes All 3 Meals/Day'} (Breakfast / Lunch / Dinner)`,
            `${dishCount > 0 ? `${dishCount} Dishes` : 'Full Meal Variety'} scheduled in rotation`,
            'Daily rotating South Indian & Kerala menu',
            'Free doorstep delivery to your room/flat',
            'Non-Veg, Veg & Fish rotation options',
            'Flexible pause & resume when travelling'
        ]

    const customBadge = menu.badgeText || menu.scheduleJson?.badgeText || 'Most Popular'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 bg-white group ${
                isPopular
                    ? 'shadow-2xl shadow-[#fed869]/30 border-2 border-[#fed869] scale-100 lg:scale-105 z-20 ring-4 ring-[#fed869]/25 hover:-translate-y-1.5'
                    : 'shadow-lg shadow-[#fed869]/10 border border-[#fed869]/60 hover:border-[#fed869] hover:shadow-2xl hover:shadow-[#fed869]/25 hover:-translate-y-1.5'
            }`}
        >
            {/* Top Featured Ribbon / Badge */}
            {isPopular && (
                <div className='absolute -top-4 right-6 sm:right-8 bg-[#fed869] text-grey-dark font-black text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md shadow-[#fed869]/40 border border-[#e6c04f] flex items-center gap-1.5'>
                    <Icon icon='solar:star-bold' className='text-xs text-amber-800' />
                    <span>{customBadge}</span>
                </div>
            )}

            <div>
                {/* Header: Plan Name & Meal Tag */}
                <div className='flex items-center justify-between gap-2 flex-wrap mb-4'>
                    <span className='px-3.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 bg-[#fed869]/30 text-amber-950 border border-[#fed869]/60'>
                        <Icon icon='solar:clock-circle-bold' className='text-sm text-amber-800' />
                        {servingCount} Time Meal Plan
                    </span>
                </div>

                <h3 className='text-2xl sm:text-3xl font-extrabold text-grey-dark tracking-tight capitalize mb-2'>
                    {menu.name}
                </h3>

                <p className='text-sm text-grey-dark/70 line-clamp-3 min-h-[44px] mb-6 font-medium leading-relaxed'>
                    {menu.description || `${servingCount === 1 ? '1 Daily Meal' : servingCount === 2 ? '2 Daily Meals (e.g. Lunch + Dinner)' : '3 Daily Meals (Full Day)'} prepared fresh with authentic home-style recipes.`}
                </p>

                {/* Price Display */}
                <div className='mb-6 pb-6 border-b border-[#fed869]/40'>
                    <div className='flex items-baseline gap-2'>
                        <span className='text-4xl sm:text-5xl font-black text-grey-dark tracking-tight'>
                            AED {menu.price.toFixed(0)}
                        </span>
                        <span className='text-sm font-bold text-grey-dark/60'>
                            / {days} days
                        </span>
                    </div>
                    <p className='text-xs text-amber-900 font-bold mt-2 flex items-center gap-1.5'>
                        <span className='w-2 h-2 rounded-full bg-amber-500 inline-block' />
                        Special price for monthly mess subscribers
                    </p>
                </div>

                {/* Dynamic Features Checklist */}
                <div className='space-y-3.5 mb-8'>
                    {featuresList.map((feat: string, fIdx: number) => (
                        <div key={fIdx} className='flex items-start gap-3 text-sm'>
                            <div className='w-5 h-5 rounded-full bg-[#fed869]/40 text-amber-800 flex items-center justify-center shrink-0 mt-0.5'>
                                <Icon icon='solar:check-read-linear' className='text-xs font-bold' />
                            </div>
                            <span className='text-grey-dark font-medium leading-snug'>
                                {feat}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Button */}
            <div className='pt-2'>
                <Link
                    href={`/get-started?planId=${menu.id}`}
                    className='w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all bg-[#fed869] hover:bg-[#e6c04f] text-grey-dark shadow-md shadow-[#fed869]/30 hover:shadow-xl hover:shadow-[#fed869]/40 active:scale-[0.99] text-center cursor-pointer'
                >
                    <span>Order Meal Plan</span>
                    <Icon icon='solar:arrow-right-bold' className='text-base' />
                </Link>
            </div>
        </motion.div>
    )
}

const FoodMenu = ({ initialPlans }: { initialPlans?: FoodMenu[] }) => {
    const { data: menus = initialPlans || [], isLoading } = useQuery<FoodMenu[]>({
        queryKey: ['public-food-plans'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu?activeOnly=true')
            return response.data
        },
        initialData: initialPlans,
        staleTime: 1000 * 60 * 10,
    })

    const activePlans = menus
        .filter((m) => m.isActive !== false)
        .sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0))
    const hasAnyConfiguredPopular = activePlans.some(p => p.isPopular === true || p.scheduleJson?.isPopular === true)

    return (
        <section id='plans' className='py-8 sm:py-16 bg-transparent text-grey-dark relative overflow-hidden'>
            {/* Ambient Background Accents */}
            <div className='absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#fed869]/20 rounded-full blur-[140px] pointer-events-none' />
            <div className='absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#fed869]/20 rounded-full blur-[160px] pointer-events-none' />

            <div className='max-w-[1300px] relative z-10 mx-auto px-4 sm:px-6 lg:px-8'>
                {isLoading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='h-[580px] bg-white rounded-3xl animate-pulse border border-[#fed869]/30 shadow-xs' />
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
                        {activePlans.map((menu, idx) => {
                            const isPlanPop = hasAnyConfiguredPopular
                                ? (menu.isPopular === true || menu.scheduleJson?.isPopular === true)
                                : (idx === 1 || activePlans.length === 1)

                            return (
                                <MealPlanCard
                                    key={menu.id}
                                    menu={menu}
                                    index={idx}
                                    isPopular={isPlanPop}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}

export default FoodMenu
