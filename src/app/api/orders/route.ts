import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/utils/prisma'

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                customer: true,
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
        return NextResponse.json(orders)
    } catch (error: any) {
        console.error('Orders fetch error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const body = await req.json()
        const {
            customerName,
            customerPhone,
            customerEmail,
            whatsappNo,
            address,
            buildingName,
            flatRoomNumber,
            startDate,
            deliveryLocation,
            brunchLunchLocation,
            dinnerLocation,
            totalAmount,
            menuIds,
            selectionsJson,
            includeSundays,
            sundaysCount,
            activeDates,
            paymentMethod
        } = body

        const order = await prisma.$transaction(async (tx) => {
            let customer;

            // Senior Software Engineer best practice: 
            // If user is authenticated, use session identifying info (email) as primary key.
            if (session?.user?.email) {
                customer = await tx.customer.upsert({
                    where: { email: session.user.email },
                    update: {
                        name: customerName,
                        phone: customerPhone,
                        whatsappNo: whatsappNo,
                    },
                    create: {
                        name: customerName,
                        email: session.user.email,
                        phone: customerPhone,
                        whatsappNo: whatsappNo,
                    }
                })
            } else {
                // Fallback to phone-based identification for guests or unauthenticated users
                customer = await tx.customer.upsert({
                    where: { phone: customerPhone },
                    update: {
                        name: customerName,
                        email: customerEmail,
                        whatsappNo: whatsappNo,
                    },
                    create: {
                        name: customerName,
                        phone: customerPhone,
                        email: customerEmail,
                        whatsappNo: whatsappNo,
                    }
                })
            }

            return tx.order.create({
                data: {
                    customerId: customer.id,
                    address,
                    buildingName,
                    flatRoomNumber,
                    startDate: new Date(startDate),
                    deliveryLocation,
                    brunchLunchLocation,
                    dinnerLocation,
                    totalAmount,
                    paymentMethod: paymentMethod || "COD",
                    selectionsJson,
                    includeSundays,
                    sundaysCount,
                    activeDates,
                    selectedMenus: {
                        connect: menuIds.map((id: string) => ({ id }))
                    }
                }
            })
        })

        return NextResponse.json(order)
    } catch (error: any) {
        console.error('Order creation error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
