import prisma from '../src/utils/prisma'

async function main() {
    console.log('Ensuring columns exist in database...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "servingCount" INTEGER NOT NULL DEFAULT 1;`).catch(() => {})
    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "scheduleJson" JSONB;`).catch(() => {})
    await prisma.$executeRawUnsafe(`ALTER TABLE "FoodMenu" ADD COLUMN IF NOT EXISTS "days" INTEGER DEFAULT 30;`).catch(() => {})

    console.log('Fetching active food items and meal types...')
    const foodItems = await prisma.foodItem.findMany({ where: { isActive: true } })
    console.log(`Found ${foodItems.length} active dishes.`)

    const breakfastItems = foodItems.filter(i => 
        i.name.toLowerCase().includes('breakfast') || 
        i.name.toLowerCase().includes('appam') || 
        i.name.toLowerCase().includes('dosa') || 
        i.name.toLowerCase().includes('idli') || 
        i.name.toLowerCase().includes('puttu')
    )
    const lunchItems = foodItems.filter(i => 
        i.name.toLowerCase().includes('lunch') || 
        i.name.toLowerCase().includes('meals') || 
        i.name.toLowerCase().includes('rice') || 
        i.name.toLowerCase().includes('biryani') || 
        i.name.toLowerCase().includes('mota')
    )
    const dinnerItems = foodItems.filter(i => 
        i.name.toLowerCase().includes('dinner') || 
        i.name.toLowerCase().includes('porotta') || 
        i.name.toLowerCase().includes('chappathi') || 
        i.name.toLowerCase().includes('curry') || 
        i.name.toLowerCase().includes('roast')
    )

    const allItemIds = foodItems.map(i => i.id)
    const bfIds = (breakfastItems.length > 0 ? breakfastItems : foodItems).map(i => i.id)
    const lunchIds = (lunchItems.length > 0 ? lunchItems : foodItems).map(i => i.id)
    const dinIds = (dinnerItems.length > 0 ? dinnerItems : foodItems).map(i => i.id)

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    // Schedule template
    const schedule: Record<string, Record<string, string[]>> = {}
    DAYS.forEach(day => {
        schedule[day] = {
            breakfast: bfIds.slice(0, 4),
            lunch: lunchIds.slice(0, 4),
            dinner: dinIds.slice(0, 4),
        }
    })

    // 1. Clear previous food plans
    await prisma.foodMenu.deleteMany({})

    // 2. Create 1 Time Meal Plan
    const plan1 = await prisma.foodMenu.create({
        data: {
            name: '1 Time Meal Plan',
            description: 'Choose any 1 meal (Breakfast, Lunch, or Dinner) delivered fresh to your room or flat daily.',
            price: 220,
            days: 30,
            isActive: true,
            availableDays: DAYS,
            foodItems: {
                connect: allItemIds.map(id => ({ id }))
            }
        }
    })

    // 3. Create 2 Time Meal Plan
    const plan2 = await prisma.foodMenu.create({
        data: {
            name: '2 Time Meal Plan',
            description: 'Choose any 2 meals (e.g. Lunch + Dinner or Breakfast + Lunch) delivered fresh daily to your room.',
            price: 380,
            days: 30,
            isActive: true,
            availableDays: DAYS,
            foodItems: {
                connect: allItemIds.map(id => ({ id }))
            }
        }
    })

    // 4. Create 3 Time Meal Plan
    const plan3 = await prisma.foodMenu.create({
        data: {
            name: '3 Time Meal Plan',
            description: 'Complete daily subscription with Breakfast, Lunch, and Dinner delivered hot to your doorstep daily.',
            price: 520,
            days: 30,
            isActive: true,
            availableDays: DAYS,
            foodItems: {
                connect: allItemIds.map(id => ({ id }))
            }
        }
    })

    // Update raw scheduleJson and servingCount for all 3
    await prisma.$executeRawUnsafe(
        `UPDATE "FoodMenu" SET "scheduleJson" = $1::jsonb, "servingCount" = 1, "days" = 30 WHERE "id" = $2;`,
        JSON.stringify(schedule),
        plan1.id
    )

    await prisma.$executeRawUnsafe(
        `UPDATE "FoodMenu" SET "scheduleJson" = $1::jsonb, "servingCount" = 2, "days" = 30 WHERE "id" = $2;`,
        JSON.stringify(schedule),
        plan2.id
    )

    await prisma.$executeRawUnsafe(
        `UPDATE "FoodMenu" SET "scheduleJson" = $1::jsonb, "servingCount" = 3, "days" = 30 WHERE "id" = $2;`,
        JSON.stringify(schedule),
        plan3.id
    )

    console.log('✅ Successfully seeded 1 Time, 2 Time, and 3 Time Meal Plans!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
