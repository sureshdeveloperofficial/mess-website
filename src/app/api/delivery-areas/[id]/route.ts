import { NextResponse } from 'next/server'
import { getDeliveryAreasFromDB, saveDeliveryAreasToDB, DeliveryAreaItem } from '../route'

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const areas = await getDeliveryAreasFromDB()

        const index = areas.findIndex(a => a.id === id)
        if (index === -1) {
            return NextResponse.json({ error: 'Delivery area not found' }, { status: 404 })
        }

        const existing = areas[index]

        // If name is updated, check for duplicates with other items
        if (body.name && body.name.trim() !== existing.name) {
            const isDup = areas.some(a => a.id !== id && a.name.trim().toLowerCase() === body.name.trim().toLowerCase())
            if (isDup) {
                return NextResponse.json({ error: 'Another delivery area already exists with this name' }, { status: 400 })
            }
        }

        const updated: DeliveryAreaItem = {
            ...existing,
            name: body.name !== undefined ? body.name.trim() : existing.name,
            status: body.status !== undefined ? body.status : existing.status,
            timing: body.timing !== undefined ? body.timing.trim() : existing.timing,
            isPopular: body.isPopular !== undefined ? Boolean(body.isPopular) : existing.isPopular,
            notes: body.notes !== undefined ? body.notes.trim() : existing.notes,
            sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
            updatedAt: new Date().toISOString()
        }

        areas[index] = updated
        await saveDeliveryAreasToDB(areas)

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error('PUT /api/delivery-areas/[id] error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update delivery area' }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        let areas = await getDeliveryAreasFromDB()

        const initialLength = areas.length
        areas = areas.filter(a => a.id !== id)

        if (areas.length === initialLength) {
            return NextResponse.json({ error: 'Delivery area not found' }, { status: 404 })
        }

        await saveDeliveryAreasToDB(areas)

        return NextResponse.json({ message: 'Delivery area deleted successfully' })
    } catch (error: any) {
        console.error('DELETE /api/delivery-areas/[id] error:', error)
        return NextResponse.json({ error: error.message || 'Failed to delete delivery area' }, { status: 500 })
    }
}
