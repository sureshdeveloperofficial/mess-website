import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'
import prisma from '@/utils/prisma'
import { sendOrderConfirmationEmail } from '@/utils/mail'

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

        if (!customerName || !customerPhone) {
            return NextResponse.json({ error: 'Customer name and phone number are required' }, { status: 400 })
        }

        const orderRemarks = body.orderRemarks || body.specialNotes || null
        const cleanEmail = customerEmail && customerEmail.trim() !== '' ? customerEmail.trim() : null

        const order = await prisma.$transaction(async (tx) => {
            let customer;

            if (session?.user?.email) {
                customer = await tx.customer.upsert({
                    where: { email: session.user.email },
                    update: {
                        name: customerName,
                        phone: customerPhone,
                        whatsappNo: whatsappNo || null,
                    },
                    create: {
                        name: customerName,
                        email: session.user.email,
                        phone: customerPhone,
                        whatsappNo: whatsappNo || null,
                    }
                })
            } else {
                customer = await tx.customer.upsert({
                    where: { phone: customerPhone },
                    update: {
                        name: customerName,
                        email: cleanEmail,
                        whatsappNo: whatsappNo || null,
                    },
                    create: {
                        name: customerName,
                        phone: customerPhone,
                        email: cleanEmail,
                        whatsappNo: whatsappNo || null,
                    }
                })
            }

            return tx.order.create({
                data: {
                    customerId: customer.id,
                    address: address || `${buildingName || ''} ${flatRoomNumber || ''}`.trim() || 'Dubai, UAE',
                    buildingName: buildingName || null,
                    flatRoomNumber: flatRoomNumber || null,
                    startDate: new Date(startDate || new Date()),
                    deliveryLocation: deliveryLocation || 'Inside my room',
                    brunchLunchLocation: brunchLunchLocation || null,
                    dinnerLocation: dinnerLocation || null,
                    totalAmount: parseFloat(totalAmount) || 0,
                    paymentMethod: paymentMethod || "COD",
                    orderRemarks,
                    selectionsJson: selectionsJson || {},
                    includeSundays: includeSundays ?? true,
                    sundaysCount: sundaysCount || 0,
                    activeDates: activeDates || [],
                    selectedMenus: {
                        connect: (menuIds || []).map((id: string) => ({ id }))
                    }
                },
                include: {
                    customer: true,
                    selectedMenus: true
                }
            })
        })

        // Asynchronously dispatch order receipt email to customer
        sendOrderConfirmationEmail(order).catch(err => {
            console.warn('⚠️ Order confirmation email dispatch failed:', err.message)
        })

        return NextResponse.json(order)
    } catch (error: any) {
        console.error('Order creation error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
