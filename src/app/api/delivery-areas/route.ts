import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export interface DeliveryAreaItem {
    id: string
    name: string
    status: 'active' | 'coming_soon' | 'inactive'
    timing: string
    isPopular: boolean
    notes?: string
    sortOrder: number
    createdAt: string
    updatedAt: string
}

const SETTING_KEY = 'delivery_areas_json'

const DEFAULT_ZONES: Omit<DeliveryAreaItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { name: 'Al Quoz', status: 'active', timing: 'Lunch & Dinner', isPopular: true, notes: 'Central Kitchen Hub area', sortOrder: 1 },
    { name: 'Al Khail Gate', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true, notes: 'Fast doorstep drop', sortOrder: 2 },
    { name: 'International City', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true, notes: 'Daily residential delivery', sortOrder: 3 },
    { name: 'Al Warqa', status: 'active', timing: 'Lunch & Dinner', isPopular: true, notes: 'Regular route', sortOrder: 4 },
    { name: 'Al Warsan', status: 'active', timing: 'Lunch & Dinner', isPopular: true, notes: 'Regular route', sortOrder: 5 },
    { name: 'DIP (Dubai Investment Park)', status: 'active', timing: 'Lunch & Dinner', isPopular: true, notes: 'Industrial & residential', sortOrder: 6 },
    { name: 'Jebel Ali', status: 'active', timing: 'Lunch & Dinner', isPopular: true, notes: 'Corporate & camp drops', sortOrder: 7 },
    { name: 'Deira', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true, notes: 'High density area', sortOrder: 8 },
    { name: 'Al Nahda', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: true, notes: 'High density area', sortOrder: 9 },
    { name: 'Al Karama', status: 'active', timing: 'Lunch & Dinner', isPopular: false, notes: 'Regular route', sortOrder: 10 },
    { name: 'Bur Dubai', status: 'active', timing: 'Lunch & Dinner', isPopular: false, notes: 'Regular route', sortOrder: 11 },
    { name: 'Business Bay', status: 'active', timing: 'Lunch & Dinner', isPopular: false, notes: 'Corporate & residential', sortOrder: 12 },
    { name: 'Al Barsha', status: 'active', timing: 'Lunch & Dinner', isPopular: false, notes: 'Residential delivery', sortOrder: 13 },
    { name: 'Silicon Oasis', status: 'active', timing: 'Lunch & Dinner', isPopular: false, notes: 'Tech park & villas', sortOrder: 14 },
    { name: 'Discovery Gardens', status: 'active', timing: 'Lunch & Dinner', isPopular: false, notes: 'Cluster apartments', sortOrder: 15 },
    { name: 'Muhaisnah', status: 'active', timing: 'Breakfast, Lunch & Dinner', isPopular: false, notes: 'Full coverage', sortOrder: 16 },
]

export async function getDeliveryAreasFromDB(): Promise<DeliveryAreaItem[]> {
    try {
        const record = await prisma.setting.findUnique({
            where: { key: SETTING_KEY }
        })

        if (!record || !record.value) {
            // Seed defaults
            const now = new Date().toISOString()
            const initialList: DeliveryAreaItem[] = DEFAULT_ZONES.map((zone, idx) => ({
                id: `area_${idx + 1}_${Date.now()}`,
                ...zone,
                createdAt: now,
                updatedAt: now,
            }))

            await prisma.setting.upsert({
                where: { key: SETTING_KEY },
                update: { value: JSON.stringify(initialList) },
                create: { key: SETTING_KEY, value: JSON.stringify(initialList) }
            })

            return initialList
        }

        const parsed = JSON.parse(record.value)
        if (Array.isArray(parsed)) {
            return parsed.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        }
        return []
    } catch (error) {
        console.error('Error fetching delivery areas:', error)
        return DEFAULT_ZONES.map((zone, idx) => ({
            id: `area_fallback_${idx + 1}`,
            ...zone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }))
    }
}

export async function saveDeliveryAreasToDB(areas: DeliveryAreaItem[]) {
    await prisma.setting.upsert({
        where: { key: SETTING_KEY },
        update: { value: JSON.stringify(areas) },
        create: { key: SETTING_KEY, value: JSON.stringify(areas) }
    })
}

export async function GET() {
    try {
        const areas = await getDeliveryAreasFromDB()
        return NextResponse.json(areas)
    } catch (error: any) {
        console.error('GET /api/delivery-areas error:', error)
        return NextResponse.json({ error: 'Failed to fetch delivery areas' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, status = 'active', timing = 'Breakfast, Lunch & Dinner', isPopular = false, notes = '', sortOrder = 0 } = body

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Area name is required' }, { status: 400 })
        }

        const areas = await getDeliveryAreasFromDB()

        // Check for duplicates
        if (areas.some(a => a.name.trim().toLowerCase() === name.trim().toLowerCase())) {
            return NextResponse.json({ error: 'An area with this name already exists' }, { status: 400 })
        }

        const now = new Date().toISOString()
        const newArea: DeliveryAreaItem = {
            id: `area_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: name.trim(),
            status: status === 'coming_soon' ? 'coming_soon' : status === 'inactive' ? 'inactive' : 'active',
            timing: timing.trim() || 'Lunch & Dinner',
            isPopular: Boolean(isPopular),
            notes: notes ? notes.trim() : '',
            sortOrder: Number(sortOrder) || areas.length + 1,
            createdAt: now,
            updatedAt: now,
        }

        areas.push(newArea)
        await saveDeliveryAreasToDB(areas)

        return NextResponse.json(newArea, { status: 201 })
    } catch (error: any) {
        console.error('POST /api/delivery-areas error:', error)
        return NextResponse.json({ error: error.message || 'Failed to create delivery area' }, { status: 500 })
    }
}
