const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Checking Setting model...')
    const settings = await prisma.setting.findMany()
    console.log('Settings found:', settings)
  } catch (error) {
    console.error('Error in diagnostic:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
