import { NextResponse } from 'next/server'
import { sendNewsletterWelcomeEmail } from '@/utils/mail'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email } = body

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
        }

        const result = await sendNewsletterWelcomeEmail(email.trim().toLowerCase())

        return NextResponse.json({
            success: true,
            message: 'Thank you for subscribing! A welcome email has been sent.',
            result
        })
    } catch (error: any) {
        console.error('Newsletter Signup Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to process subscription' }, { status: 500 })
    }
}
