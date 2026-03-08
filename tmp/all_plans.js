
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const plans = await prisma.foodPlan.findMany()
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
