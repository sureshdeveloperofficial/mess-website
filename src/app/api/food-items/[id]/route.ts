import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const { name, description, price, image, categoryId, options } = await req.json()

        // First, delete current options to replace them
        await prisma.option.deleteMany({
            where: { foodItemId: id }
        })

        const foodItem = await prisma.foodItem.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                image,
                categoryId,
                options: {
                    create: options?.map((opt: any) => ({
                        name: opt.name,
                        price: parseFloat(opt.price)
                    }))
                }
            },
            include: { category: true, options: true }
        })
        return NextResponse.json(foodItem)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update food item' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        await prisma.foodItem.delete({
            where: { id },
        })
        return NextResponse.json({ message: 'Food item deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 })
    }
}
