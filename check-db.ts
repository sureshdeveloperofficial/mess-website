import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prisma = new PrismaClient()

async function main() {
    const orders = await prisma.order.findMany({
        include: { customer: true }
    })
    fs.writeFileSync('db-out.json', JSON.stringify(orders.map(o => ({
        id: o.id,
        c_id: o.customerId,
        c_email: o.customer?.email,
        c_phone: o.customer?.phone
    })), null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
