import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const activeOnly = searchParams.get('activeOnly') === 'true'

        const whereCondition: any = {}
        if (search) {
            whereCondition.name = {
                contains: search,
                mode: 'insensitive' as const,
            }
        }
        if (activeOnly) {
            whereCondition.isActive = true
        }

        const categories = await prisma.category.findMany({
            where: whereCondition,
            include: { _count: { select: { foodItems: true } } },
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Categories fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const { name, isActive = true } = body
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

        const category = await (prisma.category as any).create({
            data: { name, isActive },
        })
        return NextResponse.json(category)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}
