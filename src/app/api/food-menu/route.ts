import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export const dynamic = 'force-dynamic'

function extractAllDishIds(scheduleJson: any, foodItemIds?: string[]): string[] {
    const set = new Set<string>()
    if (Array.isArray(foodItemIds)) {
        foodItemIds.forEach((id) => set.add(id))
    }

    if (scheduleJson && typeof scheduleJson === 'object') {
        Object.values(scheduleJson).forEach((dayVal: any) => {
            if (Array.isArray(dayVal)) {
                dayVal.forEach((id: string) => {
                    if (typeof id === 'string') set.add(id)
                })
            } else if (dayVal && typeof dayVal === 'object') {
                Object.values(dayVal).forEach((mealVal: any) => {
                    if (Array.isArray(mealVal)) {
                        mealVal.forEach((id: string) => {
                            if (typeof id === 'string') set.add(id)
                        })
                    }
                })
            }
        })
    }
    return Array.from(set)
}

async function fetchFoodMenusWithRetry(where: any, retries = 2): Promise<[any[], any[], any[]]> {
    try {
        const [foodMenus, rawPlansResult, allMealTypesResult] = await Promise.all([
            prisma.foodMenu.findMany({
                where,
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
        return [foodMenus, rawPlansResult, allMealTypesResult]
    } catch (err) {
        if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            return fetchFoodMenusWithRetry(where, retries - 1)
        }
        throw err
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const activeOnly = searchParams.get('activeOnly') === 'true'
        const mealTypeId = searchParams.get('mealTypeId')

        const where: any = {}
        if (activeOnly) {
            where.isActive = true
        }

        // Run all queries with automatic retry on transient network drops
        const [foodMenus, rawPlansResult, allMealTypesResult] = await fetchFoodMenusWithRetry(where)

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

        let enriched = foodMenus.map((m: any) => {
            const meta = planMetaMap.get(m.id)
            const mId = meta?.mealTypeId || null
            const schedule = meta?.scheduleJson || null
            return {
                ...m,
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

        // Sort dynamically ascending by orderNo
        enriched.sort((a: any, b: any) => (a.orderNo ?? 0) - (b.orderNo ?? 0))

        if (mealTypeId) {
            enriched = enriched.filter((m: any) => {
                if (m.mealTypeId === mealTypeId) return true
                if (m.scheduleJson && typeof m.scheduleJson === 'object') {
                    for (const day of Object.values(m.scheduleJson)) {
                        if (day && typeof day === 'object' && !Array.isArray(day) && Array.isArray((day as any)[mealTypeId]) && (day as any)[mealTypeId].length > 0) {
                            return true
                        }
                    }
                }
                return false
            })
        }

        return NextResponse.json(enriched)
    } catch (error: any) {
        console.error('GET Food Menus Error:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch food menus',
                details: error.message,
            },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { 
            name, 
            description, 
            price, 
            orderNo = 0,
            days, 
            servingCount = 1,
            foodItemIds, 
            scheduleJson, 
            availableDays, 
            mealTypeId, 
            features,
            isPopular = false,
            badgeText = 'Most Popular',
            isActive = true 
        } = await req.json()

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
        }

        const mergedScheduleJson = {
            ...(typeof scheduleJson === 'object' && scheduleJson !== null ? scheduleJson : {}),
            ...(Array.isArray(features) ? { features } : {}),
            isPopular: Boolean(isPopular),
            badgeText: badgeText ? String(badgeText).trim() : (isPopular ? 'Most Popular' : ''),
        }

        const allDishIds = extractAllDishIds(mergedScheduleJson, foodItemIds)
        let validDishIds: string[] = []
        if (allDishIds.length > 0) {
            const existingItems = await prisma.foodItem.findMany({
                where: { id: { in: allDishIds } },
                select: { id: true },
            })
            validDishIds = existingItems.map((f) => f.id)
        }

        const parsedDays = days ? parseInt(days.toString(), 10) : 30
        const parsedServingCount = servingCount ? parseInt(servingCount.toString(), 10) : 1
        const parsedOrderNo = orderNo !== undefined && orderNo !== null ? parseInt(orderNo.toString(), 10) : 0

        const foodMenu = await prisma.foodMenu.create({
            data: {
                name,
                description: description || '',
                price: parseFloat(price),
                availableDays,
                isActive,
                foodItems: {
                    connect: validDishIds.map((id: string) => ({ id })),
                },
            },
            include: { foodItems: true },
        })

        try {
            await prisma.$executeRawUnsafe(
                `UPDATE "FoodMenu" SET "mealTypeId" = $1, "scheduleJson" = $2::jsonb, "days" = $3, "servingCount" = $4, "orderNo" = $5 WHERE "id" = $6;`,
                mealTypeId || null,
                mergedScheduleJson ? JSON.stringify(mergedScheduleJson) : null,
                parsedDays,
                parsedServingCount,
                parsedOrderNo,
                foodMenu.id
            )
        } catch {
            try {
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "orderNo" INTEGER NOT NULL DEFAULT 0;`)
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "mealTypeId" TEXT;`)
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "scheduleJson" JSONB;`)
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "days" INTEGER DEFAULT 30;`)
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "servingCount" INTEGER NOT NULL DEFAULT 1;`)
                await prisma.$executeRawUnsafe(
                    `UPDATE "FoodMenu" SET "mealTypeId" = $1, "scheduleJson" = $2::jsonb, "days" = $3, "servingCount" = $4, "orderNo" = $5 WHERE "id" = $6;`,
                    mealTypeId || null,
                    mergedScheduleJson ? JSON.stringify(mergedScheduleJson) : null,
                    parsedDays,
                    parsedServingCount,
                    parsedOrderNo,
                    foodMenu.id
                )
            } catch (err) {
                console.error('Post creation raw update error:', err)
            }
        }

        return NextResponse.json({ 
            ...foodMenu, 
            orderNo: parsedOrderNo,
            days: parsedDays, 
            servingCount: parsedServingCount,
            mealTypeId, 
            scheduleJson: mergedScheduleJson,
            features: mergedScheduleJson.features || [],
            isPopular: Boolean(mergedScheduleJson.isPopular),
            badgeText: mergedScheduleJson.badgeText || ''
        })
    } catch (error: any) {
        console.error('Create food menu error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create food menu' }, { status: 500 })
    }
}
