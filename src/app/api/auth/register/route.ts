import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
    try {
        const { name, email, phone, password, whatsappNo } = await req.json();

        if (!name || !phone || !password) {
            return NextResponse.json(
                { error: "Name, phone, and password are required" },
                { status: 400 }
            );
        }

        // Check if customer already exists by phone
        const existingCustomer = await prisma.customer.findUnique({
            where: { phone },
        });

        if (existingCustomer && existingCustomer.password) {
            return NextResponse.json(
                { error: "A customer with this phone number already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingCustomer) {
            // Update existing customer (who might have been created via guest order)
            const updatedCustomer = await prisma.customer.update({
                where: { phone },
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    whatsappNo,
                },
            });
            return NextResponse.json({
                message: "Customer registered successfully",
                user: { id: updatedCustomer.id, email: updatedCustomer.email, name: updatedCustomer.name },
            });
        }

        // Create new customer
        const newCustomer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                whatsappNo,
            },
        });

        return NextResponse.json({
            message: "Customer registered successfully",
            user: { id: newCustomer.id, email: newCustomer.email, name: newCustomer.name },
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
