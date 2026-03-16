const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categoryName = 'LUNCH SP.'

    const lunchItems = [
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
        'FRIED RICE',
    ]

    // Find or create the LUNCH SP. category
    let category = await prisma.category.findUnique({
        where: { name: categoryName }
    })

    if (!category) {
        category = await prisma.category.create({
            data: { name: categoryName }
        })
        console.log(`✅ Created category: ${categoryName}`)
    } else {
        console.log(`ℹ️  Category already exists: ${categoryName}`)
    }

    // Seed each item under LUNCH SP. category
    for (const itemName of lunchItems) {
        const existing = await prisma.foodItem.findFirst({
            where: { name: itemName, categoryId: category.id }
        })

        if (!existing) {
            await prisma.foodItem.create({
                data: {
                    name: itemName,
                    price: 0.0,
                    description: `Freshly prepared ${itemName}`,
                    categoryId: category.id
                }
            })
            console.log(`✅ Created item: ${itemName}`)
        } else {
            console.log(`⚠️  Item already exists: ${itemName}`)
        }
    }

    console.log('\n🎉 Lunch SP. seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
