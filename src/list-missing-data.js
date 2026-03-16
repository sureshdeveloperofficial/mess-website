const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const items = await prisma.foodItem.findMany({
        where: {
            OR: [
                { price: 0 },
                { image: null },
                { image: '' }
            ]
        },
        include: { category: true }
    })

    items.forEach(i => {
        console.log(`[${i.category.name}] ${i.name}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
