import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const categoryId = searchParams.get('categoryId')
        const skip = (page - 1) * limit

        const where: any = {}
        if (categoryId) {
            where.categoryId = categoryId
        }

        const [foodItems, total] = await Promise.all([
            prisma.foodItem.findMany({
                where,
                skip,
                take: limit,
                include: { category: true },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.foodItem.count({ where })
        ])

        return NextResponse.json({
            data: foodItems,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { name, description, price, monthlyPrice, image, categoryId } = await req.json()

        if (!name || !price || !categoryId) {
            return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 })
        }

        const foodItem = await prisma.foodItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
                image,
                categoryId,
            },
            include: { category: true }
        })
        return NextResponse.json(foodItem)
    } catch (error: any) {
        console.error('POST Food Item Error:', error)
        return NextResponse.json({
            error: 'Failed to create food item',
            details: error.message
        }, { status: 500 })
    }
}
