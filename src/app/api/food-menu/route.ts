import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const foodMenus = await prisma.foodMenu.findMany({
            include: { foodItems: { include: { category: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(foodMenus)
    } catch (error: any) {
        console.error('GET Food Menus Error:', error)
        return NextResponse.json({ 
            error: 'Failed to fetch food menus',
            details: error.message,
            code: error.code // Prisma error code if available
        }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { name, description, price, foodItemIds, availableDays } = await req.json()

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
        }

        const foodMenu = await prisma.foodMenu.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                availableDays,
                foodItems: {
                    connect: foodItemIds?.map((id: string) => ({ id }))
                }
            },
            include: { foodItems: true }
        })
        return NextResponse.json(foodMenu)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create food menu' }, { status: 500 })
    }
}
