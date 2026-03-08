
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const plan = await prisma.foodPlan.findFirst({
        where: { name: 'SUNDAY - SPECIAL' },
        include: { foodItems: true }
    })
    console.log('Sunday Special Plan:', JSON.stringify(plan, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
