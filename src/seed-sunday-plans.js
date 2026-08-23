const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Sunday Special Plans Seeder...')

    // 1. Fetch available food items
    const allItems = await prisma.foodItem.findMany({
        include: { category: true }
    })

    const getItemsByNames = (names) => {
        return allItems.filter(i => 
            names.some(n => i.name.toLowerCase().includes(n.toLowerCase()))
        )
    }

    // Identify dishes for Breakfast, Lunch, and Dinner
    const breakfastDishes = getItemsByNames(['Appam', 'Porotta', 'Dosa', 'Idli', 'Breakfast'])
    const biryaniAndLunchDishes = getItemsByNames(['Biryani', 'Briyani', 'Ghee Rice', 'Sunday Special', 'Mota Set', 'Baric Set', 'Fried Rice'])
    const dinnerDishes = getItemsByNames(['Chappathi', 'Porotta', 'Dinner', 'Fish', 'Chicken'])

    // Fallbacks if lists are small
    const sundayLunchIds = (biryaniAndLunchDishes.length > 0 ? biryaniAndLunchDishes : allItems).map(i => i.id)
    const sundayBreakfastIds = (breakfastDishes.length > 0 ? breakfastDishes : allItems).map(i => i.id)
    const sundayDinnerIds = (dinnerDishes.length > 0 ? dinnerDishes : allItems).map(i => i.id)

    // Combined unique dish pool for Sunday plans
    const allSundayDishIds = Array.from(new Set([...sundayBreakfastIds, ...sundayLunchIds, ...sundayDinnerIds]))

    // Find meal types
    const mealTypes = await prisma.mealType.findMany()
    const breakfastMt = mealTypes.find(m => m.name.toLowerCase().includes('break')) || mealTypes[0]
    const lunchMt = mealTypes.find(m => m.name.toLowerCase().includes('lunch')) || mealTypes[1] || mealTypes[0]
    const dinnerMt = mealTypes.find(m => m.name.toLowerCase().includes('dinner')) || mealTypes[2] || mealTypes[0]

    // Construct scheduleJson objects
    const schedule1Time = {
        Sunday: {
            [breakfastMt?.id || 'breakfast']: sundayLunchIds,
            [lunchMt?.id || 'lunch']: sundayLunchIds,
            [dinnerMt?.id || 'dinner']: sundayLunchIds,
            lunch: sundayLunchIds,
            breakfast: sundayBreakfastIds,
            dinner: sundayDinnerIds
        },
        features: [
            'Choose Any 1 Sunday Meal (Biryani / Feast Special)',
            'Special Kerala Dum Biryani (Chicken / Beef / Fish)',
            'Ghee Rice with Chicken/Beef Roast Options',
            'Hot doorstep delivery to your flat/room every Sunday',
            'Valid for 4 consecutive Sundays (1 Month Pass)'
        ],
        isPopular: false,
        badgeText: 'Sunday Special'
    }

    const schedule2Time = {
        Sunday: {
            [breakfastMt?.id || 'breakfast']: sundayBreakfastIds,
            [lunchMt?.id || 'lunch']: sundayLunchIds,
            [dinnerMt?.id || 'dinner']: sundayDinnerIds,
            lunch: sundayLunchIds,
            breakfast: sundayBreakfastIds,
            dinner: sundayDinnerIds
        },
        features: [
            'Choose Any 2 Sunday Meals (e.g. Lunch Feast + Dinner)',
            'Authentic Biryani / Ghee Rice Feast for Lunch',
            'Hot Porotta / Chappathi with Roast for Dinner',
            'Free doorstep delivery for both Sunday meal times',
            'Valid for 4 consecutive Sundays (1 Month Pass)'
        ],
        isPopular: true,
        badgeText: 'Sunday Feast Pass'
    }

    const schedule3Time = {
        Sunday: {
            [breakfastMt?.id || 'breakfast']: sundayBreakfastIds,
            [lunchMt?.id || 'lunch']: sundayLunchIds,
            [dinnerMt?.id || 'dinner']: sundayDinnerIds,
            lunch: sundayLunchIds,
            breakfast: sundayBreakfastIds,
            dinner: sundayDinnerIds
        },
        features: [
            'Full Sunday Package: All 3 Meals Included',
            'Kerala Traditional Breakfast (Appam / Dosa / Idli / Porotta)',
            'Grand Sunday Special Biryani Feast for Lunch',
            'Special Sunday Dinner (Chappathi / Porotta with Roast)',
            'Valid for 4 consecutive Sundays (1 Month Pass)'
        ],
        isPopular: false,
        badgeText: 'Full Sunday Pass'
    }

    const sundayPlans = [
        {
            name: 'Sunday Special 1 Time Plan',
            description: 'Weekly Sunday special single meal package. Choose your favorite Sunday Special Biryani or Chef Feast.',
            price: 120.00,
            days: 30,
            servingCount: 1,
            availableDays: ['Sunday'],
            scheduleJson: schedule1Time,
            mealTypeId: lunchMt?.id || null,
            dishIds: sundayLunchIds
        },
        {
            name: 'Sunday Special 2 Time Plan',
            description: 'Two special Sunday meals (e.g. Lunch Biryani Feast + Evening Dinner). Perfect for relaxed weekends.',
            price: 180.00,
            days: 30,
            servingCount: 2,
            availableDays: ['Sunday'],
            scheduleJson: schedule2Time,
            mealTypeId: lunchMt?.id || null,
            dishIds: allSundayDishIds
        },
        {
            name: 'Sunday Special 3 Time Plan',
            description: 'Complete Sunday 3-meal subscription: Authentic breakfast, grand lunchtime Biryani feast, and delicious dinner.',
            price: 240.00,
            days: 30,
            servingCount: 3,
            availableDays: ['Sunday'],
            scheduleJson: schedule3Time,
            mealTypeId: lunchMt?.id || null,
            dishIds: allSundayDishIds
        }
    ]

    for (const plan of sundayPlans) {
        let existing = await prisma.foodMenu.findFirst({
            where: { name: plan.name }
        })

        if (!existing) {
            existing = await prisma.foodMenu.create({
                data: {
                    name: plan.name,
                    description: plan.description,
                    price: plan.price,
                    days: plan.days,
                    servingCount: plan.servingCount,
                    isActive: true,
                    availableDays: plan.availableDays,
                    foodItems: {
                        connect: plan.dishIds.map(id => ({ id }))
                    }
                }
            })
            console.log(`✅ Created Sunday Plan: "${plan.name}" (Price: AED ${plan.price}, Servings: ${plan.servingCount})`)
        } else {
            existing = await prisma.foodMenu.update({
                where: { id: existing.id },
                data: {
                    description: plan.description,
                    price: plan.price,
                    days: plan.days,
                    servingCount: plan.servingCount,
                    isActive: true,
                    availableDays: plan.availableDays,
                    foodItems: {
                        set: plan.dishIds.map(id => ({ id }))
                    }
                }
            })
            console.log(`ℹ️ Updated Sunday Plan: "${plan.name}"`)
        }

        // Update raw columns (mealTypeId, scheduleJson)
        await prisma.$executeRawUnsafe(
            `UPDATE "FoodMenu" SET "mealTypeId" = $1, "scheduleJson" = $2::jsonb, "days" = $3, "servingCount" = $4 WHERE "id" = $5;`,
            plan.mealTypeId,
            JSON.stringify(plan.scheduleJson),
            plan.days,
            plan.servingCount,
            existing.id
        )
    }

    console.log('🎉 Sunday Special Plans Seeder finished successfully!')
}

main()
    .catch((e) => {
        console.error('Error seeding Sunday plans:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
