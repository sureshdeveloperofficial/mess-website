import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "MealType" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT UNIQUE NOT NULL,
                "icon" TEXT DEFAULT 'solar:cup-hot-bold-duotone',
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `)
        await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "mealTypeId" TEXT;`)
        await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "scheduleJson" JSONB;`)
        await prisma.$executeRawUnsafe(`
            INSERT INTO "MealType" ("id", "name", "icon", "isActive", "createdAt", "updatedAt")
            VALUES 
                ('meal_001', 'Breakfast', 'solar:sunrise-bold-duotone', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                ('meal_002', 'Lunch', 'solar:sun-bold-duotone', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                ('meal_003', 'Dinner', 'solar:moon-stars-bold-duotone', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT ("name") DO NOTHING;
        `)

        // Link existing food menus to meal types by name match
        await prisma.$executeRawUnsafe(`UPDATE "FoodMenu" SET "mealTypeId" = 'meal_001' WHERE LOWER("name") LIKE '%breakfast%' AND "mealTypeId" IS NULL;`)
        await prisma.$executeRawUnsafe(`UPDATE "FoodMenu" SET "mealTypeId" = 'meal_002' WHERE LOWER("name") LIKE '%lunch%' AND "mealTypeId" IS NULL;`)
        await prisma.$executeRawUnsafe(`UPDATE "FoodMenu" SET "mealTypeId" = 'meal_003' WHERE LOWER("name") LIKE '%dinner%' AND "mealTypeId" IS NULL;`)

        return NextResponse.json({ success: true, message: 'MealType table created & scheduleJson column added' })
    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
