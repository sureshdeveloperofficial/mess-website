const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categoryName = 'SUNDAY - SPECIAL'

    const sundayItems = [
        'CHICKEN - DRY FRY',
        'CHICKEN - CHUKKA',
        'CHICKEN - MASALA',
        'CHICKEN - ISHTU',
        'FISH - MASALA',
        'FISH - CURRY',
        'BRIYANI - FISH',
        'BRIYANI - CHICKEN',
        'BRIYANI - BEEF',
        'GHEE RICE - CHICKEN',
        'GHEE RICE - BEEF',
        'GHEE RICE - FISH',
    ]

    // Find or create the SUNDAY - SPECIAL category
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

    // Seed each item under SUNDAY - SPECIAL category
    for (const itemName of sundayItems) {
        const existing = await prisma.foodItem.findFirst({
            where: { 
                name: itemName,
                categoryId: category.id
            }
        })

        if (!existing) {
            await prisma.foodItem.create({
                data: {
                    name: itemName,
                    price: 0.0,
                    description: `Special Sunday Dish: ${itemName}`,
                    categoryId: category.id
                }
            })
            console.log(`✅ Created item: ${itemName}`)
        } else {
            console.log(`⚠️  Item already exists in ${categoryName}: ${itemName}`)
        }
    }

    console.log('\n🎉 Sunday Special seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
