import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function POST(req: Request) {
    try {
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
            selectionsJson
        } = body

        const order = await prisma.order.create({
            data: {
                customerName,
                customerPhone,
                customerEmail,
                whatsappNo,
                address,
                buildingName,
                flatRoomNumber,
                startDate: new Date(startDate),
                deliveryLocation,
                brunchLunchLocation,
                dinnerLocation,
                totalAmount,
                paymentMethod: "COD",
                selectionsJson,
                selectedMenus: {
                    connect: menuIds.map((id: string) => ({ id }))
                }
            }
        })

        return NextResponse.json(order)
    } catch (error: any) {
        console.error('Order creation error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
