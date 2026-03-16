const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categoryName = 'DINNER'

    const dinnerItems = [
        'CHANNA CURRY',
        'MIX VEG',
        'CHICKEN CURRY',
        'CHICKEN MASALA',
        'CHICKEN DRY FRY',
        'CHICKEN CHUKKA',
        'FISH CURRY',
        'BRIYANI - FISH',
        'BRIYANI - CHICKEN',
        'BRIYANI - BEEF',
        'GHEE RICE - CHICKEN',
        'GHEE RICE - BEEF',
        'CHICKEN ISHTU',
        'VEG ISHTU',
        'EGG CURRY ROAST',
        'MOTA SET - FISH',
        'MOTA SET - CHICKEN',
        'BARIC SET - FISH',
        'BARIC SET - CHICKEN',
        'BEEF CURRY',
        'CHICKEN FRY',
        'VEG BIRYANI',
        'ALOO CURRY',
        'DAL CURRY',
        'GREENPEAS CURRY',
        'PORATA',
        'CHAPPATHI',
        'DOSA',
        'PUTTU',
        'IDLY',
        'OROTTI',
    ]

    // Find or create the DINNER category
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

    // Seed each item under DINNER category
    for (const itemName of dinnerItems) {
        // Check if item already exists in THIS category
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
                    description: `Freshly prepared ${itemName}`,
                    categoryId: category.id
                }
            })
            console.log(`✅ Created item: ${itemName}`)
        } else {
            console.log(`⚠️  Item already exists in ${categoryName}: ${itemName}`)
        }
    }

    console.log('\n🎉 Dinner seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
