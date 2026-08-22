import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'

interface Params {
    params: Promise<{ id: string }>
}

// GET single customer details with all orders and subscription histories
export async function GET(req: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { orders: true }
                },
                orders: {
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
                }
            }
        })

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        const totalSpent = customer.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

        return NextResponse.json({
            ...customer,
            totalSpent
        })
    } catch (error: any) {
        console.error('Customer details fetch error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

// PATCH update customer profile
export async function PATCH(req: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { name, phone, email, whatsappNo } = body

        if (!name || !phone) {
            return NextResponse.json({ error: 'Customer Name and Phone Number are required.' }, { status: 400 })
        }

        const cleanedPhone = phone.trim()

        // Check if another customer is using this phone number
        const existingPhone = await prisma.customer.findFirst({
            where: {
                phone: cleanedPhone,
                NOT: { id }
            }
        })

        if (existingPhone) {
            return NextResponse.json({ error: 'Another customer with this phone number already exists.' }, { status: 409 })
        }

        // Check if another customer is using this email
        if (email && email.trim() !== '') {
            const cleanedEmail = email.trim().toLowerCase()
            const existingEmail = await prisma.customer.findFirst({
                where: {
                    email: cleanedEmail,
                    NOT: { id }
                }
            })
            if (existingEmail) {
                return NextResponse.json({ error: 'Another customer with this email address already exists.' }, { status: 409 })
            }
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id },
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

        return NextResponse.json(updatedCustomer)
    } catch (error: any) {
        console.error('Customer update error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE customer record
export async function DELETE(req: Request, { params }: Params) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Check customer exists
        const existing = await prisma.customer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        await prisma.customer.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Customer deleted successfully', id })
    } catch (error: any) {
        console.error('Customer deletion error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
