const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const category = await prisma.category.findUnique({
        where: { name: 'DINNER' },
        include: { foodItems: true }
    })

    if (category) {
        console.log(`Category: ${category.name}`)
        console.log(`Item Count: ${category.foodItems.length}`)
        category.foodItems.forEach(item => {
            console.log(`- ${item.name} ($${item.price})`)
        })
    } else {
        console.log('Category DINNER not found')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
