'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import CheckoutForm from '@/app/components/Order/CheckoutForm'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
    const [selection, setSelection] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const saved = localStorage.getItem('order_selection')
        if (saved) {
            setSelection(JSON.parse(saved))
        } else {
            // If no selection, redirect back to menu
            router.push('/get-started')
        }
    }, [router])

    if (!selection) return (
        <div className='min-h-screen flex items-center justify-center bg-[#FFFBF7]'>
            <div className='w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin'></div>
        </div>
    )

    return (
        <main className='min-h-screen pt-32 pb-48 bg-[#FFFBF7] selection:bg-primary/20'>
            <div className='container max-w-7xl mx-auto px-6'>
                {/* Header */}
                <div className='mb-16 text-center max-w-2xl mx-auto'>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='flex items-center justify-center gap-3 mb-6'
                    >
                        <span className='h-px w-10 bg-primary/40'></span>
                        <span className='text-primary text-sm font-black tracking-[0.4em] uppercase'>Checkout Boundary</span>
                        <span className='h-px w-10 bg-primary/40'></span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-5xl md:text-7xl font-black text-grey tracking-tight mb-8'
                    >
                        Complete Your <br />
                        <span className='text-primary italic relative'>
                            Subscription
                            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                                <path d="M0 4 Q 25 0, 50 4 T 100 4" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                            </svg>
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className='text-grey/40 text-lg font-medium'
                    >
                        Please provide your delivery and contact information below to finalize your mess subscription.
                    </motion.p>
                </div>

                {/* Form Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <CheckoutForm
                        selectedMenuIds={selection.menuIds}
                        selectionsJson={selection.selections}
                        totalPrice={selection.totalPrice}
                    />
                </motion.div>

                {/* Secure Note */}
                <div className='mt-12 flex items-center justify-center gap-3 text-grey/30'>
                    <Icon icon="ion:shield-checkmark-outline" className="text-xl" />
                    <span className='text-[10px] font-black uppercase tracking-widest'>Your data is handled securely and only used for service delivery.</span>
                </div>
            </div>
        </main>
    )
}
