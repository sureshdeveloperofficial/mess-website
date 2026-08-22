import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const rows = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT m.*, 
                   (SELECT COUNT(*)::int FROM "FoodMenu" f WHERE f."mealTypeId" = m.id) as "plan_count"
            FROM "MealType" m
            WHERE m.id = $1
            LIMIT 1;
        `,
            id
        )
        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: 'Meal Type not found' }, { status: 404 })
        }
        const r = rows[0]
        return NextResponse.json({
            id: r.id,
            name: r.name,
            icon: r.icon,
            isActive: r.isActive,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            _count: { foodMenus: r.plan_count || 0 },
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch meal type' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { name, icon, isActive } = body

        if (name !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "MealType" SET "name" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2;`, name.trim(), id)
        }
        if (icon !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "MealType" SET "icon" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2;`, icon, id)
        }
        if (isActive !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "MealType" SET "isActive" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2;`, isActive, id)
        }

        return NextResponse.json({ id, name, icon, isActive })
    } catch (error) {
        console.error('Update meal type error:', error)
        return NextResponse.json({ error: 'Failed to update meal type' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { name, icon, isActive } = body

        if (name !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "MealType" SET "name" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2;`, name.trim(), id)
        }
        if (icon !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "MealType" SET "icon" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2;`, icon, id)
        }
        if (isActive !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "MealType" SET "isActive" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2;`, isActive, id)
        }

        return NextResponse.json({ id, name, icon, isActive })
    } catch (error) {
        console.error('Patch meal type error:', error)
        return NextResponse.json({ error: 'Failed to update meal type' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        await prisma.$executeRawUnsafe(`DELETE FROM "MealType" WHERE "id" = $1;`, id)
        return NextResponse.json({ message: 'Meal Type deleted successfully' })
    } catch (error) {
        console.error('Delete meal type error:', error)
        return NextResponse.json({ error: 'Failed to delete meal type' }, { status: 500 })
    }
}
