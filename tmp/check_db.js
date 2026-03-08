
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categories = await prisma.category.findMany()
    const items = await prisma.foodItem.findMany({ include: { category: true } })
    const plans = await prisma.foodPlan.findMany()

    console.log('Categories:', JSON.stringify(categories, null, 2))
    console.log('Items:', JSON.stringify(items, null, 2))
    console.log('Plans:', JSON.stringify(plans, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
