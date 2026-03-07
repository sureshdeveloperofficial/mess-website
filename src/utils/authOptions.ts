import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }
                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email }
                });
                if (!admin) {
                    throw new Error("Invalid credentials");
                }
                // @ts-ignore
                const isPasswordMatch = await bcrypt.compare(credentials.password, admin.password);
                if (!isPasswordMatch) {
                    throw new Error("Invalid credentials");
                }
                return { id: admin.id, email: admin.email };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/admin-login",
    },
};
