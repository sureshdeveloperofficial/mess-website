import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const force = searchParams.get('force') === 'true'

        const adminExists = await prisma.admin.findFirst()

        if (adminExists && !force) {
            return NextResponse.json({ message: 'Admin already exists' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash('admin123', 10)

        if (adminExists && force) {
            await prisma.admin.update({
                where: { id: adminExists.id },
                data: { password: hashedPassword }
            })
            return NextResponse.json({ message: 'Admin password reset to admin123' })
        }

        const admin = await prisma.admin.create({
            data: {
                email: 'admin@chefs-kitchen.com',
                password: hashedPassword,
            },
        })

        return NextResponse.json({
            message: 'Admin created successfully',
            email: admin.email,
            password: 'admin123 (Please change this immediately!)',
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 })
    }
}
