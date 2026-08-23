import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/utils/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '10', 10)
        const skip = (page - 1) * limit

        // Find customer associated with user session
        const customer = await prisma.customer.findFirst({
            where: {
                email: session.user.email,
            },
        })

        const whereClause: any = customer
            ? { customerId: customer.id }
            : { customer: { email: session.user.email } }

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                include: {
                    customer: true,
                    selectedMenus: {
                        include: {
                            foodItems: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.order.count({
                where: whereClause,
            }),
        ])

        const totalPages = Math.ceil(totalCount / limit) || 1

        return NextResponse.json({
            orders,
            totalPages,
            totalCount,
            currentPage: page,
        })
    } catch (error: any) {
        console.error('My-orders fetch error:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch customer orders' }, { status: 500 })
    }
}
