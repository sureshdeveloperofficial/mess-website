const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const menuName = 'Breakfast'
    
    // Get all items from BREAK FAST category
    const breakfastItems = await prisma.foodItem.findMany({
        where: {
            category: {
                name: 'BREAK FAST'
            }
        }
    })

    if (breakfastItems.length === 0) {
        console.error('No breakfast items found. Please seed them first.')
        return
    }

    // Check if menu already exists
    let menu = await prisma.foodMenu.findFirst({
        where: { name: menuName }
    })

    if (!menu) {
        menu = await prisma.foodMenu.create({
            data: {
                name: menuName,
                description: 'Complete Breakfast Meal Plan',
                price: 0.0, // Default price
                availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                foodItems: {
                    connect: breakfastItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`✅ Created food menu: ${menuName} with ${breakfastItems.length} items.`)
    } else {
        // Update existing menu to include all items
        menu = await prisma.foodMenu.update({
            where: { id: menu.id },
            data: {
                foodItems: {
                    set: breakfastItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`ℹ️  Updated existing food menu: ${menuName} with ${breakfastItems.length} items.`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
