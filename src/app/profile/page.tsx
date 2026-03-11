'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

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
        enabled: !!session
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
        }
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
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Icon icon="line-md:loading-loop" className="text-4xl text-primary" />
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="pt-32 pb-20 container max-w-4xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border border-grey/5 shadow-2xl overflow-hidden"
            >
                <div className="relative h-48 bg-primary/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" 
                    />
                </div>

                <div className="px-8 md:px-12 -mt-20 pb-12 relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex items-end gap-6">
                            <div className="w-32 h-32 bg-white rounded-[2.5rem] p-2 shadow-xl border border-grey/5">
                                <div className="w-full h-full bg-grey/5 rounded-[2rem] flex items-center justify-center text-primary">
                                    <Icon icon="solar:user-bold-duotone" className="text-6xl" />
                                </div>
                            </div>
                            <div className="pb-2">
                                <h1 className="text-4xl font-black text-grey uppercase tracking-tight italic">{profile.name}</h1>
                                <p className="text-sm font-bold text-grey/40 uppercase tracking-widest">Registered Member</p>
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
                            >
                                <Icon icon="solar:pen-new-square-bold" className="text-lg" />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-6">
                            <div className="p-6 bg-grey/5 rounded-[2rem] border border-grey/5">
                                <p className="text-[10px] font-black text-grey/30 uppercase tracking-[0.2em] mb-4">Account Stats</p>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-2xl font-black text-primary italic leading-none">
                                            {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] font-bold text-grey/40 uppercase tracking-widest mt-1">Joined Since</p>
                                    </div>
                                    <div className="pt-4 border-t border-grey/10">
                                        <p className="text-sm font-black text-grey uppercase">{profile.email}</p>
                                        <p className="text-[10px] font-bold text-grey/40 uppercase tracking-widest mt-1">Verified Email</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.form
                                        key="edit-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6 bg-grey/5 p-8 rounded-[2.5rem] border border-primary/10"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Full Name</label>
                                                <input
                                                    name="name"
                                                    defaultValue={profile.name}
                                                    required
                                                    className="w-full bg-white border border-grey/10 px-6 py-4 rounded-2xl text-grey font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-grey/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Phone Number</label>
                                                <input
                                                    name="phone"
                                                    defaultValue={profile.phone}
                                                    required
                                                    className="w-full bg-white border border-grey/10 px-6 py-4 rounded-2xl text-grey font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-grey/20"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">WhatsApp No (Optional)</label>
                                                <input
                                                    name="whatsappNo"
                                                    defaultValue={profile.whatsappNo || ''}
                                                    className="w-full bg-white border border-grey/10 px-6 py-4 rounded-2xl text-grey font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-grey/20"
                                                    placeholder="Example: +919876543210"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={updateProfile.isPending}
                                                className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                            >
                                                {updateProfile.isPending ? 'Saving Changes...' : 'Save Profile'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-grey hover:bg-grey/10 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="view-profile"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-6 p-6 bg-grey/5 rounded-[2rem] border border-grey/5 hover:border-primary/20 transition-all group">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-grey/20 group-hover:text-primary transition-all shadow-sm">
                                                    <Icon icon="solar:phone-bold-duotone" className="text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-grey/30 uppercase tracking-widest leading-none mb-1">Mobile Number</p>
                                                    <p className="text-xl font-black text-grey uppercase italic tracking-tight">{profile.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 p-6 bg-grey/5 rounded-[2rem] border border-grey/5 hover:border-primary/20 transition-all group">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-grey/20 group-hover:text-primary transition-all shadow-sm">
                                                    <Icon icon="logos:whatsapp-icon" className="text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-grey/30 uppercase tracking-widest leading-none mb-1">WhatsApp Connect</p>
                                                    <p className="text-xl font-black text-grey uppercase italic tracking-tight">
                                                        {profile.whatsappNo || 'Not Provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 border-2 border-dashed border-grey/10 rounded-[2.5rem] flex items-center justify-between group hover:border-primary/30 transition-all">
                                            <div>
                                                <h4 className="text-lg font-black text-grey uppercase italic mb-1">Manage Subscriptions</h4>
                                                <p className="text-xs font-bold text-grey/40 uppercase tracking-widest">View and manage your active meal plans</p>
                                            </div>
                                            <button className="w-12 h-12 bg-grey/5 rounded-full flex items-center justify-center text-grey hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <Icon icon="solar:arrow-right-bold" className="text-xl" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
