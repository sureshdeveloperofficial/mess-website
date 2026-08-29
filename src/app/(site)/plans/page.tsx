import React from 'react'
import FoodMenu, { FoodMenu as FoodMenuType } from '@/app/components/Home/FoodMenu'
import { Metadata } from 'next'
import { Icon } from '@iconify/react'
import prisma from '@/utils/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Monthly Meal Plans - PREMIUM MESS',
    description: 'Explore our authentic South Indian home-cooked monthly meal subscriptions and flexible mess plans.',
}

async function getInitialMealPlans(): Promise<FoodMenuType[]> {
    try {
        const [foodMenus, rawPlansResult, allMealTypesResult] = await Promise.all([
            prisma.foodMenu.findMany({
                where: { isActive: true },
                include: {
                    foodItems: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            price: true,
                            isActive: true,
                            category: {
                                select: { id: true, name: true }
                            }
                        }
                    },
                },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.$queryRawUnsafe<any[]>(`SELECT id, "mealTypeId", "scheduleJson", "days", "servingCount", "orderNo" FROM "FoodMenu";`).catch(async () => {
                try {
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "orderNo" INTEGER NOT NULL DEFAULT 0;`)
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "mealTypeId" TEXT;`)
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "scheduleJson" JSONB;`)
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "days" INTEGER DEFAULT 30;`)
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "servingCount" INTEGER NOT NULL DEFAULT 1;`)
                    return await prisma.$queryRawUnsafe<any[]>(`SELECT id, "mealTypeId", "scheduleJson", "days", "servingCount", "orderNo" FROM "FoodMenu";`)
                } catch {
                    return []
                }
            }),
            prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "MealType";`).catch(() => []),
        ])

        const planMetaMap = new Map((rawPlansResult || []).map((rp: any) => [
            rp.id, 
            { 
                mealTypeId: rp.mealTypeId, 
                scheduleJson: rp.scheduleJson, 
                days: rp.days,
                servingCount: rp.servingCount ?? 1,
                orderNo: rp.orderNo ?? 0
            }
        ]))
        const mealTypeMap = new Map((allMealTypesResult || []).map((mt: any) => [mt.id, mt]))

        const enriched: FoodMenuType[] = foodMenus.map((m: any) => {
            const meta = planMetaMap.get(m.id)
            const mId = meta?.mealTypeId || null
            const schedule = meta?.scheduleJson || null
            return {
                id: m.id,
                name: m.name,
                description: m.description,
                price: m.price,
                isActive: m.isActive,
                availableDays: m.availableDays,
                foodItems: m.foodItems || [],
                orderNo: m.orderNo ?? meta?.orderNo ?? 0,
                days: m.days ?? meta?.days ?? 30,
                servingCount: m.servingCount ?? meta?.servingCount ?? 1,
                mealTypeId: mId,
                scheduleJson: schedule,
                features: Array.isArray(schedule?.features) ? schedule.features : [],
                isPopular: Boolean(schedule?.isPopular),
                badgeText: schedule?.badgeText || (schedule?.isPopular ? 'Most Popular' : ''),
                mealType: mId ? mealTypeMap.get(mId) || null : null,
            }
        })

        enriched.sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0))
        return enriched
    } catch (err) {
        console.error('Server pre-fetch meal plans error:', err)
        return []
    }
}

export default async function MealPlansPage() {
    const initialPlans = await getInitialMealPlans()

    return (
        <main className='pt-20 bg-[#FEEBB1] min-h-screen relative overflow-hidden'>
            {/* Ambient Background Glows */}
            <div className='absolute top-0 left-1/4 w-96 h-96 bg-[#fed869]/30 rounded-full blur-3xl pointer-events-none' />
            <div className='absolute bottom-10 right-10 w-96 h-96 bg-[#fed869]/30 rounded-full blur-3xl pointer-events-none' />

            <div className='pt-16 pb-6 text-center relative z-10'>
                <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fed869] text-grey-dark text-xs font-black mb-5 border border-[#fed869] tracking-wider uppercase shadow-xs'>
                    <Icon icon='solar:chef-hat-bold-duotone' className='text-base text-amber-800' />
                    Authentic Daily Subscriptions
                </div>

                <h1 className='text-3.5xl sm:text-5xl lg:text-6xl font-extrabold text-grey-dark tracking-tight leading-tight mb-4'>
                    Monthly <span className='text-amber-800 italic underline decoration-[#fed869]'>Meal Plans</span>
                </h1>
                
                <p className='text-grey-dark/85 max-w-2xl mx-auto text-sm sm:text-base font-medium leading-relaxed px-4'>
                    Savor the warmth of home-cooked South Indian and Kerala meals delivered fresh to your room or flat daily. Choose your favorite plan below.
                </p>
            </div>

            <div className='relative z-20 pb-20'>
                <FoodMenu initialPlans={initialPlans} />
            </div>
        </main>
    )
}
