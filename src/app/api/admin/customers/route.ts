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
                },
                orders: {
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                        paymentStatus: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Map customers with computed total spend and last order date
        const enrichedCustomers = customers.map(cust => {
            const totalSpent = cust.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            const latestOrder = cust.orders[0] || null
            return {
                id: cust.id,
                name: cust.name,
                phone: cust.phone,
                email: cust.email,
                whatsappNo: cust.whatsappNo,
                createdAt: cust.createdAt,
                updatedAt: cust.updatedAt,
                totalOrders: cust._count.orders,
                totalSpent,
                latestOrderDate: latestOrder ? latestOrder.createdAt : null,
                _count: cust._count
            }
        })

        return NextResponse.json(enrichedCustomers)
    } catch (error: any) {
        console.error('Customers fetch error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, phone, email, whatsappNo } = body

        if (!name || !phone) {
            return NextResponse.json({ error: 'Customer Name and Phone Number are required.' }, { status: 400 })
        }

        // Clean & normalize phone
        const cleanedPhone = phone.trim()

        // Check for existing customer with same phone
        const existingPhone = await prisma.customer.findUnique({
            where: { phone: cleanedPhone }
        })

        if (existingPhone) {
            return NextResponse.json({ error: 'A customer with this phone number already exists.' }, { status: 409 })
        }

        // Check for existing customer with same email if provided
        if (email && email.trim() !== '') {
            const cleanedEmail = email.trim().toLowerCase()
            const existingEmail = await prisma.customer.findUnique({
                where: { email: cleanedEmail }
            })
            if (existingEmail) {
                return NextResponse.json({ error: 'A customer with this email address already exists.' }, { status: 409 })
            }
        }

        const newCustomer = await prisma.customer.create({
            data: {
                name: name.trim(),
                phone: cleanedPhone,
                email: email && email.trim() !== '' ? email.trim().toLowerCase() : null,
                whatsappNo: whatsappNo && whatsappNo.trim() !== '' ? whatsappNo.trim() : null,
            },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        })

        return NextResponse.json(newCustomer, { status: 201 })
    } catch (error: any) {
        console.error('Create customer error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

