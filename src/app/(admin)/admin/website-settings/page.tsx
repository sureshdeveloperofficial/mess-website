'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface WebsiteSettingsState {
    restaurant_name: string
    site_tagline: string
    site_bio: string
    site_logo: string
    site_favicon: string
    contact_phone: string
    contact_whatsapp: string
    contact_email: string
    contact_address: string
    social_facebook: string
    social_instagram: string
    social_twitter: string
    social_youtube: string
    currency: string
    tax_rate: string
    delivery_charge: string
    delivery_timing_lunch: string
    delivery_timing_dinner: string
}

export default function WebsiteSettingsPage() {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [justSaved, setJustSaved] = useState(false)

    const [formData, setFormData] = useState<WebsiteSettingsState>({
        restaurant_name: 'PREMIUM MESS',
        site_tagline: 'Authentic Home-Style Meals Served Daily with Love',
        site_bio: 'Authentic home-style meals served daily with love. High quality, hygienic, and nutritious dining for every guest.',
        site_logo: '',
        site_favicon: '',
        contact_phone: '+971 4 264 2613',
        contact_whatsapp: '+971 50 123 4567',
        contact_email: 'contact@chefs-kitchen.com',
        contact_address: 'Al Nahda & Deira, Dubai, United Arab Emirates',
        social_facebook: 'https://facebook.com',
        social_instagram: 'https://instagram.com',
        social_twitter: 'https://twitter.com',
        social_youtube: 'https://youtube.com',
        currency: 'AED',
        tax_rate: '5',
        delivery_charge: '0.00',
        delivery_timing_lunch: '12:00 PM - 02:00 PM',
        delivery_timing_dinner: '07:30 PM - 09:30 PM',
    })

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await axios.get('/api/settings')
            return res.data
        },
    })

    useEffect(() => {
        if (settings) {
            const rawName = settings.restaurant_name || settings.site_name || 'PREMIUM MESS'
            const cleanName = rawName.toLowerCase().includes('shamil') ? 'PREMIUM MESS' : rawName
            setFormData({
                restaurant_name: cleanName,
                site_tagline: settings.site_tagline || 'Authentic Home-Style Meals Served Daily with Love',
                site_bio: (settings.site_bio || 'Authentic home-style meals served daily with love. High quality, hygienic, and nutritious dining for every guest.').replace(/\s*since\s*2015\.?/gi, '.').replace(/\.\./g, '.'),
                site_logo: settings.site_logo || '',
                site_favicon: settings.site_favicon || '',
                contact_phone: settings.contact_phone || '+971 4 264 2613',
                contact_whatsapp: settings.contact_whatsapp || '+971 50 123 4567',
                contact_email: settings.contact_email || 'contact@chefs-kitchen.com',
                contact_address: settings.contact_address || 'Al Nahda & Deira, Dubai, United Arab Emirates',
                social_facebook: settings.social_facebook || 'https://facebook.com',
                social_instagram: settings.social_instagram || 'https://instagram.com',
                social_twitter: settings.social_twitter || 'https://twitter.com',
                social_youtube: settings.social_youtube || 'https://youtube.com',
                currency: settings.currency || 'AED',
                tax_rate: settings.tax_rate || '5',
                delivery_charge: settings.delivery_charge || '0.00',
                delivery_timing_lunch: settings.delivery_timing_lunch || '12:00 PM - 02:00 PM',
                delivery_timing_dinner: settings.delivery_timing_dinner || '07:30 PM - 09:30 PM',
            })
        }
    }, [settings])

    const saveMutation = useMutation({
        mutationFn: async (newSettings: WebsiteSettingsState) => {
            const res = await axios.post('/api/settings', { settings: newSettings })
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            setJustSaved(true)
            toast.success('Website configuration saved successfully!')
            setTimeout(() => setJustSaved(false), 4000)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to save website settings')
        },
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        saveMutation.mutate(formData)
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (PNG, SVG, JPG, WebP).')
            return
        }

        const uploadData = new FormData()
        uploadData.append('file', file)

        setUploading(true)
        try {
            const res = await axios.post('/api/upload', uploadData)
            const uploadedUrl = res.data.secure_url || (process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}${res.data.path}` : res.data.path)
            
            setFormData(prev => ({
                ...prev,
                site_logo: uploadedUrl
            }))
            toast.success('Logo uploaded successfully! Click Save to apply.')
        } catch (error: any) {
            console.error('Logo upload error:', error)
            toast.error(error.response?.data?.error || 'Failed to upload logo image')
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, site_logo: '' }))
        if (fileInputRef.current) fileInputRef.current.value = ''
        toast.success('Logo removed. Default logo will be used.')
    }

    return (
        <div className='max-w-6xl mx-auto space-y-8 pb-16'>
            {/* Header */}
            <div>
                <h1 className='admin-page-title'>Website &amp; Branding Configuration</h1>
                <p className='admin-page-subtitle'>
                    Manage your website's custom Logo, Brand Name, Contact Details, Social Profiles, and Operational Settings. Updates reflect across the public site in real-time.
                </p>
            </div>

            {/* Success Banner */}
            {justSaved && (
                <div className='bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-fade-in shadow-xs'>
                    <Icon icon='solar:check-circle-bold' className='text-xl text-green-600' />
                    <span>Website settings saved successfully! Live changes are now active across your Header, Footer, and Pages.</span>
                </div>
            )}

            <form onSubmit={handleSave} className='space-y-8'>
                {/* 1. Visual Branding & Logo Upload */}
                <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                        <h2 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                            <Icon icon='solar:gallery-wide-bold-duotone' className='text-primary text-2xl' />
                            Brand Identity &amp; Logo
                        </h2>
                        {isLoading && <span className='text-xs text-grey-muted animate-pulse'>Loading active configuration...</span>}
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
                        {/* Logo Upload Box */}
                        <div className='space-y-3'>
                            <label className='block text-xs font-bold uppercase text-grey/60'>
                                Website Logo (Header &amp; Footer)
                            </label>
                            
                            <div className='border-2 border-dashed border-grey/20 hover:border-primary/50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-grey/5 relative group min-h-[180px]'>
                                {formData.site_logo ? (
                                    <div className='space-y-3 w-full flex flex-col items-center'>
                                        <div className='p-4 bg-white rounded-xl shadow-sm border border-grey/10 max-h-28 flex items-center justify-center max-w-full'>
                                            <img
                                                src={formData.site_logo}
                                                alt='Website Logo'
                                                className='max-h-20 max-w-full object-contain'
                                            />
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <button
                                                type='button'
                                                onClick={() => fileInputRef.current?.click()}
                                                className='px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all'
                                            >
                                                Change Logo
                                            </button>
                                            <button
                                                type='button'
                                                onClick={handleRemoveLogo}
                                                className='px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all'
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='space-y-3 flex flex-col items-center'>
                                        <div className='w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl'>
                                            {uploading ? (
                                                <Icon icon='line-md:loading-loop' />
                                            ) : (
                                                <Icon icon='solar:upload-track-2-bold-duotone' />
                                            )}
                                        </div>
                                        <div>
                                            <p className='text-xs font-bold text-grey'>
                                                {uploading ? 'Uploading to Cloudinary...' : 'Upload Brand Logo'}
                                            </p>
                                            <p className='text-[10px] text-grey/40 mt-0.5'>PNG, SVG, JPG, WebP up to 5MB</p>
                                        </div>
                                        <button
                                            type='button'
                                            disabled={uploading}
                                            onClick={() => fileInputRef.current?.click()}
                                            className='px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm'
                                        >
                                            Choose File
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='image/*'
                                    onChange={handleLogoUpload}
                                    className='hidden'
                                />
                            </div>

                            {/* Direct URL Fallback */}
                            <div>
                                <label className='block text-[10px] font-bold uppercase text-grey/40 mb-1'>
                                    Or Paste Logo Direct Image URL
                                </label>
                                <input
                                    type='url'
                                    value={formData.site_logo}
                                    onChange={(e) => setFormData({ ...formData, site_logo: e.target.value })}
                                    placeholder='https://res.cloudinary.com/.../logo.png'
                                    className='w-full px-3 py-2 bg-grey/5 border border-grey/10 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        </div>

                        {/* Brand Name & Tagline */}
                        <div className='lg:col-span-2 space-y-4'>
                            <div>
                                <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                    Website &amp; Restaurant Brand Name *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={formData.restaurant_name}
                                    onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                                    placeholder='PREMIUM MESS'
                                    className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                    Brand Tagline / Slogan
                                </label>
                                <input
                                    type='text'
                                    value={formData.site_tagline}
                                    onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                                    placeholder='Authentic Home-Style Meals Served Daily with Love'
                                    className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                    About Bio (Footer &amp; About Description)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.site_bio}
                                    onChange={(e) => setFormData({ ...formData, site_bio: e.target.value })}
                                    placeholder='Authentic home-style meals served daily with love...'
                                    className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Contact & Physical Location */}
                <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <h2 className='text-xl font-bold text-grey flex items-center gap-2.5 border-b border-grey/10 pb-4'>
                        <Icon icon='solar:phone-calling-rounded-bold-duotone' className='text-primary text-2xl' />
                        Contact &amp; Store Information
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Primary Telephone Number *
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                placeholder='+971 4 264 2613'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                WhatsApp Business Ordering Number
                            </label>
                            <input
                                type='text'
                                value={formData.contact_whatsapp}
                                onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                                placeholder='+971 50 123 4567'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Customer Support / Inquiry Email *
                            </label>
                            <input
                                type='email'
                                required
                                value={formData.contact_email}
                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                placeholder='contact@chefs-kitchen.com'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Store Physical Address *
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.contact_address}
                                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                                placeholder='Al Nahda & Deira, Dubai, United Arab Emirates'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Social Media Channels */}
                <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <h2 className='text-xl font-bold text-grey flex items-center gap-2.5 border-b border-grey/10 pb-4'>
                        <Icon icon='solar:share-circle-bold-duotone' className='text-primary text-2xl' />
                        Social Media Channels
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2 flex items-center gap-2'>
                                <Icon icon='logos:facebook' /> Facebook Profile URL
                            </label>
                            <input
                                type='url'
                                value={formData.social_facebook}
                                onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                                placeholder='https://facebook.com/yourpage'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2 flex items-center gap-2'>
                                <Icon icon='logos:instagram-icon' /> Instagram Profile URL
                            </label>
                            <input
                                type='url'
                                value={formData.social_instagram}
                                onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                                placeholder='https://instagram.com/yourpage'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2 flex items-center gap-2'>
                                <Icon icon='fa6-brands:x-twitter' /> Twitter / X Profile URL
                            </label>
                            <input
                                type='url'
                                value={formData.social_twitter}
                                onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                                placeholder='https://twitter.com/yourpage'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2 flex items-center gap-2'>
                                <Icon icon='logos:youtube-icon' /> YouTube / TikTok Channel URL
                            </label>
                            <input
                                type='url'
                                value={formData.social_youtube}
                                onChange={(e) => setFormData({ ...formData, social_youtube: e.target.value })}
                                placeholder='https://youtube.com/c/yourchannel'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Operations & Pricing */}
                <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <h2 className='text-xl font-bold text-grey flex items-center gap-2.5 border-b border-grey/10 pb-4'>
                        <Icon icon='solar:clock-circle-bold-duotone' className='text-primary text-2xl' />
                        Operations, Pricing &amp; Timings
                    </h2>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Currency Code *
                            </label>
                            <input
                                type='text'
                                required
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                placeholder='AED'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Tax / VAT Percentage (%)
                            </label>
                            <input
                                type='text'
                                value={formData.tax_rate}
                                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                                placeholder='5'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Delivery Charge (AED)
                            </label>
                            <input
                                type='text'
                                value={formData.delivery_charge}
                                onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                                placeholder='0.00'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Lunch Delivery Time Slot
                            </label>
                            <input
                                type='text'
                                value={formData.delivery_timing_lunch}
                                onChange={(e) => setFormData({ ...formData, delivery_timing_lunch: e.target.value })}
                                placeholder='12:00 PM - 02:00 PM'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>

                        <div className='md:col-span-2'>
                            <label className='block text-xs font-bold uppercase text-grey/60 mb-2'>
                                Dinner Delivery Time Slot
                            </label>
                            <input
                                type='text'
                                value={formData.delivery_timing_dinner}
                                onChange={(e) => setFormData({ ...formData, delivery_timing_dinner: e.target.value })}
                                placeholder='07:30 PM - 09:30 PM'
                                className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                            />
                        </div>
                    </div>
                </div>

                {/* Save Bar */}
                <div className='flex justify-end sticky bottom-6 z-20'>
                    <button
                        type='submit'
                        disabled={saveMutation.isPending || uploading}
                        className='px-10 py-4 bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center gap-3 disabled:opacity-50 cursor-pointer text-base'
                    >
                        {saveMutation.isPending ? (
                            <>
                                <Icon icon='line-md:loading-loop' className='text-2xl' />
                                <span>Saving Configuration...</span>
                            </>
                        ) : (
                            <>
                                <Icon icon='ion:save-outline' className='text-2xl' />
                                <span>Save All Website Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
