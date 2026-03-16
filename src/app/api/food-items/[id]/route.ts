import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const foodItem = await prisma.foodItem.findUnique({
            where: { id },
            include: { category: true }
        })

        if (!foodItem) {
            return NextResponse.json({ error: 'Food item not found' }, { status: 404 })
        }

        return NextResponse.json(foodItem)
    } catch (error) {
        console.error('GET Food Item Error:', error)
        return NextResponse.json({ error: 'Failed to fetch food item' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const { name, description, price, monthlyPrice, image, categoryId } = await req.json()
        const foodItem = await prisma.foodItem.update({
            where: { id },
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
        console.error('PUT Food Item Error:', error)
        return NextResponse.json({
            error: 'Failed to update food item',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
