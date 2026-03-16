const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const menuName = 'Dinner Special'
    
    // Get all items from DINNER category
    const dinnerItems = await prisma.foodItem.findMany({
        where: {
            category: {
                name: 'DINNER'
            }
        }
    })

    if (dinnerItems.length === 0) {
        console.error('No dinner items found. Please seed them first.')
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
                description: 'Variety of Special Dinner Meals',
                price: 0.0, // Default price
                availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                foodItems: {
                    connect: dinnerItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`✅ Created food menu: ${menuName} with ${dinnerItems.length} items.`)
    } else {
        // Update existing menu to include all items
        menu = await prisma.foodMenu.update({
            where: { id: menu.id },
            data: {
                foodItems: {
                    set: dinnerItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`ℹ️  Updated existing food menu: ${menuName} with ${dinnerItems.length} items.`)
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
