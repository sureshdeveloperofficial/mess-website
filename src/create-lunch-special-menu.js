const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const menuName = 'Lunch Special'
    
    // Get all items from LUNCH SP. category
    const lunchItems = await prisma.foodItem.findMany({
        where: {
            category: {
                name: 'LUNCH SP.'
            }
        }
    })

    if (lunchItems.length === 0) {
        console.error('No lunch special items found. Please seed them first.')
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
                description: 'Variety of Special Lunch Meals',
                price: 0.0, // Default price
                availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                foodItems: {
                    connect: lunchItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`✅ Created food menu: ${menuName} with ${lunchItems.length} items.`)
    } else {
        // Update existing menu to include all items
        menu = await prisma.foodMenu.update({
            where: { id: menu.id },
            data: {
                foodItems: {
                    set: lunchItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`ℹ️  Updated existing food menu: ${menuName} with ${lunchItems.length} items.`)
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
