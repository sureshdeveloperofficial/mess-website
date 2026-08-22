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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const activeOnly = searchParams.get('activeOnly') === 'true'
        const mealTypeId = searchParams.get('mealTypeId')

        const where: any = {}
        if (activeOnly) {
            where.isActive = true
        }

        // Run all queries in parallel for 3x faster response
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
                orderBy: { createdAt: 'desc' },
            }),
            prisma.$queryRawUnsafe<any[]>(`SELECT id, "mealTypeId", "scheduleJson", "days" FROM "FoodMenu";`).catch(async () => {
                try {
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "mealTypeId" TEXT;`)
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "scheduleJson" JSONB;`)
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "days" INTEGER DEFAULT 30;`)
                    return await prisma.$queryRawUnsafe<any[]>(`SELECT id, "mealTypeId", "scheduleJson", "days" FROM "FoodMenu";`)
                } catch {
                    return []
                }
            }),
            prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "MealType";`).catch(() => []),
        ])

        const planMetaMap = new Map((rawPlansResult || []).map((rp: any) => [rp.id, { mealTypeId: rp.mealTypeId, scheduleJson: rp.scheduleJson, days: rp.days }]))
        const mealTypeMap = new Map((allMealTypesResult || []).map((mt: any) => [mt.id, mt]))

        let enriched = foodMenus.map((m: any) => {
            const meta = planMetaMap.get(m.id)
            const mId = meta?.mealTypeId || null
            return {
                ...m,
                days: m.days ?? meta?.days ?? 30,
                mealTypeId: mId,
                scheduleJson: meta?.scheduleJson || null,
                mealType: mId ? mealTypeMap.get(mId) || null : null,
            }
        })

        if (mealTypeId) {
            enriched = enriched.filter((m: any) => {
                if (m.mealTypeId === mealTypeId) return true
                // Check inside nested scheduleJson if this mealTypeId has items
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
        const { name, description, price, days, foodItemIds, scheduleJson, availableDays, mealTypeId, isActive = true } = await req.json()

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
        }

        const allDishIds = extractAllDishIds(scheduleJson, foodItemIds)
        const parsedDays = days ? parseInt(days.toString(), 10) : 30

        const foodMenu = await prisma.foodMenu.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                availableDays,
                isActive,
                foodItems: {
                    connect: allDishIds.map((id: string) => ({ id })),
                },
            },
            include: { foodItems: true },
        })

        try {
            await prisma.$executeRawUnsafe(
                `UPDATE "FoodMenu" SET "mealTypeId" = $1, "scheduleJson" = $2::jsonb, "days" = $3 WHERE "id" = $4;`,
                mealTypeId || null,
                scheduleJson ? JSON.stringify(scheduleJson) : null,
                parsedDays,
                foodMenu.id
            )
        } catch {
            try {
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "mealTypeId" TEXT;`)
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "scheduleJson" JSONB;`)
                await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "days" INTEGER DEFAULT 30;`)
                await prisma.$executeRawUnsafe(
                    `UPDATE "FoodMenu" SET "mealTypeId" = $1, "scheduleJson" = $2::jsonb, "days" = $3 WHERE "id" = $4;`,
                    mealTypeId || null,
                    scheduleJson ? JSON.stringify(scheduleJson) : null,
                    parsedDays,
                    foodMenu.id
                )
            } catch (err) {
                console.error('Post creation raw update error:', err)
            }
        }

        return NextResponse.json({ ...foodMenu, days: parsedDays, mealTypeId, scheduleJson })
    } catch (error: any) {
        console.error('Create food menu error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create food menu' }, { status: 500 })
    }
}
