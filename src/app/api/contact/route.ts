import { NextResponse } from 'next/server'
import { sendContactInquiryEmail } from '@/utils/mail'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            name,
            email,
            phone,
            subject,
            message,
            companyName,
            contactPerson,
            location,
            numberOfPeople,
            mealsPerDay,
            startDate,
            notes
        } = body

        const resolvedName = (contactPerson || name || '').trim()
        const resolvedEmail = (email || '').trim().toLowerCase()
        const resolvedPhone = (phone || '').trim()
        const resolvedMessage = (notes || message || '').trim()

        if (!resolvedName) {
            return NextResponse.json({ error: 'Contact person or full name is required.' }, { status: 400 })
        }

        if (!resolvedEmail || !resolvedEmail.includes('@')) {
            return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
        }

        if (!resolvedPhone) {
            return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
        }

        const result = await sendContactInquiryEmail({
            name: resolvedName,
            email: resolvedEmail,
            phone: resolvedPhone,
            subject: subject ? subject.trim() : (companyName ? `Corporate Plan Request - ${companyName}` : undefined),
            message: resolvedMessage || (companyName ? `Corporate Plan request for ${companyName} (${numberOfPeople || 'N/A'} people).` : 'Inquiry submission.'),
            companyName: companyName ? companyName.trim() : undefined,
            location: location ? location.trim() : undefined,
            numberOfPeople: numberOfPeople ? String(numberOfPeople).trim() : undefined,
            mealsPerDay: mealsPerDay ? String(mealsPerDay).trim() : undefined,
            startDate: startDate ? String(startDate).trim() : undefined
        })

        return NextResponse.json({
            success: true,
            message: "Your corporate meal plan request has been submitted successfully! We will get back to you shortly.",
            result
        })
    } catch (error: any) {
        console.error('Corporate / Contact Form Submission Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 })
    }
}
