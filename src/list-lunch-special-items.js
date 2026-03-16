const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const category = await prisma.category.findUnique({
        where: { name: 'LUNCH SP.' },
        include: { foodItems: true }
    })

    if (category) {
        console.log(`Category: ${category.name}`)
        console.log(`Item Count: ${category.foodItems.length}`)
        category.foodItems.forEach(item => {
            console.log(`- ${item.name} (ID: ${item.id})`)
        })
    } else {
        console.log('Category LUNCH SP. not found')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
