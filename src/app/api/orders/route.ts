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
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Please sign in or create an account to place an order' }, { status: 401 })
        }

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
        const cleanEmail = session.user.email || (customerEmail && customerEmail.trim() !== '' ? customerEmail.trim() : null)

        // Dynamic target serving days calculation from selected FoodMenu records in DB
        let targetDaysCount = 0
        let effectiveServingDays: string[] = []

        if (Array.isArray(menuIds) && menuIds.length > 0) {
            const selectedMenuRecords = await prisma.foodMenu.findMany({
                where: { id: { in: menuIds } }
            })
            
            selectedMenuRecords.forEach((m) => {
                targetDaysCount += (m.days || 26)
                if (Array.isArray(m.availableDays) && m.availableDays.length > 0) {
                    effectiveServingDays = Array.from(new Set([...effectiveServingDays, ...m.availableDays]))
                }
            })
        }

        // Fallback targetDaysCount if menu records didn't provide days
        if (targetDaysCount <= 0) {
            const isSundayOnly = Array.isArray(activeDates) && activeDates.length === 1 && activeDates[0] === 'Sunday'
            if (isSundayOnly) {
                targetDaysCount = 4
            } else if (includeSundays) {
                targetDaysCount = 30 // 26 weekdays + 4 sundays
            } else {
                targetDaysCount = 26 // Mon-Sat 26 days
            }
        }

        const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        if (effectiveServingDays.length === 0) {
            effectiveServingDays = Array.isArray(activeDates) && activeDates.length > 0 && activeDates.some((d: string) => dayNameMap.includes(d))
                ? activeDates
                : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', ...(includeSundays ? ['Sunday'] : [])]
        }

        // Generate dynamic calendar dates (YYYY-MM-DD) from startDate matching plan serving days
        const rawStartDate = startDate ? new Date(startDate) : new Date()
        const generatedCalendarDates: string[] = []
        const currentCal = new Date(rawStartDate.getFullYear(), rawStartDate.getMonth(), rawStartDate.getDate())
        let loopLimit = 0

        while (generatedCalendarDates.length < targetDaysCount && loopLimit < 120) {
            const dayOfWeek = dayNameMap[currentCal.getDay()]
            if (effectiveServingDays.includes(dayOfWeek)) {
                const y = currentCal.getFullYear()
                const m = String(currentCal.getMonth() + 1).padStart(2, '0')
                const d = String(currentCal.getDate()).padStart(2, '0')
                generatedCalendarDates.push(`${y}-${m}-${d}`)
            }
            currentCal.setDate(currentCal.getDate() + 1)
            loopLimit++
        }

        const finalActiveDates = Array.isArray(activeDates) && activeDates.length > 0 && activeDates[0].includes('-')
            ? activeDates
            : generatedCalendarDates

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

            // Generate Creation-Based Sequential Unique Order ID: ORD-YYYY-MM-DD-1, ORD-YYYY-MM-DD-2
            const now = new Date()
            const yyyy = now.getFullYear()
            const mm = String(now.getMonth() + 1).padStart(2, '0')
            const dd = String(now.getDate()).padStart(2, '0')
            const totalOrders = await tx.order.count()
            let nextSeq = totalOrders + 1
            let customOrderId = `ORD-${yyyy}-${mm}-${dd}-${nextSeq}`

            // Safe unique check loop
            while (await tx.order.findUnique({ where: { id: customOrderId } })) {
                nextSeq++
                customOrderId = `ORD-${yyyy}-${mm}-${dd}-${nextSeq}`
            }

            return (tx.order as any).create({
                data: {
                    id: customOrderId,
                    customerId: customer.id,
                    address: address || `${buildingName || ''} ${flatRoomNumber || ''}`.trim() || 'Dubai, UAE',
                    buildingName: buildingName || null,
                    flatRoomNumber: flatRoomNumber || null,
                    startDate: rawStartDate,
                    deliveryLocation: deliveryLocation || 'Inside my room',
                    brunchLunchLocation: brunchLunchLocation || null,
                    dinnerLocation: dinnerLocation || null,
                    totalAmount: parseFloat(totalAmount) || 0,
                    paymentMethod: paymentMethod || "COD",
                    orderRemarks,
                    selectionsJson: selectionsJson || {},
                    includeSundays: includeSundays ?? true,
                    sundaysCount: sundaysCount || 0,
                    activeDates: finalActiveDates,
                    selectedMenus: {
                        connect: (menuIds || []).map((id: string) => ({ id }))
                    }
                } as any,
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
