import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.admin.findFirst()
    if (!admin) {
        console.log('No admin found')
        return
    }
    console.log('Admin found:', admin.email)
    const isMatch = await bcrypt.compare('admin123', admin.password)
    console.log('Password "admin123" matches:', isMatch)

    // If it doesn't match, let's update it to ensure we can login
    if (!isMatch) {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        await prisma.admin.update({
            where: { id: admin.id },
            data: { password: hashedPassword }
        })
        console.log('Updated admin password to "admin123"')
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
