const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const itemNames = [
        'MOTA SET - FISH',
        'MOTA SET - CHICKEN',
        'MOTA SET - VEG',
        'BARIC SET - FISH',
        'BARIC SET - CHICKEN',
        'BARIC SET - VEG',
        'CHAPPATHI - FISH',
        'CHAPPATHI - CHICKEN',
        'CHAPPATHI - VEG',
        'BIRYANI - CHICKEN',
        'BIRYANI - BEEF',
        'BIRYANI - FISH',
        'BIRYANI - VEG',
        'BIRYANI - EGG',
        'GHEE RICE - CHICKEN',
        'GHEE RICE - BEEF',
        'GHEE RICE - FISH',
        'FRIED RICE'
    ]

    // Find all food items by name
    const foodItems = await prisma.foodItem.findMany({
        where: {
            name: { in: itemNames }
        }
    })

    if (foodItems.length === 0) {
        console.error('No matching food items found. Please ensure items are added first.')
        return
    }

    // Create the Lunch Special food plan
    const lunchSpecial = await prisma.foodPlan.create({
        data: {
            name: 'LUNCH SPECIAL',
            price: 250.0, // Default price
            description: 'A comprehensive lunch bundle featuring a variety of sets, biryanis, and ghee rice options.',
            foodItems: {
                connect: foodItems.map(item => ({ id: item.id }))
            }
        }
    })

    console.log(`Successfully created "LUNCH SPECIAL" with ${foodItems.length} items.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
