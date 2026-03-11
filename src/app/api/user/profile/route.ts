import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/utils/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.customer.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsappNo: true,
                createdAt: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error: any) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, phone, whatsappNo } = body

        const updatedUser = await prisma.customer.update({
            where: { email: session.user.email },
            data: {
                name,
                phone,
                whatsappNo
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
