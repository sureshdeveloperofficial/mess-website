import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function GET() {
    try {
        const foodPlans = await prisma.foodPlan.findMany({
            include: { foodItems: { include: { category: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(foodPlans)
    } catch (error) {
        console.error('GET Food Plans Error:', error)
        return NextResponse.json({ error: 'Failed to fetch food plans' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { name, description, price, foodItemIds } = await req.json()

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
        }

        const foodPlan = await prisma.foodPlan.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                foodItems: {
                    connect: foodItemIds?.map((id: string) => ({ id }))
                }
            },
            include: { foodItems: true }
        })
        return NextResponse.json(foodPlan)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create food plan' }, { status: 500 })
    }
}
