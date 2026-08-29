const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const items = await prisma.foodItem.findMany({ select: { id: true, name: true, image: true } });
    console.log('FoodItems total:', items.length);
    const withImgs = items.filter(i => i.image);
    console.log('FoodItems with images:', withImgs.length);
    if (withImgs.length > 0) {
        console.log('Sample food images:', withImgs.slice(0, 5));
    }
    const settings = await prisma.setting.findMany();
    console.log('Settings:', settings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
