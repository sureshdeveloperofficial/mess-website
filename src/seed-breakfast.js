const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categoryName = 'BREAK FAST'

    const breakfastItems = [
        'IDLI VADA - 2PS + 1 PS',
        'VADA - 3 PCS',
        'IDLY - 3 PS',
        'UPPUMAVU - KADALA',
        'PORATA - KADALA',
        'CHAPPATHI - KADALA',
        'EGG ROAST',
        'CHAPPATY - GREENPES',
        'PORATA - GREENPES',
        'BREEAD - EGG BOILED',
        'CHICKEN SANDWICH',
        'OMELETTE SANDWICH',
        'DOSA SET',
        'PUTTU - CHRUPAYER',
        'WHEAT PUTTU - PAPPADAM',
        'IDIYAPPAM - VEG',
        'POORI BHAJI',
        'CHAPPATY - BHAJI',
        'PORATA - BHAJI',
        'PUTTU - PAPPADAM',
        'PONGAL',
    ]

    // Find or create the BREAK FAST category
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

    // Seed each breakfast item
    for (const itemName of breakfastItems) {
        const existing = await prisma.foodItem.findFirst({
            where: { name: itemName }
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

    console.log('\n🎉 Breakfast seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
