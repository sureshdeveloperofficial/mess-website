
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const items = await prisma.foodItem.findMany({
        where: {
            OR: [
                { name: { contains: 'Puttu', mode: 'insensitive' } },
                { name: { contains: 'Idli', mode: 'insensitive' } },
                { name: { contains: 'Vada', mode: 'insensitive' } },
                { name: { contains: 'Dosa', mode: 'insensitive' } },
                { name: { contains: 'Appam', mode: 'insensitive' } },
                { name: { contains: 'Breakfast', mode: 'insensitive' } }
            ]
        }
    })

    console.log('Breakfast-like items:', JSON.stringify(items.map(i => ({ id: i.id, name: i.name })), null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
