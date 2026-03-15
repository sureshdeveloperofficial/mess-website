import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/utils/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '5')
        const skip = (page - 1) * limit

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: {
                    customer: {
                        email: session.user.email
                    }
                },
                include: {
                    selectedMenus: {
                        include: {
                            foodItems: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.order.count({
                where: {
                    customer: {
                        email: session.user.email
                    }
                }
            })
        ])

        return NextResponse.json({
            orders,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        })
    } catch (error: any) {
        console.error('User orders fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
