
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function main() {
  const items = await prisma.foodItem.findMany({
    include: { category: true }
  })
  const output = items.map(i => `- [${i.id}] ${i.name} (${i.category.name})`).join('\n')
  fs.writeFileSync('tmp/item_list.txt', output)
  console.log('Results written to tmp/item_list.txt')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
