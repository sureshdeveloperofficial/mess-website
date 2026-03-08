
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const id = 'cmmglveb90008hv1pauc6cxa7'
    try {
        const updated = await prisma.foodItem.update({
            where: { id },
            data: {
                monthlyPrice: 350
            },
            include: { category: true, options: true }
        })
        console.log('Update success:', updated.name, updated.monthlyPrice)
    } catch (err) {
        console.error('Update failed:', err.message)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
