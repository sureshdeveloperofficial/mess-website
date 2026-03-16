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
    const { status, paymentStatus, orderRemarks, paymentRemarks, paymentReceiptUrl } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Build the update payload based on provided fields
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus
    if (orderRemarks !== undefined) updateData.orderRemarks = orderRemarks
    if (paymentRemarks !== undefined) updateData.paymentRemarks = paymentRemarks
    if (paymentReceiptUrl !== undefined) updateData.paymentReceiptUrl = paymentReceiptUrl

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        selectedMenus: {
            include: {
                foodItems: true
            }
        }
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
