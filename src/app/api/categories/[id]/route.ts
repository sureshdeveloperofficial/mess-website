import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { name, isActive } = body

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (isActive !== undefined) updateData.isActive = isActive

        const category = await (prisma.category as any).update({
            where: { id },
            data: updateData,
        })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Update category error:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const { name, isActive } = body

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (isActive !== undefined) updateData.isActive = isActive

        const category = await (prisma.category as any).update({
            where: { id },
            data: updateData,
        })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Patch category error:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        await prisma.category.delete({
            where: { id },
        })
        return NextResponse.json({ message: 'Category deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
