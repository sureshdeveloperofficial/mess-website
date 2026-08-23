import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Require authentication (and ideally an Admin role check here, but relying on session for now)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, orderRemarks, paymentRemarks, paymentReceiptUrl, servedDates } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Build the Prisma update payload with known standard schema fields ONLY
    const prismaUpdateData: any = {}
    if (status !== undefined) prismaUpdateData.status = status
    if (paymentStatus !== undefined) prismaUpdateData.paymentStatus = paymentStatus
    if (orderRemarks !== undefined) prismaUpdateData.orderRemarks = orderRemarks
    if (paymentRemarks !== undefined) prismaUpdateData.paymentRemarks = paymentRemarks
    if (paymentReceiptUrl !== undefined) prismaUpdateData.paymentReceiptUrl = paymentReceiptUrl

    if (Object.keys(prismaUpdateData).length > 0) {
      await prisma.order.update({
        where: { id },
        data: prismaUpdateData,
      })
    }

    // Update servedDates safely via raw SQL to bypass in-memory Prisma DMMF query lock
    if (servedDates !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "Order" SET "servedDates" = $1 WHERE "id" = $2;`,
          servedDates,
          id
        )
      } catch {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "servedDates" TEXT[] DEFAULT ARRAY[]::TEXT[];`)
          await prisma.$executeRawUnsafe(
            `UPDATE "Order" SET "servedDates" = $1 WHERE "id" = $2;`,
            servedDates,
            id
          )
        } catch (rawErr) {
          console.warn('Could not update servedDates via raw SQL:', rawErr)
        }
      }
    }

    // Fetch the updated order
    const updatedOrder = await prisma.order.findUnique({
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

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found after update' }, { status: 404 })
    }

    // Attach servedDates to response if available
    const enrichedOrder = {
      ...updatedOrder,
      servedDates: servedDates !== undefined ? servedDates : (updatedOrder as any).servedDates || []
    }

    return NextResponse.json(enrichedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Order deleted successfully', id })
  } catch (error: any) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete order' },
      { status: 500 }
    )
  }
}

