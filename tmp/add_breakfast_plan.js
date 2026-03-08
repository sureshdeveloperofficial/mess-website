
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // 1. Ensure BREAKFAST category
    let breakfastCategory = await prisma.category.findFirst({
        where: { name: { equals: 'BREAKFAST', mode: 'insensitive' } }
    })

    if (!breakfastCategory) {
        breakfastCategory = await prisma.category.create({
            data: { name: 'BREAKFAST' }
        })
        console.log('Created Breakfast category')
    }

    // 2. Ensure BREAKFAST items
    const itemsToAdd = [
        { name: 'Soft Puttu & Kadala Curry', price: 6, monthlyPrice: 120, description: 'Traditional South Indian steamed rice cakes with spicy chickpea curry.', image: '/images/hero/idli-vada-with-sambar-chutney.jpg' },
        { name: 'Idli & Vada with Sambar', price: 6, monthlyPrice: 120, description: 'Soft steamed rice cakes and crispy lentil donuts served with sambar and chutney.', image: '/images/hero/idli-vada-with-sambar-chutney.jpg' },
        { name: 'Appam & Egg Roast', price: 8, monthlyPrice: 160, description: 'Lacy rice pancakes with a soft center, served with a spicy egg curry.', image: '/images/food/appetizer.png' },
        { name: 'Masala Dosa', price: 7, monthlyPrice: 140, description: 'Crispy rice crêpe filled with a spicy potato mash, served with coconut chutney.', image: '/images/food/appetizer.png' }
    ]

    const createdItemIds = []
    for (const item of itemsToAdd) {
        let foodItem = await prisma.foodItem.findFirst({
            where: { name: item.name }
        })
        if (!foodItem) {
            foodItem = await prisma.foodItem.create({
                data: {
                    ...item,
                    categoryId: breakfastCategory.id
                }
            })
            console.log(`Created item: ${item.name}`)
        }
        createdItemIds.push(foodItem.id)
    }

    // 3. Create BREAKFAST SPECIAL food plan
    let breakfastPlan = await prisma.foodPlan.findFirst({
        where: { name: 'BREAKFAST SPECIAL' }
    })

    if (!breakfastPlan) {
        breakfastPlan = await prisma.foodPlan.create({
            data: {
                name: 'BREAKFAST SPECIAL',
                description: 'Start your morning with our authentic, homestyle South Indian breakfast selection.',
                price: 180,
                foodItems: {
                    connect: createdItemIds.map(id => ({ id }))
                }
            },
            include: { foodItems: true }
        })
        console.log('Created BREAKFAST SPECIAL plan')
    } else {
        console.log('BREAKFAST SPECIAL plan already exists')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
