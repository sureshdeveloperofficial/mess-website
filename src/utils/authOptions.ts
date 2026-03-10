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

                // First, check Admin table
                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email }
                });

                if (admin) {
                    const isPasswordMatch = await bcrypt.compare(credentials.password, admin.password);
                    if (isPasswordMatch) {
                        return { id: admin.id, email: admin.email, name: "Admin", role: "admin" };
                    }
                }

                // If not Admin, check Customer table
                const customer = await prisma.customer.findUnique({
                    where: { email: credentials.email }
                });

                if (customer && customer.password) {
                    const isPasswordMatch = await bcrypt.compare(credentials.password, customer.password);
                    if (isPasswordMatch) {
                        return {
                            id: customer.id,
                            email: customer.email,
                            name: customer.name,
                            role: "user",
                            phone: customer.phone
                        };
                    }
                }

                throw new Error("Invalid email or password");
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.phone = (user as any).phone;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).phone = token.phone;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/signin",
    },
};
