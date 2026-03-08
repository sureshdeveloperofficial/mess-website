
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categories = await prisma.category.findMany()
    const plans = await prisma.foodPlan.findMany()

    console.log('Categories:', categories.map(c => c.name))
    console.log('Plans:', plans.map(p => p.name))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
