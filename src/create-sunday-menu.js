const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const menuName = 'Sunday Special'
    
    // Get all items from SUNDAY - SPECIAL category
    const sundayItems = await prisma.foodItem.findMany({
        where: {
            category: {
                name: 'SUNDAY - SPECIAL'
            }
        }
    })

    if (sundayItems.length === 0) {
        console.error('No Sunday Special items found. Please seed them first.')
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
                description: 'Special Weekly Sunday Meal Plan',
                price: 0.0, // Default price
                availableDays: ["Sunday"], // Only Sunday
                foodItems: {
                    connect: sundayItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`✅ Created food menu: ${menuName} with ${sundayItems.length} items.`)
    } else {
        // Update existing menu to include all items and set available days
        menu = await prisma.foodMenu.update({
            where: { id: menu.id },
            data: {
                availableDays: ["Sunday"],
                foodItems: {
                    set: sundayItems.map(item => ({ id: item.id }))
                }
            }
        })
        console.log(`ℹ️  Updated existing food menu: ${menuName} with ${sundayItems.length} items.`)
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
