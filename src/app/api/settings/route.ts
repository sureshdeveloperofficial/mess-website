import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET() {
    try {
        let settings: any[] = []
        try {
            settings = await (prisma as any).setting.findMany()
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
        const { settings } = body // Expected format: { settings: { key1: value1, key2: value2 } }

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
        }

        const upsertPromises = Object.entries(settings).map(([key, value]) => {
            const safeKey = String(key)
            const safeValue = String(value)
            
            try {
                if ((prisma as any).setting) {
                    return (prisma as any).setting.upsert({
                        where: { key: safeKey },
                        update: { value: safeValue },
                        create: { key: safeKey, value: safeValue },
                    })
                }
                throw new Error('Prisma model "setting" not found in client')
            } catch (e) {
                // Raw SQL fallback for Upsert
                return prisma.$executeRaw`
                    INSERT INTO "Setting" ("id", "key", "value")
                    VALUES (gen_random_uuid()::text, ${safeKey}, ${safeValue})
                    ON CONFLICT ("key") DO UPDATE SET "value" = ${safeValue}
                `
            }
        })

        await Promise.all(upsertPromises)

        return NextResponse.json({ message: 'Settings updated successfully' })
    } catch (error) {
        console.error('Settings update error:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
