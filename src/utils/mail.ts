import nodemailer from 'nodemailer'
import prisma from '@/utils/prisma'

export interface MailConfig {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
    fromName: string
    fromEmail: string
    adminEmail: string
}

/**
 * Fetch dynamic mail settings from Database with environment variable fallbacks
 */
export async function getMailConfig(): Promise<MailConfig> {
    let settingsMap: Record<string, string> = {}
    try {
        const settings = await prisma.setting.findMany({
            where: {
                key: {
                    in: [
                        'smtp_host',
                        'smtp_port',
                        'smtp_secure',
                        'smtp_user',
                        'smtp_pass',
                        'smtp_from_name',
                        'smtp_from_email',
                        'admin_notification_email',
                        'restaurant_name',
                        'contact_email'
                    ]
                }
            }
        })
        settings.forEach((s) => {
            settingsMap[s.key] = s.value
        })
    } catch (e) {
        console.warn('⚠️ Could not load email settings from DB, using env fallback:', e)
    }

    const host = settingsMap['smtp_host'] || process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = Number(settingsMap['smtp_port'] || process.env.SMTP_PORT || 465)
    const secure = settingsMap['smtp_secure'] ? settingsMap['smtp_secure'] === 'true' : (port === 465)
    const user = settingsMap['smtp_user'] || process.env.SMTP_USER || ''
    const pass = settingsMap['smtp_pass'] || process.env.SMTP_PASS || ''
    let fromName = settingsMap['smtp_from_name'] || settingsMap['restaurant_name'] || process.env.SMTP_FROM_NAME || 'PREMIUM MESS'
    if (fromName.toLowerCase().includes('shamil')) {
        fromName = 'PREMIUM MESS'
    }
    const fromEmail = settingsMap['smtp_from_email'] || settingsMap['contact_email'] || process.env.SMTP_FROM_EMAIL || user || 'contact@chefs-kitchen.com'
    const adminEmail = settingsMap['admin_notification_email'] || settingsMap['contact_email'] || process.env.ADMIN_NOTIFICATION_EMAIL || 'contact@chefs-kitchen.com'

    return {
        host,
        port,
        secure,
        user,
        pass,
        fromName,
        fromEmail,
        adminEmail
    }
}

/**
 * Create a configured Nodemailer Transporter
 */
export async function getMailTransporter() {
    const config = await getMailConfig()

    if (!config.user || !config.pass) {
        console.warn('⚠️ SMTP credentials not fully configured. Email dispatch will be simulated in console.')
        return {
            isConfigured: false,
            config,
            transporter: null
        }
    }

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    return {
        isConfigured: true,
        config,
        transporter
    }
}

/**
 * Send a Test Email to verify SMTP configuration
 */
export async function sendTestEmail(recipientEmail: string) {
    const { isConfigured, config, transporter } = await getMailTransporter()

    if (!isConfigured || !transporter) {
        throw new Error('SMTP credentials are missing. Please enter your SMTP Username & Password first.')
    }

    // Verify SMTP connection
    await transporter.verify()

    const mailOptions = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: recipientEmail,
        subject: `[Test] Email Configuration Verified - ${config.fromName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #eee;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #df6853; margin: 0;">🎉 SMTP Connection Successful!</h2>
                    <p style="color: #666; font-size: 14px;">Your centralized email settings are working perfectly.</p>
                </div>
                <div style="background: #fdf2f0; padding: 20px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; color: #444;">
                    <p style="margin: 4px 0;"><strong>SMTP Host:</strong> ${config.host}</p>
                    <p style="margin: 4px 0;"><strong>SMTP Port:</strong> ${config.port} (${config.secure ? 'SSL/TLS' : 'STARTTLS'})</p>
                    <p style="margin: 4px 0;"><strong>Sender:</strong> ${config.fromName} &lt;${config.fromEmail}&gt;</p>
                    <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p style="color: #888; font-size: 12px; text-align: center;">This is an automated test message dispatched from your Admin Panel.</p>
            </div>
        `
    }

    return transporter.sendMail(mailOptions)
}

/**
 * Send Welcome Newsletter Email to a new subscriber
 */
