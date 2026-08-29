'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

type UserProfile = {
    id: string
    name: string
    email: string
    phone: string
    whatsappNo: string | null
    createdAt: string
}

export default function ProfilePage() {
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)

    const { data: profile, isLoading } = useQuery<UserProfile>({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await axios.get('/api/user/profile')
            return response.data
        },
        enabled: !!session,
    })

    const updateProfile = useMutation({
        mutationFn: async (newData: Partial<UserProfile>) => {
            const response = await axios.put('/api/user/profile', newData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] })
            toast.success('Profile updated successfully')
            setIsEditing(false)
        },
        onError: () => {
            toast.error('Failed to update profile')
        },
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const phone = formData.get('phone') as string
        const whatsappNo = formData.get('whatsappNo') as string

        updateProfile.mutate({ name, phone, whatsappNo })
    }

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[50vh] space-y-4'>
                <div className='w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl animate-spin'>
                    <Icon icon='line-md:loading-loop' />
                </div>
                <p className='text-xs font-semibold text-grey-muted'>Loading profile details...</p>
            </div>
        )
    }

    if (!profile) return null

    const initials = profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()

    return (
        <div className='space-y-6 max-w-4xl'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-grey/10 shadow-xs'>
                <div>
                    <h2 className='text-xl sm:text-2xl font-bold text-grey-dark tracking-tight'>
                        My Account &amp; Profile
                    </h2>
                    <p className='text-xs text-grey-muted mt-1'>
                        Manage your customer contact details and delivery preferences
                    </p>
                </div>

                {!isEditing ? (
                    <button
                        type='button'
                        onClick={() => setIsEditing(true)}
                        className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-grey-dark font-extrabold text-xs hover:bg-primary-hover shadow-md shadow-primary/20 transition-all cursor-pointer'
                    >
                        <Icon icon='solar:pen-new-square-bold' className='text-base' />
                        <span>Edit Profile</span>
                    </button>
                ) : (
                    <button
                        type='button'
                        onClick={() => setIsEditing(false)}
                        className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-grey/5 border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/10 transition-all cursor-pointer'
                    >
                        <span>Cancel Editing</span>
                    </button>
                )}
            </div>

            {/* Profile Card */}
            <div className='bg-white rounded-3xl border border-grey/10 shadow-xs overflow-hidden'>
                {/* Banner & User Initials */}
                <div className='p-6 sm:p-8 bg-[#FAF8F5]/80 border-b border-grey/10 flex items-center gap-5'>
                    <div className='w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary font-bold text-xl flex items-center justify-center shrink-0 shadow-xs'>
                        {initials}
                    </div>
                    <div className='min-w-0'>
                        <h3 className='text-lg font-bold text-grey-dark truncate'>{profile.name}</h3>
                        <p className='text-xs text-grey-muted mt-0.5'>{profile.email}</p>
                        <span className='inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold'>
                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-600' />
                            Verified Customer Account
                        </span>
                    </div>
                </div>

                {/* Form or Info View */}
                <div className='p-6 sm:p-8'>
                    <AnimatePresence mode='wait'>
                        {isEditing ? (
                            <motion.form
                                key='edit-form'
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                onSubmit={handleSubmit}
                                className='space-y-6'
                            >
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-bold text-grey-dark'>Full Name</label>
                                        <input
                                            type='text'
                                            name='name'
                                            defaultValue={profile.name}
                                            required
                                            className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-2xl text-xs font-semibold text-grey-dark focus:outline-none focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>

                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-bold text-grey-dark'>Email Address</label>
                                        <input
                                            type='email'
                                            disabled
                                            value={profile.email}
                                            className='w-full px-4 py-3 bg-grey/10 border border-grey/10 rounded-2xl text-xs font-semibold text-grey-muted cursor-not-allowed'
                                        />
                                    </div>

                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-bold text-grey-dark'>Contact Phone</label>
                                        <input
                                            type='text'
                                            name='phone'
                                            defaultValue={profile.phone}
                                            required
                                            className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-2xl text-xs font-semibold text-grey-dark focus:outline-none focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>

                                    <div className='space-y-1.5'>
                                        <label className='text-xs font-bold text-grey-dark'>WhatsApp Number (Optional)</label>
                                        <input
                                            type='text'
                                            name='whatsappNo'
                                            defaultValue={profile.whatsappNo || ''}
                                            className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-2xl text-xs font-semibold text-grey-dark focus:outline-none focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                </div>

                                <div className='flex items-center justify-end gap-3 pt-4 border-t border-grey/10'>
                                    <button
                                        type='button'
                                        onClick={() => setIsEditing(false)}
                                        className='px-5 py-2.5 rounded-2xl bg-grey/5 border border-grey/15 text-grey-dark font-bold text-xs hover:bg-grey/10 cursor-pointer'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={updateProfile.isPending}
                                        className='px-6 py-2.5 rounded-2xl bg-primary text-grey-dark font-extrabold text-xs shadow-md shadow-primary/20 hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-2'
                                    >
                                        {updateProfile.isPending && (
                                            <Icon icon='line-md:loading-loop' className='text-sm' />
                                        )}
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key='view-info'
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className='grid grid-cols-1 md:grid-cols-2 gap-5'
                            >
                                <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 space-y-1'>
                                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider'>Full Name</span>
                                    <p className='text-sm font-bold text-grey-dark'>{profile.name}</p>
                                </div>

                                <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 space-y-1'>
                                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider'>Email Address</span>
                                    <p className='text-sm font-bold text-grey-dark'>{profile.email}</p>
                                </div>

                                <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 space-y-1'>
                                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider'>Phone Number</span>
                                    <p className='text-sm font-bold text-grey-dark'>{profile.phone || 'Not provided'}</p>
                                </div>

                                <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 space-y-1'>
                                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider'>WhatsApp Number</span>
                                    <p className='text-sm font-bold text-grey-dark'>{profile.whatsappNo || 'Not provided'}</p>
                                </div>

                                <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 space-y-1 md:col-span-2'>
                                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider'>Account Created</span>
                                    <p className='text-xs font-semibold text-grey-dark'>
                                        {new Date(profile.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Quick Actions Card */}
            <div className='p-6 bg-white rounded-3xl border border-grey/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xl shrink-0'>
                        <Icon icon='solar:bag-check-bold-duotone' />
                    </div>
                    <div>
                        <h4 className='text-xs font-bold text-grey-dark'>Manage Your Subscriptions</h4>
                        <p className='text-[11px] text-grey-muted'>View active meal deliveries and calendar schedules</p>
                    </div>
                </div>
                <Link
                    href='/my-orders'
                    className='inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-grey/5 border border-grey/15 text-xs font-bold text-grey-dark hover:bg-grey/10 transition-colors'
                >
                    <span>Go to My Orders</span>
                    <Icon icon='solar:arrow-right-up-bold' className='text-xs text-primary' />
                </Link>
            </div>
        </div>
    )
}
