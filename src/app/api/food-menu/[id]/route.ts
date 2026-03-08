import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params
        const foodMenu = await prisma.foodMenu.findUnique({
            where: { id },
            include: {
                foodItems: {
                    include: {
                        category: true
                    }
                }
            }
        })

        if (!foodMenu) {
            return NextResponse.json({ error: 'Food menu not found' }, { status: 404 })
        }

        return NextResponse.json(foodMenu)
    } catch (error) {
        console.error('GET Food Menu Error:', error)
        return NextResponse.json({ error: 'Failed to fetch food menu' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const { name, description, price, foodItemIds, availableDays } = await req.json()

        const foodMenu = await prisma.foodMenu.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                availableDays,
                foodItems: {
                    set: foodItemIds?.map((id: string) => ({ id }))
                }
            },
            include: { foodItems: true }
        })
        return NextResponse.json(foodMenu)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update food menu' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        await prisma.foodMenu.delete({
            where: { id },
        })
        return NextResponse.json({ message: 'Food menu deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete food menu' }, { status: 500 })
    }
}