export async function sendNewsletterWelcomeEmail(subscriberEmail: string) {
    const { isConfigured, config, transporter } = await getMailTransporter()

    if (!isConfigured || !transporter) {
        console.log(`[Dev Simulation] Newsletter welcome email to: ${subscriberEmail}`)
        return { simulated: true }
    }

    const mailOptions = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: subscriberEmail,
        subject: `Welcome to ${config.fromName} — Exclusive Updates & Menus! 🍽️`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 30px; border-radius: 20px; border: 1px solid #f0f0f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; background: #df6853; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 14px; font-size: 24px;">🍲</div>
                    <h1 style="color: #2b2b2b; font-size: 24px; font-weight: 800; margin: 16px 0 6px 0;">Welcome to ${config.fromName}!</h1>
                    <p style="color: #777; font-size: 15px; margin: 0;">Thank you for subscribing to our food newsletter.</p>
                </div>

                <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
                    <h3 style="color: #df6853; margin: 0 0 12px 0; font-size: 16px;">What you will receive:</h3>
                    <ul style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>✨ Weekly rotating breakfast, lunch, and dinner menus</li>
                        <li>🎁 Exclusive monthly meal plan discounts and festive specials</li>
                        <li>📅 Important delivery schedule updates and Sunday feast menus</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/plans" style="display: inline-block; background: #df6853; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 50px; box-shadow: 0 4px 15px rgba(223, 104, 83, 0.3);">
                        Explore Meal Plans
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                
                <p style="color: #999; font-size: 12px; text-align: center; line-height: 1.5; margin: 0;">
                    © ${new Date().getFullYear()} ${config.fromName}. All rights reserved.<br/>
                    Al Nahda & Deira, Dubai, United Arab Emirates
                </p>
            </div>
        `
    }

    return transporter.sendMail(mailOptions)
}

/**
 * Send Contact Inquiry notification to Admin + Acknowledgment to Customer
 */
export async function sendContactInquiryEmail(data: {
    name: string
    email: string
    phone?: string
    subject?: string
    message: string
}) {
    const { isConfigured, config, transporter } = await getMailTransporter()

    if (!isConfigured || !transporter) {
        console.log(`[Dev Simulation] Contact form submission:`, data)
        return { simulated: true }
    }

    // 1. Send Notification to Admin
    const adminMailOptions = {
        from: `"${config.fromName} Contact Form" <${config.fromEmail}>`,
        to: config.adminEmail,
        replyTo: data.email,
        subject: `📬 New Customer Inquiry from ${data.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #eee;">
                <h2 style="color: #df6853; margin-top: 0;">New Contact Form Message</h2>
                <div style="background: #f8f9fa; padding: 18px; border-radius: 12px; margin-bottom: 20px; font-size: 14px;">
                    <p style="margin: 6px 0;"><strong>Name:</strong> ${data.name}</p>
                    <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                    <p style="margin: 6px 0;"><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
                    <p style="margin: 6px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div style="background: #ffffff; border: 1px solid #eee; padding: 18px; border-radius: 12px;">
                    <p style="margin: 0; font-weight: bold; color: #444; margin-bottom: 8px;">Message:</p>
                    <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                </div>
            </div>
        `
    }

    // 2. Send Acknowledgment to Customer
    const customerMailOptions = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: data.email,
        subject: `We've received your message — ${config.fromName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #eee;">
                <h2 style="color: #df6853; margin-top: 0;">Hi ${data.name},</h2>
                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                    Thank you for reaching out to <strong>${config.fromName}</strong>! We have received your inquiry and our team will get back to you as soon as possible.
                </p>
                <div style="background: #fdf2f0; padding: 16px; border-radius: 12px; margin: 20px 0; font-size: 13px; color: #666;">
                    <p style="margin: 0 0 6px 0; font-weight: bold; color: #df6853;">Your Inquiry Summary:</p>
                    <p style="margin: 0; font-style: italic;">"${data.message}"</p>
                </div>
                <p style="color: #777; font-size: 13px;">If you have urgent questions regarding meals or delivery, please feel free to call us at <strong>+971 4 264 2613</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} ${config.fromName}</p>
            </div>
        `
    }

    await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(customerMailOptions)
    ])

    return { success: true }
}

/**
 * Send Order Receipt and Confirmation Email to Customer
 */
export async function sendOrderConfirmationEmail(order: any) {
    const { isConfigured, config, transporter } = await getMailTransporter()

    const customerEmail = order.customer?.email || order.customerEmail

    if (!customerEmail) {
        console.warn('⚠️ No customer email found for order confirmation dispatch.')
        return { error: 'No email' }
    }

    if (!isConfigured || !transporter) {
        console.log(`[Dev Simulation] Order confirmation email for Order #${order.id} to ${customerEmail}`)
        return { simulated: true }
    }

    const mailOptions = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: customerEmail,
        subject: `Order Confirmed! #${order.id.slice(-6).toUpperCase()} — ${config.fromName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #eee;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #df6853; margin: 0; font-size: 24px;">Order Confirmed!</h1>
                    <p style="color: #666; font-size: 14px;">Order ID: #${order.id}</p>
                </div>

                <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin-bottom: 24px; font-size: 14px;">
                    <p style="margin: 4px 0;"><strong>Customer:</strong> ${order.customer?.name || 'Valued Guest'}</p>
                    <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${order.address || 'Standard Location'}</p>
                    <p style="margin: 4px 0;"><strong>Building / Room:</strong> ${order.buildingName || ''} ${order.flatRoomNumber ? '- Room ' + order.flatRoomNumber : ''}</p>
                    <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'COD'}</p>
                    <p style="margin: 4px 0;"><strong>Total Amount:</strong> <span style="color: #df6853; font-weight: bold;">AED ${Number(order.totalAmount || 0).toFixed(2)}</span></p>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/my-orders/${order.id}" style="display: inline-block; background: #df6853; color: white; padding: 12px 28px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 14px;">
                        View Invoice & Meal Schedule
                    </a>
                </div>
            </div>
        `
    }

    return transporter.sendMail(mailOptions)
}
