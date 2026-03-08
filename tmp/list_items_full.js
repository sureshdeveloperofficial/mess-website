
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const items = await prisma.foodItem.findMany({
        include: { category: true }
    })
    items.forEach(i => {
        console.log(`- [${i.id}] ${i.name} (${i.category.name})`)
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
