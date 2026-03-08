import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const items = await prisma.foodItem.findMany()
    console.log(`Found ${items.length} items.`)
    for (const item of items) {
        console.log(`Item: ${item.name}, Price: ${item.price}, Monthly Price: ${item.monthlyPrice}`)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
