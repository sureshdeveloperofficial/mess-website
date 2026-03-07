import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const { name, description, price, foodItemIds } = await req.json()

        const foodPlan = await prisma.foodPlan.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                foodItems: {
                    set: foodItemIds?.map((id: string) => ({ id }))
                }
            },
            include: { foodItems: true }
        })
        return NextResponse.json(foodPlan)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update food plan' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        await prisma.foodPlan.delete({
            where: { id },
        })
        return NextResponse.json({ message: 'Food plan deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete food plan' }, { status: 500 })
    }
}
