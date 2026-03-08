const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const items = await prisma.foodItem.findMany()
    console.log(`Updating ${items.length} items...`)

    for (const item of items) {
        // Set monthly price to price * 25 (standard mess logic)
        const monthlyPrice = Math.round(item.price * 25)
        // Using raw update to bypass potentially outdated types
        await prisma.$executeRawUnsafe(
            `UPDATE "FoodItem" SET "monthlyPrice" = ${monthlyPrice} WHERE id = '${item.id}'`
        )
        console.log(`Updated ${item.name}: Daily $${item.price} -> Monthly $${monthlyPrice}`)
    }

    console.log('Bulk update completed.')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
