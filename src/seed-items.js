const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const data = [
        { category: 'MOTA SET', items: ['FISH', 'CHICKEN', 'VEG'] },
        { category: 'BARIC SET', items: ['FISH', 'CHICKEN', 'VEG'] },
        { category: 'CHAPPATHI', items: ['FISH', 'CHICKEN', 'VEG'] },
        { category: 'BIRYANI', items: ['CHICKEN', 'BEEF', 'FISH', 'VEG', 'EGG'] },
        { category: 'GHEE RICE', items: ['CHICKEN', 'BEEF', 'FISH'] },
        { category: 'FRIED RICE', items: ['FRIED RICE'] }
    ]

    for (const group of data) {
        let category = await prisma.category.findUnique({
            where: { name: group.category }
        })

        if (!category) {
            category = await prisma.category.create({
                data: { name: group.category }
            })
            console.log(`Created category: ${group.category}`)
        }

        for (const itemName of group.items) {
            const fullName = group.category === 'FRIED RICE' ? itemName : `${group.category} - ${itemName}`

            const existing = await prisma.foodItem.findFirst({
                where: { name: fullName }
            })

            if (!existing) {
                await prisma.foodItem.create({
                    data: {
                        name: fullName,
                        price: 10.0, // Default price
                        description: `Delicious ${fullName}`,
                        categoryId: category.id
                    }
                })
                console.log(`Created item: ${fullName}`)
            } else {
                console.log(`Item already exists: ${fullName}`)
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
