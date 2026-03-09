'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import Link from 'next/link'

export default function OrderSuccessPage() {
    useEffect(() => {
        // Clear the selection on success
        localStorage.removeItem('order_selection')
    }, [])

    return (
        <main className='min-h-screen pt-32 pb-48 bg-[#FFFBF7] flex items-center justify-center px-6 selection:bg-primary/20'>
            <div className='max-w-xl w-full text-center'>
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                    className='w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center text-grey mx-auto mb-10 shadow-2xl shadow-primary/20'
                >
                    <Icon icon="ion:checkmark-done-circle" className="text-6xl" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className='text-5xl font-black text-grey tracking-tight mb-6'>Order Received!</h1>
                    <p className='text-grey/40 text-xl font-medium mb-12 leading-relaxed'>
                        Thank you for choosing <span className='text-primary font-black italic uppercase'>Al Shamil Mess</span>.
                        Your subscription request has been received. Our executive will call you shortly to confirm the details.
                    </p>

                    <div className='bg-white rounded-[3rem] p-8 border border-grey/5 mb-12 shadow-xl'>
                        <div className='flex items-center gap-6 text-left'>
                            <div className='w-14 h-14 bg-grey/5 rounded-2xl flex items-center justify-center text-primary'>
                                <Icon icon="ion:calendar-outline" className="text-2xl" />
                            </div>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1'>Next Steps</p>
                                <p className='text-grey font-bold'>Order confirmation & payment collection via phone.</p>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-6 justify-center'>
                        <Link
                            href="/"
                            className='px-10 py-5 bg-grey text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3'
                        >
                            <Icon icon="ion:home-outline" className="text-xl" />
                            Return Home
                        </Link>
                        <Link
                            href="/menu"
                            className='px-10 py-5 bg-primary text-grey rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3'
                        >
                            <Icon icon="ion:restaurant-outline" className="text-xl" />
                            Explore Menu
                        </Link>
                    </div>
                </motion.div>

                {/* Secure Note */}
                <div className='mt-20 flex items-center justify-center gap-3 text-grey/10'>
                    <Icon icon="ion:shield-checkmark-outline" className="text-xl" />
                    <span className='text-[10px] font-black uppercase tracking-widest'>Your satisfaction is our priority.</span>
                </div>
            </div>
        </main>
    )
}
