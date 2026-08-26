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

        const companyName = (formData.get('companyName') as string) || ''
        const contactPerson = (formData.get('contactPerson') as string) || ''
        const phone = (formData.get('phone') as string) || ''
        const email = (formData.get('email') as string) || ''
        const location = (formData.get('location') as string) || ''
        const numberOfPeople = (formData.get('numberOfPeople') as string) || ''
        const mealsPerDay = (formData.get('mealsPerDay') as string) || ''
        const startDate = (formData.get('startDate') as string) || ''
        const notes = (formData.get('notes') as string) || ''

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName,
                    contactPerson,
                    phone,
                    email,
                    location,
                    numberOfPeople,
                    mealsPerDay,
                    startDate,
                    notes,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to submit corporate plan request')

            toast.success("Corporate plan request submitted successfully! We'll get back to you shortly.")
            form.reset()
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit request. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const featureListCol1 = [
        'Monthly employee meal plans',
        'Bulk orders',
        'Staff meal packages',
        'Custom monthly meal requirements',
    ]

    const featureListCol2 = [
        'Monthly office lunch plans',
        'Corporate subscriptions',
        'Office delivery',
    ]

    return (
        <main className='pt-20 bg-[#FFFDF5] min-h-screen'>
            {/* Top Sub-banner */}
            <div className='pt-12 pb-6 bg-linear-to-b from-primary/15 via-primary/5 to-[#FFFDF5] text-center relative overflow-hidden'>
                <div className='absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none' />
                <div className='absolute -bottom-10 -right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none' />
            </div>

            {/* Main Content Area */}
            <div className='relative z-20 pb-24'>
                <div className='container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid lg:grid-cols-12 gap-10 lg:gap-12 items-start'>

                        {/* Left Column: Corporate Information & Feature Checklist */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className='lg:col-span-5 space-y-8'
                        >
                            <div>
                                {/* Corporate Badge */}
                                <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-grey-dark text-xs font-black tracking-widest uppercase mb-6 border border-primary/40'>
                                    <Icon icon='solar:buildings-3-bold-duotone' className='text-base text-amber-600' />
                                    Corporate
                                </div>

                                {/* Main Headline */}
                                <h1 className='text-3xl sm:text-5xl lg:text-5xl font-extrabold text-grey-dark tracking-tight leading-[1.15] mb-6'>
                                    Monthly Meal Plans for <span className='text-amber-500 italic'>Offices and Employees</span>
                                </h1>

                                {/* Subtitle */}
                                <p className='text-grey-dark/75 text-base sm:text-lg font-normal leading-relaxed mb-8'>
                                    <strong className='text-grey-dark font-extrabold'>PREMIUM MESS</strong> provides monthly employee meal plans, office lunch packages, bulk orders and corporate subscriptions for teams across selected Dubai locations.
                                </p>
                            </div>

                            {/* 2-Column Feature Checklist */}
                            <div className='bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-sm'>
                                <div className='grid sm:grid-cols-2 gap-y-4 gap-x-6'>
                                    {/* Column 1 */}
                                    <div className='space-y-3.5'>
                                        {featureListCol1.map((item, index) => (
                                            <div key={index} className='flex items-start gap-3'>
                                                <div className='w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5'>
                                                    <Icon icon='solar:check-circle-bold' className='text-base text-amber-600' />
                                                </div>
                                                <span className='text-sm font-semibold text-grey-dark leading-snug'>
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Column 2 */}
                                    <div className='space-y-3.5'>
                                        {featureListCol2.map((item, index) => (
                                            <div key={index} className='flex items-start gap-3'>
                                                <div className='w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5'>
                                                    <Icon icon='solar:check-circle-bold' className='text-base text-amber-600' />
                                                </div>
                                                <span className='text-sm font-semibold text-grey-dark leading-snug'>
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Assistance Cards */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='bg-white p-5 rounded-2xl border border-grey/10 shadow-xs flex items-center gap-4 group hover:border-primary/40 transition-all'>
                                    <div className='w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform'>
                                        <Icon icon='solar:phone-calling-bold-duotone' className='text-xl' />
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-bold uppercase tracking-wider text-grey-muted'>Direct Hotline</p>
                                        <a href='tel:+97142642613' className='text-sm font-extrabold text-grey-dark hover:text-primary transition-colors'>
                                            +971 4 264 2613
                                        </a>
                                    </div>
                                </div>

                                <div className='bg-white p-5 rounded-2xl border border-grey/10 shadow-xs flex items-center gap-4 group hover:border-[#25D366]/40 transition-all'>
                                    <div className='w-11 h-11 bg-[#25D366]/10 rounded-xl flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-105 transition-transform'>
                                        <Icon icon='logos:whatsapp-icon' className='text-xl' />
                                    </div>
                                    <div>
                                        <p className='text-[10px] font-bold uppercase tracking-wider text-grey-muted'>WhatsApp Desk</p>
                                        <a
                                            href='https://wa.me/97142642613?text=Hello%20Premium%20Mess,%20I%20am%20interested%20in%20a%20Monthly%20Corporate%20Meal%20Plan.'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-sm font-extrabold text-grey-dark hover:text-amber-600 transition-colors'
                                        >
                                            +971 4 264 2613
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Request Monthly Corporate Plan Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className='lg:col-span-7'
                        >
                            <div className='bg-white rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10 md:p-12 border border-[#FFD54F]/30 shadow-xl shadow-[#FFD54F]/5'>

                                {/* Form Header */}
                                <div className='mb-8 pb-6 border-b border-grey-dark/5'>
                                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD54F]/20 text-grey-dark text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD54F]/30 mb-3'>
                                        <Icon icon='solar:buildings-2-bold-duotone' className='text-xs text-amber-600' />
                                        Customized Office Catering
                                    </div>
                                    <h2 className='text-2xl sm:text-3xl font-extrabold text-grey-dark tracking-tight'>
                                        Request Monthly Corporate Plan
                                    </h2>
                                    <p className='text-xs sm:text-sm font-medium text-grey-dark/70 mt-1.5'>
                                        Fill in your team details below and our corporate meal specialist will prepare a customized quote.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className='space-y-5 sm:space-y-6'>
                                    {/* Row 1: Company Name & Contact Person */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
                                        <div className='space-y-1.5'>
                                            <label htmlFor='companyName' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Company Name <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:buildings-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='text'
                                                    id='companyName'
                                                    name='companyName'
                                                    required
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='Company Name'
                                                />
                                            </div>
                                        </div>

                                        <div className='space-y-1.5'>
                                            <label htmlFor='contactPerson' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Contact Person <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:user-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='text'
                                                    id='contactPerson'
                                                    name='contactPerson'
                                                    required
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='Contact Person'
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Phone & Email */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
                                        <div className='space-y-1.5'>
                                            <label htmlFor='phone' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Phone Number <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:phone-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='tel'
                                                    id='phone'
                                                    name='phone'
                                                    required
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='Phone'
                                                />
                                            </div>
                                        </div>

                                        <div className='space-y-1.5'>
                                            <label htmlFor='email' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Email Address <span className='text-red-500'>*</span>
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
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='Email'
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 3: Location & Number of People */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
                                        <div className='space-y-1.5'>
                                            <label htmlFor='location' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Office Location <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:map-point-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='text'
                                                    id='location'
                                                    name='location'
                                                    required
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='Location (e.g. Business Bay, Dubai)'
                                                />
                                            </div>
                                        </div>

                                        <div className='space-y-1.5'>
                                            <label htmlFor='numberOfPeople' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Number of People <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:users-group-two-rounded-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='number'
                                                    min='1'
                                                    id='numberOfPeople'
                                                    name='numberOfPeople'
                                                    required
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                    placeholder='Number of People'
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 4: Meals Per Day (1/2/3) & Preferred Start Date */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
                                        <div className='space-y-1.5'>
                                            <label htmlFor='mealsPerDay' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Meals Per Day (1/2/3) <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:cup-hot-bold-duotone' className='text-lg' />
                                                </div>
                                                <select
                                                    id='mealsPerDay'
                                                    name='mealsPerDay'
                                                    required
                                                    defaultValue='1 Meal (Lunch)'
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all appearance-none cursor-pointer'
                                                >
                                                    <option value='1 Meal (Lunch)'>1 Meal (Lunch)</option>
                                                    <option value='2 Meals (Lunch + Dinner)'>2 Meals (Lunch + Dinner)</option>
                                                    <option value='3 Meals (Breakfast + Lunch + Dinner)'>3 Meals (Breakfast + Lunch + Dinner)</option>
                                                    <option value='Custom Requirement'>Custom Requirement</option>
                                                </select>
                                                <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-grey-dark/50'>
                                                    <Icon icon='solar:alt-arrow-down-linear' className='text-base' />
                                                </div>
                                            </div>
                                        </div>

                                        <div className='space-y-1.5'>
                                            <label htmlFor='startDate' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                                Preferred Start Date <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                                                    <Icon icon='solar:calendar-date-bold-duotone' className='text-lg' />
                                                </div>
                                                <input
                                                    type='date'
                                                    id='startDate'
                                                    name='startDate'
                                                    required
                                                    className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 5: Additional Notes */}
                                    <div className='space-y-1.5'>
                                        <label htmlFor='notes' className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                            Additional Notes <span className='font-medium normal-case text-grey-dark/50'>(optional)</span>
                                        </label>
                                        <div className='relative'>
                                            <div className='absolute top-3.5 left-0 pl-4 pointer-events-none text-grey-dark/40'>
                                                <Icon icon='solar:notes-bold-duotone' className='text-lg' />
                                            </div>
                                            <textarea
                                                id='notes'
                                                name='notes'
                                                rows={4}
                                                style={{ resize: 'none' }}
                                                className='w-full bg-[#FFFDF5] border border-[#FFD54F]/30 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                                                placeholder='Additional Notes'
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='w-full bg-[#FFD54F] hover:bg-[#F59E0B] text-grey-dark px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base flex justify-center items-center gap-3 shadow-lg shadow-[#FFD54F]/30 hover:shadow-xl hover:shadow-[#FFD54F]/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Icon icon='line-md:loading-loop' className='text-xl' />
                                                <span>Submitting Request...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon='solar:plain-2-bold' className='text-lg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
                                                <span>Request Monthly Corporate Plan</span>
                                            </>
                                        )}
                                    </button>

                                    <p className='text-[11px] font-semibold text-grey-dark/50 text-center'>
                                        🔒 We respect your privacy. Corporate details are strictly kept confidential.
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
