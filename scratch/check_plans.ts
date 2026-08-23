import prisma from '../src/utils/prisma'

async function check() {
    const plans = await prisma.foodMenu.findMany({
        include: { foodItems: true }
    })
    const raw = await prisma.$queryRawUnsafe<any[]>(`SELECT id, name, "servingCount", "days" FROM "FoodMenu";`)
    console.log('Food plans in DB:', raw)
}

check().then(() => prisma.$disconnect())
