import React from 'react'
import { PremiumInvoiceTemplate } from '@/app/components/Order/PremiumInvoiceTemplate'
import prisma from '@/utils/prisma'
import { notFound } from 'next/navigation'

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const orderRaw = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            selectedMenus: {
                include: {
                    foodItems: true
                }
            }
        }
    })

    if (!orderRaw) {
        notFound()
    }

    // Transform database model to match the UI Order type if needed
    // The UI template expects date as string and specific structure
    const order = {
        ...orderRaw,
        createdAt: orderRaw.createdAt.toISOString(),
        customer: {
            name: orderRaw.customer.name,
            email: orderRaw.customer.email || '',
        }
    } as any

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            <PremiumInvoiceTemplate order={order} />
        </div>
    )
}
