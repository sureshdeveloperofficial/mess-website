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
                    ? 'shadow-2xl shadow-[#FFD54F]/20 border-2 border-[#FFD54F] scale-100 lg:scale-105 z-20 ring-1 ring-[#FFD54F]/40'
                    : 'shadow-xl shadow-grey/5 border border-grey/10 hover:border-[#FFD54F]/60 hover:shadow-2xl hover:shadow-[#FFD54F]/15'
            }`}
        >
            {/* Top Featured Ribbon / Badge */}
            {isPopular && (
                <div className='absolute -top-4 right-6 sm:right-8 bg-[#FFD54F] text-grey-dark font-extrabold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md shadow-[#FFD54F]/30 flex items-center gap-1.5'>
                    <Icon icon='solar:star-bold' className='text-xs text-amber-700' />
                    <span>{customBadge}</span>
                </div>
            )}

            <div>
                {/* Header: Plan Name & Meal Tag */}
                <div className='flex items-center justify-between gap-2 flex-wrap mb-4'>
                    <span className='px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#FFD54F]/20 text-grey-dark border border-[#FFD54F]/35'>
                        <Icon icon='solar:clock-circle-bold' className='text-sm text-amber-600' />
                        {servingCount} Time Meal Plan
                    </span>
                </div>

                <h3 className='text-2xl sm:text-3xl font-extrabold text-grey-dark tracking-tight capitalize mb-2'>
                    {menu.name}
                </h3>

                <p className='text-sm text-grey-muted line-clamp-3 min-h-[44px] mb-6 font-normal leading-relaxed'>
                    {menu.description || `${servingCount === 1 ? '1 Daily Meal' : servingCount === 2 ? '2 Daily Meals (e.g. Lunch + Dinner)' : '3 Daily Meals (Full Day)'} prepared fresh with authentic home-style recipes.`}
                </p>

                {/* Price Display */}
                <div className='mb-6 pb-6 border-b border-[#FFD54F]/20'>
                    <div className='flex items-baseline gap-2'>
                        <span className='text-4xl sm:text-5xl font-extrabold text-grey-dark tracking-tight'>
                            AED {menu.price.toFixed(0)}
                        </span>
                        <span className='text-sm font-medium text-grey-muted'>
                            / {days} days
                        </span>
                    </div>
                    <p className='text-xs text-grey-muted font-medium mt-2 flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-amber-500 inline-block' />
                        Special price for monthly mess subscribers
                    </p>
                </div>

                {/* Dynamic Features Checklist */}
                <div className='space-y-3.5 mb-8'>
                    {featuresList.map((feat: string, fIdx: number) => (
                        <div key={fIdx} className='flex items-start gap-3 text-sm'>
                            <div className='w-5 h-5 rounded-full bg-[#FFD54F]/25 text-amber-700 flex items-center justify-center shrink-0 mt-0.5'>
                                <Icon icon='solar:check-read-linear' className='text-xs font-bold' />
                            </div>
                            <span className='text-grey-dark/85 font-medium leading-snug'>
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
                    className='w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all bg-[#FFD54F] hover:bg-[#F59E0B] text-grey-dark shadow-md shadow-[#FFD54F]/25 hover:shadow-lg hover:shadow-[#FFD54F]/35 text-center cursor-pointer'
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
        <section id='plans' className='py-12 sm:py-20 bg-[#FFFDF5] text-grey-dark relative overflow-hidden'>
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
