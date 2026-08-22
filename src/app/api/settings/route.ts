import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET() {
    try {
        let settings: any[] = []
        try {
            settings = await prisma.setting.findMany()
        } catch (e) {
            console.warn('Prisma model "setting" not found in client, trying raw query...')
            settings = await prisma.$queryRaw`SELECT * FROM "Setting"`
        }
        
        // Convert array to key-value object
        const settingsObject = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value
            return acc
        }, {})
        return NextResponse.json(settingsObject)
    } catch (error) {
        console.error('Settings fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const targetSettings = body.settings || body

        if (!targetSettings || typeof targetSettings !== 'object') {
            return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
        }

        for (const [key, value] of Object.entries(targetSettings)) {
            const safeKey = String(key).trim()
            if (!safeKey) continue
            const safeValue = value !== undefined && value !== null ? String(value).trim() : ''

            await prisma.setting.upsert({
                where: { key: safeKey },
                update: { value: safeValue },
                create: {
                    key: safeKey,
                    value: safeValue
                }
            })
        }

        return NextResponse.json({ message: 'Settings updated successfully' })
    } catch (error: any) {
        console.error('Settings update error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
    }
}

