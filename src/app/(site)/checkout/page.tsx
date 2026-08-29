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
        <main className='min-h-screen pt-32 pb-48 bg-[#FEEBB1] relative overflow-hidden'>
            {/* Ambient background glows */}
            <div className='absolute top-0 right-1/4 w-96 h-96 bg-[#fed869]/30 rounded-full blur-3xl pointer-events-none' />
            <div className='absolute bottom-10 left-10 w-96 h-96 bg-[#fed869]/30 rounded-full blur-3xl pointer-events-none' />

            <div className='container max-w-7xl mx-auto px-6 relative z-10'>
                {/* Header */}
                <div className='mb-16 text-center max-w-2xl mx-auto'>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='flex items-center justify-center gap-3 mb-6'
                    >
                        <span className='h-px w-10 bg-[#fed869]'></span>
                        <span className='text-amber-800 text-xs font-black tracking-[0.3em] uppercase inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fed869] border border-[#fed869] shadow-xs'>Secure Checkout</span>
                        <span className='h-px w-10 bg-[#fed869]'></span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-4xl sm:text-5xl md:text-6xl font-extrabold text-grey-dark tracking-tight mb-6'
                    >
                        Complete Your <br />
                        <span className='text-amber-800 italic underline decoration-[#fed869]'>
                            Subscription
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className='text-grey-dark/85 text-base sm:text-lg font-medium'
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
