import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import prisma from '@/utils/prisma'

// Function to get chromium on Vercel
async function getChromium() {
    try {
        // Dynamically import only in production environments
        if (process.env.NODE_ENV === 'production') {
            const req = eval('require')
            const chromium = req('@sparticuz/chromium')
            return {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            }
        }
        throw new Error('Local dev mode: using local Chrome executable')
    } catch {
        // Fallback for local development on Windows
        return {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true,
        }
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        // 1. Verify order exists
        const order = await prisma.order.findUnique({
            where: { id },
            include: { customer: true }
        })

        if (!order) {
            return new NextResponse('Order not found', { status: 404 })
        }

        // 2. Launch Puppeteer
        const chromium = await getChromium()
        const browser = await puppeteer.launch({
            executablePath: chromium.executablePath,
            headless: chromium.headless as any,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport as any
        })

        const page = await browser.newPage()

        // 3. Navigate to the dedicated print page
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:7691'
        await page.goto(`${baseUrl}/invoice/print/${id}`, {
            waitUntil: 'networkidle0'
        })

        // 4. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        })

        await browser.close()

        // 5. Return PDF Stream
        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Invoice_${order.id.slice(-8).toUpperCase()}.pdf"`
            }
        })

    } catch (error) {
        console.error('PUPPETEER_PDF_ERROR:', error)
        return new NextResponse('Failed to generate invoice', { status: 500 })
    }
}
