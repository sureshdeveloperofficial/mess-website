import { NextResponse } from 'next/server'
import { sendContactInquiryEmail } from '@/utils/mail'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, phone, subject, message } = body

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
        }

        if (!email.includes('@')) {
            return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
        }

        const result = await sendContactInquiryEmail({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : undefined,
            subject: subject ? subject.trim() : undefined,
            message: message.trim()
        })

        return NextResponse.json({
            success: true,
            message: "Your message has been sent successfully! We will contact you shortly.",
            result
        })
    } catch (error: any) {
        console.error('Contact Form Submission Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 })
    }
}
