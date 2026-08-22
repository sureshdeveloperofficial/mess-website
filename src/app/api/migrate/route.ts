import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET() {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "FoodItem" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`)
        return NextResponse.json({ success: true, message: 'Columns added successfully' })
    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
