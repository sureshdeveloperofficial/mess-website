import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const customers = await prisma.customer.findMany({
            include: {
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(customers)
    } catch (error: any) {
        console.error('Customers fetch error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
