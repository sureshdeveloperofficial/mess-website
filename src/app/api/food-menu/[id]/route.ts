import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { name, description, price, foodItemIds, availableDays, isActive } = body

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (price !== undefined) updateData.price = parseFloat(price)
        if (availableDays !== undefined) updateData.availableDays = availableDays
        if (isActive !== undefined) updateData.isActive = isActive
        if (foodItemIds !== undefined) {
            updateData.foodItems = {
                set: foodItemIds?.map((itemId: string) => ({ id: itemId }))
            }
        }

        const foodMenu = await (prisma.foodMenu as any).update({
            where: { id },
            data: updateData,
            include: { foodItems: true }
        })
        return NextResponse.json(foodMenu)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update food menu' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { name, description, price, foodItemIds, availableDays, isActive } = body

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (price !== undefined) updateData.price = parseFloat(price)
        if (availableDays !== undefined) updateData.availableDays = availableDays
        if (isActive !== undefined) updateData.isActive = isActive
        if (foodItemIds !== undefined) {
            updateData.foodItems = {
                set: foodItemIds?.map((itemId: string) => ({ id: itemId }))
            }
        }

        const foodMenu = await (prisma.foodMenu as any).update({
            where: { id },
            data: updateData,
            include: { foodItems: true }
        })
        return NextResponse.json(foodMenu)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to patch food menu' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
