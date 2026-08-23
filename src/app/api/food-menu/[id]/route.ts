import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import { NextRequest } from 'next/server'

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const foodMenu = await prisma.foodMenu.findUnique({
            where: { id },
            include: {
                foodItems: {
                    include: {
                        category: true,
                    },
                },
            },
        })

        if (!foodMenu) {
            return NextResponse.json({ error: 'Food menu not found' }, { status: 404 })
        }

        let mealType = null
        let scheduleJson = null
        let metaDays = null
        let metaServingCount = 1
        let metaOrderNo = 0

        try {
            const metaRows = await prisma.$queryRawUnsafe<any[]>(
                `SELECT "mealTypeId", "scheduleJson", "days", "servingCount", "orderNo" FROM "FoodMenu" WHERE id = $1 LIMIT 1;`,
                id
            )
            if (metaRows.length > 0) {
                scheduleJson = metaRows[0].scheduleJson
                metaDays = metaRows[0].days
                metaServingCount = metaRows[0].servingCount ?? 1
                metaOrderNo = metaRows[0].orderNo ?? 0
                if (metaRows[0].mealTypeId) {
                    try {
                        const mtRows = await prisma.$queryRawUnsafe<any[]>(
                            `SELECT * FROM "MealType" WHERE id = $1 LIMIT 1;`,
                            metaRows[0].mealTypeId
                        )
                        if (mtRows.length > 0) mealType = mtRows[0]
                    } catch {}
                }
            }
        } catch {
            try {
                const metaRows = await prisma.$queryRawUnsafe<any[]>(
                    `SELECT "mealTypeId", "scheduleJson" FROM "FoodMenu" WHERE id = $1 LIMIT 1;`,
                    id
                )
                if (metaRows.length > 0) {
                    scheduleJson = metaRows[0].scheduleJson
                }
            } catch {}
        }

        return NextResponse.json({ 
            ...foodMenu, 
            orderNo: (foodMenu as any).orderNo ?? metaOrderNo ?? 0,
            days: (foodMenu as any).days ?? metaDays ?? 30, 
            servingCount: (foodMenu as any).servingCount ?? metaServingCount ?? 1,
            mealType, 
            scheduleJson,
            features: Array.isArray(scheduleJson?.features) ? scheduleJson.features : [],
            isPopular: Boolean(scheduleJson?.isPopular),
            badgeText: scheduleJson?.badgeText || (scheduleJson?.isPopular ? 'Most Popular' : '')
        })
    } catch (error) {
        console.error('GET Food Menu Error:', error)
        return NextResponse.json({ error: 'Failed to fetch food menu' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { 
            name, 
            description, 
            price, 
            orderNo,
            days, 
            servingCount,
            foodItemIds, 
            scheduleJson, 
            availableDays, 
            mealTypeId, 
            features,
            isPopular,
            badgeText,
            isActive 
        } = body

        const mergedScheduleJson = scheduleJson !== undefined || features !== undefined || isPopular !== undefined || badgeText !== undefined
            ? {
                ...(typeof scheduleJson === 'object' && scheduleJson !== null ? scheduleJson : {}),
                ...(Array.isArray(features) ? { features } : {}),
                ...(isPopular !== undefined ? { isPopular: Boolean(isPopular) } : {}),
                ...(badgeText !== undefined ? { badgeText: String(badgeText).trim() } : {}),
            }
            : undefined

        const allDishIds = extractAllDishIds(mergedScheduleJson ?? scheduleJson, foodItemIds)

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (price !== undefined) updateData.price = parseFloat(price)
        if (availableDays !== undefined) updateData.availableDays = availableDays
        if (isActive !== undefined) updateData.isActive = isActive
        if (allDishIds.length > 0 || foodItemIds !== undefined || scheduleJson !== undefined || features !== undefined) {
            let validDishIds: string[] = []
            if (allDishIds.length > 0) {
                const existingItems = await prisma.foodItem.findMany({
                    where: { id: { in: allDishIds } },
                    select: { id: true },
                })
                validDishIds = existingItems.map((f) => f.id)
            }
            updateData.foodItems = {
                set: validDishIds.map((itemId: string) => ({ id: itemId })),
            }
        }

        const foodMenu = await prisma.foodMenu.update({
            where: { id },
            data: updateData,
            include: { foodItems: true },
        })

        const parsedDays = days !== undefined ? parseInt(days.toString(), 10) || 30 : null
        const parsedServingCount = servingCount !== undefined ? parseInt(servingCount.toString(), 10) || 1 : null
        const parsedOrderNo = orderNo !== undefined ? parseInt(orderNo.toString(), 10) || 0 : null

        if (mealTypeId !== undefined || mergedScheduleJson !== undefined || parsedDays !== null || parsedServingCount !== null || parsedOrderNo !== null) {
            try {
                await prisma.$executeRawUnsafe(
                    `UPDATE "FoodMenu" 
                     SET "mealTypeId" = COALESCE($1, "mealTypeId"), 
                         "scheduleJson" = COALESCE($2::jsonb, "scheduleJson"),
                         "days" = COALESCE($3, "days"),
                         "servingCount" = COALESCE($4, "servingCount"),
                         "orderNo" = COALESCE($5, "orderNo")
                     WHERE "id" = $6;`,
                    mealTypeId || null,
                    mergedScheduleJson ? JSON.stringify(mergedScheduleJson) : null,
                    parsedDays,
                    parsedServingCount,
                    parsedOrderNo,
                    id
                )
            } catch {
                try {
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "orderNo" INTEGER NOT NULL DEFAULT 0;`)
                    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "servingCount" INTEGER NOT NULL DEFAULT 1;`)
                    await prisma.$executeRawUnsafe(
                        `UPDATE "FoodMenu" 
                         SET "mealTypeId" = COALESCE($1, "mealTypeId"), 
                             "scheduleJson" = COALESCE($2::jsonb, "scheduleJson"),
                             "days" = COALESCE($3, "days"),
                             "servingCount" = COALESCE($4, "servingCount"),
                             "orderNo" = COALESCE($5, "orderNo")
                         WHERE "id" = $6;`,
                        mealTypeId || null,
                        mergedScheduleJson ? JSON.stringify(mergedScheduleJson) : null,
                        parsedDays,
                        parsedServingCount,
                        parsedOrderNo,
                        id
                    )
                } catch {}
            }
        }

        const finalSchedule = mergedScheduleJson ?? scheduleJson

        return NextResponse.json({ 
            ...foodMenu, 
            orderNo: parsedOrderNo ?? (foodMenu as any).orderNo ?? 0,
            days: parsedDays ?? (foodMenu as any).days ?? 30, 
            servingCount: parsedServingCount ?? (foodMenu as any).servingCount ?? 1,
            mealTypeId, 
            scheduleJson: finalSchedule,
            features: finalSchedule?.features || [],
            isPopular: Boolean(finalSchedule?.isPopular),
            badgeText: finalSchedule?.badgeText || ''
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update food menu' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { name, description, price, foodItemIds, scheduleJson, availableDays, mealTypeId, isActive } = body

        const allDishIds = extractAllDishIds(scheduleJson, foodItemIds)

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (price !== undefined) updateData.price = parseFloat(price)
        if (availableDays !== undefined) updateData.availableDays = availableDays
        if (isActive !== undefined) updateData.isActive = isActive
        if (allDishIds.length > 0 || foodItemIds !== undefined || scheduleJson !== undefined) {
            updateData.foodItems = {
                set: allDishIds.map((itemId: string) => ({ id: itemId })),
            }
        }

        const foodMenu = await prisma.foodMenu.update({
            where: { id },
            data: updateData,
            include: { foodItems: true },
        })

        if (mealTypeId !== undefined || scheduleJson !== undefined) {
            try {
                await prisma.$executeRawUnsafe(
                    `UPDATE "FoodMenu" 
                     SET "mealTypeId" = COALESCE($1, "mealTypeId"), 
                         "scheduleJson" = COALESCE($2::jsonb, "scheduleJson") 
                     WHERE "id" = $3;`,
                    mealTypeId || null,
                    scheduleJson ? JSON.stringify(scheduleJson) : null,
                    id
                )
            } catch {}
        }

        return NextResponse.json(foodMenu)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to patch food menu' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        await prisma.foodMenu.delete({
            where: { id },
        })
        return NextResponse.json({ message: 'Food menu deleted successfully' })
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return NextResponse.json({ message: 'Food menu deleted successfully' })
        }
        console.error('Delete food menu error:', error)
        return NextResponse.json({ error: error?.message || 'Failed to delete food menu' }, { status: 500 })
    }
}
