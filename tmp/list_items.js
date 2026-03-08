
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const items = await prisma.foodItem.findMany({
        include: { category: true }
    })
    console.log('Items:', items.map(i => ({ id: i.id, name: i.name, cat: i.category.name })))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
