'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const form = e.currentTarget
        const formData = new FormData(form)
        const name = (formData.get('name') as string) || ''
        const email = (formData.get('email') as string) || ''
        const subject = (formData.get('subject') as string) || ''
        const message = (formData.get('message') as string) || ''

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send message')

            toast.success("Message sent successfully! We'll get back to you soon.")
            form.reset()
        } catch (err: any) {
            toast.error(err.message || 'Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className='pt-20 bg-[#FFFDF5] min-h-screen'>
            {/* Hero Banner */}
            <div className='pt-16 pb-12 bg-linear-to-b from-primary/15 via-primary/5 to-[#FFFDF5] text-center relative overflow-hidden'>
                <div className='absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none' />
                <div className='absolute -bottom-10 -right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none' />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className='relative z-10'
                >
                    <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-grey-dark text-xs font-bold mb-4 border border-primary/40'>
                        <Icon icon='solar:chat-round-line-bold-duotone' className='text-sm' />
                        Premium Mess — Customer Support
                    </div>

                    <h1 className='text-3xl sm:text-5xl lg:text-6xl font-extrabold text-grey-dark tracking-tight mb-4'>
                        Get in <span className='text-amber-500'>Touch</span>
                    </h1>
                    <p className='text-grey-muted text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto'>
                        Have a question about your meal plan or delivery? We're here to help — reach out and we'll respond quickly.
                    </p>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className='relative z-20 -mt-4 pb-20'>
                <div className='container max-w-6xl mx-auto px-4'>
                    <div className='grid lg:grid-cols-5 gap-6 lg:gap-8'>

                        {/* Left Column — Contact Info Cards */}
                        <div className='lg:col-span-2 space-y-4'>

                            {/* Call Us */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className='bg-white p-6 rounded-3xl border border-grey/10 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group'
                            >
                                <div className='w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform border border-primary/20'>
                                    <Icon icon='solar:phone-calling-bold-duotone' className='text-2xl' />
                                </div>
                                <h3 className='text-base font-extrabold text-grey-dark mb-1'>Call Us</h3>
                                <p className='text-xs font-medium text-grey-dark/75 mb-3'>Daily Support, 9AM to 10PM</p>
                                <a href='tel:+97142642613' className='text-xl font-extrabold text-primary hover:text-grey-dark transition-colors'>
                                    +971 4 264 2613
                                </a>
                            </motion.div>

                            {/* Email Us */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className='bg-white p-6 rounded-3xl border border-grey/10 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group'
                            >
                                <div className='w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform border border-primary/20'>
                                    <Icon icon='solar:letter-bold-duotone' className='text-2xl' />
                                </div>
                                <h3 className='text-base font-extrabold text-grey-dark mb-1'>Email Us</h3>
                                <p className='text-xs font-medium text-grey-dark/75 mb-3'>We usually reply within a few hours</p>
                                <a href='mailto:contact@chefs-kitchen.com' className='text-sm font-extrabold text-primary hover:text-grey-dark transition-colors break-all'>
                                    contact@chefs-kitchen.com
                                </a>
                            </motion.div>

                            {/* WhatsApp */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className='bg-primary p-6 rounded-3xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden'
                            >
                                <div className='absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500'>
                                    <Icon icon='logos:whatsapp-icon' className='text-[120px]' />
                                </div>
                                <div className='relative z-10 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm'>
                                    <Icon icon='logos:whatsapp-icon' className='text-2xl' />
                                </div>
                                <h3 className='relative z-10 text-base font-extrabold text-grey-dark mb-1'>WhatsApp</h3>
                                <p className='relative z-10 text-xs font-medium text-grey-dark/80 mb-3'>Instant support &amp; ordering</p>
                                <a
                                    href='https://wa.me/971501234567'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='relative z-10 text-xl font-extrabold text-grey-dark hover:text-white transition-colors inline-block'
                                >
                                    +971 50 123 4567
                                </a>
                            </motion.div>

                            {/* Location */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className='bg-white p-6 rounded-3xl border border-grey/10 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group'
                            >
                                <div className='w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform border border-primary/20'>
                                    <Icon icon='solar:map-point-bold-duotone' className='text-2xl' />
                                </div>
                                <h3 className='text-base font-extrabold text-grey-dark mb-1'>Our Location</h3>
                                <p className='text-xs font-medium text-grey-dark/75 mb-1'>Serving across Dubai &amp; Sharjah</p>
                                <p className='text-sm font-bold text-grey-dark'>Dubai, United Arab Emirates</p>
                            </motion.div>
                        </div>

                        {/* Right Column — Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className='lg:col-span-3'
                        >
                            <div className='bg-white rounded-3xl p-7 sm:p-10 border border-grey/10 shadow-xs h-full'>

                                {/* Form Header */}
                                <div className='mb-7'>
                                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-grey-dark text-[10px] font-extrabold uppercase tracking-wider border border-primary/20 mb-3'>
                                        <Icon icon='solar:plain-2-bold-duotone' className='text-xs text-primary' />
                                        Send a Message
                                    </div>
                                    <h2 className='text-xl sm:text-2xl font-extrabold text-grey-dark tracking-tight'>
                                        How Can We Help You?
                                    </h2>
                                    <p className='text-xs font-medium text-grey-dark/75 mt-1.5'>
                                        Fill out the form and we'll respond within a few hours.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className='space-y-5'>
                                    {/* Name + Email */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                        <div className='space-y-1.5'>
                                            <label htmlFor='name' className='text-[10px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Full Name
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:user-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='text'
                                                    id='name'
                                                    name='name'
                                                    required
                                                    className='w-full bg-grey/5 border border-grey/10 focus:bg-white focus:border-primary/30 px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='John Doe'
                                                />
                                            </div>
                                        </div>
                                        <div className='space-y-1.5'>
                                            <label htmlFor='email' className='text-[10px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Email Address
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:letter-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='email'
                                                    id='email'
                                                    name='email'
                                                    required
                                                    className='w-full bg-grey/5 border border-grey/10 focus:bg-white focus:border-primary/30 px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='john@example.com'
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className='space-y-1.5'>
                                        <label htmlFor='phone' className='text-[10px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                            Phone Number{' '}
                                            <span className='font-medium normal-case text-grey-dark/50'>(optional)</span>
                                        </label>
                                        <div className='relative'>
                                            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                <Icon icon='solar:phone-bold-duotone' className='text-lg' />
                                            </div>
                                            <input
                                                type='tel'
                                                id='phone'
                                                name='phone'
                                                className='w-full bg-grey/5 border border-grey/10 focus:bg-white focus:border-primary/30 px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-grey-dark/30'
                                                placeholder='+971 50 000 0000'
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className='space-y-1.5'>
                                        <label htmlFor='subject' className='text-[10px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                            Subject
                                        </label>
                                        <div className='relative'>
                                            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                <Icon icon='solar:notes-bold-duotone' className='text-lg' />
                                            </div>
                                            <input
                                                type='text'
                                                id='subject'
                                                name='subject'
                                                required
                                                className='w-full bg-grey/5 border border-grey/10 focus:bg-white focus:border-primary/30 px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-grey-dark/30'
                                                placeholder='How can we help?'
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className='space-y-1.5'>
                                        <label htmlFor='message' className='text-[10px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                            Your Message
                                        </label>
                                        <div className='relative'>
                                            <div className='absolute top-3.5 left-0 pl-4 pointer-events-none text-grey-dark/40'>
                                                <Icon icon='solar:pen-bold-duotone' className='text-lg' />
                                            </div>
                                            <textarea
                                                id='message'
                                                name='message'
                                                rows={5}
                                                required
                                                style={{ resize: 'none' }}
                                                className='w-full bg-grey/5 border border-grey/10 focus:bg-white focus:border-primary/30 px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-grey-dark/30'
                                                placeholder='Tell us about your question, subscription issue, or special request...'
                                            />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='w-full bg-primary hover:bg-primary/90 text-grey-dark px-8 py-3.5 rounded-2xl font-extrabold text-sm flex justify-center items-center gap-2.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Icon icon='line-md:loading-loop' className='text-lg' />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <Icon icon='solar:plain-2-bold' className='text-lg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
                                            </>
                                        )}
                                    </button>

                                    <p className='text-[11px] font-medium text-grey-dark/50 text-center'>
                                        We respect your privacy. Your information is never shared.
                                    </p>
                                </form>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </main>
    )
}
