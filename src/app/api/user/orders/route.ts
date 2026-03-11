import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/utils/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        console.log('[API User Orders] Session fetched:', session)

        if (!session?.user?.email) {
            console.log('[API User Orders] No user email found in session. Returning 401.')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log(`[API User Orders] Fetching orders for email: ${session.user.email}`)

        const orders = await prisma.order.findMany({
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
            }
        })

        console.log(`[API User Orders] Found ${orders.length} orders for ${session.user.email}`)
        return NextResponse.json(orders)
    } catch (error: any) {
        console.error('User orders fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
