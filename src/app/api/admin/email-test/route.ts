import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'
import { sendTestEmail } from '@/utils/mail'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 })
        }

        const body = await req.json()
        const { testEmail } = body

        if (!testEmail || !testEmail.includes('@')) {
            return NextResponse.json({ error: 'Please provide a valid test recipient email address.' }, { status: 400 })
        }

        const result = await sendTestEmail(testEmail)
        return NextResponse.json({
            success: true,
            message: `Test email successfully sent to ${testEmail}!`,
            messageId: result.messageId
        })
    } catch (error: any) {
        console.error('SMTP Test Error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to connect to SMTP server. Please check your credentials.'
        }, { status: 500 })
    }
}
