'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const [copiedField, setCopiedField] = useState<string | null>(null)

    useEffect(() => {
        // Clear local storage order cache
        localStorage.removeItem('order_selection')
        localStorage.removeItem('checkout_form_data')
    }, [])

    // Fetch order details if orderId is provided
    const { data: order } = useQuery({
        queryKey: ['order-success-details', orderId],
        queryFn: async () => {
            if (!orderId) return null
            const res = await axios.get(`/api/orders/${orderId}`)
            return res.data
        },
        enabled: Boolean(orderId),
        staleTime: 1000 * 60 * 5,
    })

    // Fetch live bank transfer and website configuration settings
    const { data: siteSettings } = useQuery<Record<string, string>>({
        queryKey: ['site-settings'],
        queryFn: async () => {
            const response = await axios.get('/api/settings')
            return response.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const handleCopyText = (text: string, fieldName: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedField(fieldName)
        toast.success(`Copied ${fieldName} to clipboard!`, { icon: '📋' })
        setTimeout(() => setCopiedField(null), 2500)
    }

    const isBankTransfer = order?.paymentMethod === 'BANK_TRANSFER'
    const cleanWhatsAppNumber = (siteSettings?.whatsapp_number || siteSettings?.contact_phone || '+971501234567').replace(/[^0-9]/g, '')
    const orderRefCode = order?.id ? order.id.slice(-6).toUpperCase() : ''
    const shareMessage = `Hello Al Shamil Mess, I have placed Order #${orderRefCode} for AED ${order?.totalAmount || ''} via Bank Transfer. Here is my payment transfer receipt:`
    const whatsappShareUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(shareMessage)}`

    return (
        <main className='min-h-screen pt-32 pb-48 bg-[#FFFBF7] flex items-center justify-center px-4 sm:px-6 selection:bg-primary/20'>
            <div className='max-w-2xl w-full text-center'>
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    className='w-24 h-24 sm:w-28 sm:h-28 bg-primary rounded-3xl flex items-center justify-center text-grey-dark mx-auto mb-6 shadow-xl shadow-primary/20'
                >
                    <Icon icon='solar:check-circle-bold' className='text-5xl sm:text-6xl' />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <span className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold mb-3 border border-emerald-500/20'>
                        <Icon icon='solar:verified-check-bold' />
                        <span>Order Successfully Placed</span>
                    </span>

                    <h1 className='text-3xl sm:text-5xl font-black text-grey-dark tracking-tight mb-3'>
                        Thank You For Ordering!
                    </h1>

                    <p className='text-grey-muted text-sm sm:text-base font-normal max-w-lg mx-auto mb-8 leading-relaxed'>
                        We have received your meal plan subscription. Your daily meals will start from{' '}
                        <strong className='text-grey-dark font-semibold'>
                            {order?.startDate ? new Date(order.startDate).toLocaleDateString() : 'your selected start date'}
                        </strong>.
                    </p>

                    {/* Order Reference Badge */}
                    {order && (
                        <div className='mb-6 p-4 rounded-2xl bg-white border border-grey/10 shadow-xs flex items-center justify-between text-xs font-semibold text-grey-dark'>
                            <div className='flex items-center gap-2'>
                                <Icon icon='solar:bill-list-bold-duotone' className='text-primary text-lg' />
                                <span>Order Ref: <strong className='font-mono'>#{orderRefCode}</strong></span>
                            </div>
                            <div className='flex items-center gap-1.5 text-primary'>
                                <span>Total:</span>
                                <span className='text-sm font-bold text-grey-dark'>AED {order.totalAmount}</span>
                            </div>
                        </div>
                    )}

                    {/* Bank Transfer Voucher (If Bank Transfer Chosen) */}
                    {isBankTransfer ? (
                        <div className='bg-gradient-to-b from-[#1C1D22] to-[#25262E] text-white p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl space-y-5 mb-8 text-left'>
                            <div className='flex items-center justify-between border-b border-white/10 pb-3'>
                                <div className='flex items-center gap-2.5'>
                                    <Icon icon='solar:card-2-bold-duotone' className='text-2xl text-[#f3ba2f]' />
                                    <div>
                                        <h3 className='font-bold text-sm text-white'>
                                            Official Bank Transfer Details
                                        </h3>
                                        <p className='text-[10px] text-white/50'>
                                            Transfer total amount to the account below
                                        </p>
                                    </div>
                                </div>
                                <span className='text-[10px] font-mono tracking-wider font-bold px-2 py-0.5 rounded-md bg-[#f3ba2f]/10 text-[#f3ba2f] border border-[#f3ba2f]/30'>
                                    {siteSettings?.bank_name || 'Emirates NBD'}
                                </span>
                            </div>

                            {/* Account Credentials */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
                                <div>
                                    <span className='text-[9px] uppercase tracking-wider text-white/50 block mb-0.5'>
                                        Beneficiary / Account Name
                                    </span>
                                    <span className='font-semibold text-white/95'>
                                        {siteSettings?.account_name || 'Al Shamil Mess Services LLC'}
                                    </span>
                                </div>
                                <div>
                                    <span className='text-[9px] uppercase tracking-wider text-white/50 block mb-0.5'>
                                        Bank Name
                                    </span>
                                    <span className='font-semibold text-white/95'>
                                        {siteSettings?.bank_name || 'Emirates NBD'}
                                    </span>
                                </div>
                            </div>

                            {/* IBAN Number with 1-click Copy */}
                            <div className='p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1.5'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-[9px] font-bold uppercase tracking-wider text-white/50'>
                                        Official UAE IBAN
                                    </span>
                                    <button
                                        type='button'
                                        onClick={() => handleCopyText(siteSettings?.iban_number || 'AE12 0310 0000 1012 3456 7890', 'IBAN')}
                                        className='text-[11px] font-bold text-[#f3ba2f] hover:text-[#f3ba2f]/80 flex items-center gap-1 transition-all cursor-pointer'
                                    >
                                        <Icon icon={copiedField === 'IBAN' ? 'solar:check-circle-bold' : 'solar:copy-bold-duotone'} />
                                        <span>{copiedField === 'IBAN' ? 'Copied' : 'Copy IBAN'}</span>
                                    </button>
                                </div>
                                <p className='font-mono font-bold text-xs sm:text-sm text-[#f3ba2f] tracking-wider break-all select-all'>
                                    {siteSettings?.iban_number || 'AE12 0310 0000 1012 3456 7890'}
                                </p>
                            </div>

                            {/* Account Number & SWIFT */}
                            <div className='grid grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs'>
                                <div>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-[9px] uppercase tracking-wider text-white/50'>Account Number</span>
                                        <button
                                            type='button'
                                            onClick={() => handleCopyText(siteSettings?.account_number || '101234567890', 'Account Number')}
                                            className='text-[9px] text-white/70 hover:text-white flex items-center gap-0.5 cursor-pointer'
                                        >
                                            <Icon icon={copiedField === 'Account Number' ? 'solar:check-circle-bold' : 'solar:copy-bold'} />
                                        </button>
                                    </div>
                                    <span className='font-mono font-semibold text-white/95'>
                                        {siteSettings?.account_number || '101234567890'}
                                    </span>
                                </div>
                                <div className='text-right'>
                                    <span className='text-[9px] uppercase tracking-wider text-white/50 block'>SWIFT / BIC Code</span>
                                    <span className='font-mono font-semibold text-white/95'>
                                        {siteSettings?.swift_code || 'EBILAEADXXX'}
                                    </span>
                                </div>
                            </div>

                            {/* WhatsApp Receipt CTA Button */}
                            <div className='pt-2'>
                                <a
                                    href={whatsappShareUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer'
                                >
                                    <Icon icon='logos:whatsapp-icon' className='text-lg' />
                                    <span>Send Transfer Screenshot on WhatsApp</span>
                                </a>
                                <p className='text-[10px] text-white/40 text-center mt-2'>
                                    {siteSettings?.whatsapp_instruction ||
                                        'Please share your transfer confirmation receipt screenshot on WhatsApp to instantly activate your meals.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Standard COD Next Steps */
                        <div className='bg-white rounded-3xl p-6 sm:p-7 border border-grey/10 mb-8 shadow-sm'>
                            <div className='flex items-center gap-4 text-left'>
                                <div className='w-12 h-12 bg-primary/20 text-grey-dark rounded-2xl flex items-center justify-center shrink-0 shadow-xs'>
                                    <Icon icon='solar:hand-money-bold-duotone' className='text-2xl text-grey-dark' />
                                </div>
                                <div>
                                    <p className='text-[10px] font-bold text-grey-muted uppercase tracking-wider mb-0.5'>
                                        Payment Method: Cash On Delivery
                                    </p>
                                    <p className='text-grey-dark font-semibold text-sm'>
                                        Our delivery team will collect cash payment on the first day of meal delivery.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link
                            href='/'
                            className='px-8 py-3.5 bg-grey-dark text-white rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2'
                        >
                            <Icon icon='solar:home-2-bold' className='text-lg' />
                            <span>Return to Home</span>
                        </Link>
                        <Link
                            href='/plans'
                            className='px-8 py-3.5 bg-primary text-grey-dark rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2'
                        >
                            <Icon icon='solar:cup-hot-bold' className='text-lg' />
                            <span>Browse Other Plans</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    )
}

export default function OrderSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen flex items-center justify-center bg-[#FFFBF7]'>
                    <div className='w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin'></div>
                </div>
            }
        >
            <OrderSuccessContent />
        </Suspense>
    )
}

