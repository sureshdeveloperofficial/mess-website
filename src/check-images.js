const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const items = await prisma.foodItem.findMany({
        select: {
            name: true,
            image: true
        },
        take: 20
    })
    console.log('Food Item Images Sample:', JSON.stringify(items, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
