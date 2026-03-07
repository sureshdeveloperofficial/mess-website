const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const plans = await prisma.foodPlan.findMany()
        console.log('FoodPlan table exists. Count:', plans.length)
    } catch (err) {
        console.error('Error accessing FoodPlan table:', err.message)
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
