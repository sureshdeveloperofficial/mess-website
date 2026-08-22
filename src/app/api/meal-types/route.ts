import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const activeOnly = searchParams.get('activeOnly') === 'true'

        let query = `
            SELECT m.*, 
                   (SELECT COUNT(*)::int FROM "FoodMenu" f WHERE f."mealTypeId" = m.id) as "plan_count"
            FROM "MealType" m
            WHERE 1=1
        `
        const params: any[] = []

        if (search) {
            params.push(`%${search.toLowerCase()}%`)
            query += ` AND LOWER(m."name") LIKE $${params.length}`
        }
        if (activeOnly) {
            query += ` AND m."isActive" = true`
        }

        query += ` ORDER BY m."createdAt" ASC;`

        const rows = await prisma.$queryRawUnsafe<any[]>(query, ...params)
        const mealTypes = rows.map((r) => ({
            id: r.id,
            name: r.name,
            icon: r.icon,
            isActive: r.isActive,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            _count: {
                foodMenus: r.plan_count || 0,
            },
        }))

        return NextResponse.json(mealTypes)
    } catch (error: any) {
        console.error('MealTypes fetch error:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch meal types' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const { name, icon = 'solar:cup-hot-bold-duotone', isActive = true } = body
        if (!name) return NextResponse.json({ error: 'Meal Type Name is required' }, { status: 400 })

        const id = `meal_${Date.now()}`
        await prisma.$executeRawUnsafe(
            `
            INSERT INTO "MealType" ("id", "name", "icon", "isActive", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `,
            id,
            name.trim(),
            icon,
            isActive
        )

        return NextResponse.json({ id, name: name.trim(), icon, isActive })
    } catch (error: any) {
        console.error('Create meal type error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create meal type' }, { status: 500 })
    }
}
