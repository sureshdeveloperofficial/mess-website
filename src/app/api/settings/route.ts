import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

        if (!settingsObject.restaurant_name || String(settingsObject.restaurant_name).toLowerCase().includes('shamil')) {
            settingsObject.restaurant_name = 'PREMIUM MESS'
        }
        if (settingsObject.site_name && String(settingsObject.site_name).toLowerCase().includes('shamil')) {
            settingsObject.site_name = 'PREMIUM MESS'
        }

        // Parse JSON arrays for media if they exist
        if (settingsObject.hero_slider_images && typeof settingsObject.hero_slider_images === 'string') {
            try {
                settingsObject.hero_slider_images = JSON.parse(settingsObject.hero_slider_images)
            } catch {
                // keep original string if parsing fails
            }
        }

        if (settingsObject.gallery_items && typeof settingsObject.gallery_items === 'string') {
            try {
                settingsObject.gallery_items = JSON.parse(settingsObject.gallery_items)
            } catch {
                // keep original string if parsing fails
            }
        }

        return new NextResponse(JSON.stringify(settingsObject), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
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
            const safeValue = value !== undefined && value !== null
                ? (typeof value === 'object' ? JSON.stringify(value) : String(value).trim())
                : ''

            await prisma.setting.upsert({
                where: { key: safeKey },
                update: { value: safeValue },
                create: {
                    key: safeKey,
                    value: safeValue
                }
            })
        }

        // Revalidate Next.js cache across the site
        try {
            revalidatePath('/', 'layout')
            revalidatePath('/')
            revalidatePath('/admin/website-settings')
        } catch (revalidateErr) {
            console.warn('Revalidate warning:', revalidateErr)
        }

        return NextResponse.json({ message: 'Settings updated successfully' })
    } catch (error: any) {
        console.error('Settings update error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
    }
}
