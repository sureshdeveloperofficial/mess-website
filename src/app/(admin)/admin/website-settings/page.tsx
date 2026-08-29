'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings, WebsiteSettingsData } from '@/app/hooks/useSettings'

interface GalleryItem {
    id?: string
    name: string
    src: string
    price?: string
    link?: string
}

const DEFAULT_SLIDER_IMAGES = [
    '/images/hero/close-up-appetizing-ramadan-meal.jpg',
    '/images/hero/flat-lay-indian-food-frame.jpg',
    '/images/hero/idli-vada-with-sambar-chutney.jpg',
    '/images/hero/massaman-curry-frying-pan-with-spices-cement-floor.jpg'
]

const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
    { name: 'Nandan Ghee Rice', price: '14', src: '/images/food/biryani_premium.png' },
    { name: 'Special Biryani', price: '15', src: '/images/food/biryani.png' },
    { name: 'Malabar Parotta', price: '10', src: '/images/food/parotta.png' },
    { name: 'Spicy Fish Curry', price: '14', src: '/images/food/fish_curry.png' },
    { name: 'Traditional Kerala Thali', price: '12', src: '/images/food/thali.png' },
    { name: 'Lacy Appam Set', price: '8', src: '/images/food/appetizer.png' },
]

function WebsiteSettingsContent() {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')

    const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'sections' | 'gallery' | 'operations'>(
        (tabParam as any) || 'branding'
    )

    const [justSaved, setJustSaved] = useState(false)
    const [uploadingTarget, setUploadingTarget] = useState<string | null>(null)

    // Form states
    const [restaurantName, setRestaurantName] = useState('PREMIUM MESS')
    const [siteTagline, setSiteTagline] = useState('Authentic Home-Style Meals Served Daily with Love')
    const [siteBio, setSiteBio] = useState('Authentic home-style meals served daily with love. High quality, hygienic, and nutritious dining for every guest.')
    const [siteLogo, setSiteLogo] = useState('')
    const [siteFavicon, setSiteFavicon] = useState('')

    // Hero Section
    const [heroSliderImages, setHeroSliderImages] = useState<string[]>([])
    const [heroFloating1, setHeroFloating1] = useState('/images/food/biryani_premium.png')
    const [heroFloating2, setHeroFloating2] = useState('/images/food/parotta.png')
    const [heroPromiseTitle, setHeroPromiseTitle] = useState('Tradition in Every Bite')
    const [heroPromiseSubtitle, setHeroPromiseSubtitle] = useState('Our Promise')

    // Section Images (Cook / About & Banners)
    const [cookMainImage, setCookMainImage] = useState('/images/Cook/cook.webp')
    const [cookAccentImage, setCookAccentImage] = useState('/images/food/parotta.png')
    const [cookBadgeText, setCookBadgeText] = useState('The Heart of our Mess')
    const [cookHeading, setCookHeading] = useState('Crafted with Passion, Served with Pride')
    const [promoBannerImage, setPromoBannerImage] = useState('')

    // Gallery
    const [galleryBadgeText, setGalleryBadgeText] = useState('Visual Feast')
    const [galleryHeading, setGalleryHeading] = useState('Explore Our Signature Dishes')
    const [gallerySubtitle, setGallerySubtitle] = useState(
        'Explore our signature dishes at our restaurants - Malabari Restaurant, Frij Al Murar, Naif, Dubai. Al Shamil Restaurants & Cafeteria, Madina Mall Food Court & Premium Chef Restaurant, Near Galadari Driving Centre - Al Qusais Industrial Area 4 - Dubai'
    )
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])

    // Contact & Operations
    const [contactPhone, setContactPhone] = useState('+971 4 264 2613')
    const [contactWhatsapp, setContactWhatsapp] = useState('+971 50 123 4567')
    const [contactEmail, setContactEmail] = useState('contact@chefs-kitchen.com')
    const [contactAddress, setContactAddress] = useState('Al Nahda & Deira, Dubai, United Arab Emirates')
    const [socialFacebook, setSocialFacebook] = useState('https://facebook.com')
    const [socialInstagram, setSocialInstagram] = useState('https://instagram.com')
    const [socialTwitter, setSocialTwitter] = useState('https://twitter.com')
    const [socialYoutube, setSocialYoutube] = useState('https://youtube.com')
    const [currency, setCurrency] = useState('AED')
    const [taxRate, setTaxRate] = useState('5')
    const [deliveryCharge, setDeliveryCharge] = useState('0.00')
    const [deliveryTimingLunch, setDeliveryTimingLunch] = useState('12:00 PM - 02:00 PM')
    const [deliveryTimingDinner, setDeliveryTimingDinner] = useState('07:30 PM - 09:30 PM')

    // Multi-selection states
    const [selectedHeroSlides, setSelectedHeroSlides] = useState<number[]>([])
    const [selectedGalleryItems, setSelectedGalleryItems] = useState<number[]>([])

    // Drag-to-reorder states
    const [draggedHeroIndex, setDraggedHeroIndex] = useState<number | null>(null)
    const [dragOverHeroIndex, setDragOverHeroIndex] = useState<number | null>(null)

    const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null)
    const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState<number | null>(null)

    const { data: settings, isLoading } = useSettings()

    useEffect(() => {
        if (tabParam && ['branding', 'hero', 'sections', 'gallery', 'operations'].includes(tabParam)) {
            setActiveTab(tabParam as any)
        }
    }, [tabParam])

    useEffect(() => {
        if (settings) {
            const rawName = settings.restaurant_name || settings.site_name || 'PREMIUM MESS'
            const cleanName = rawName.toLowerCase().includes('shamil') ? 'PREMIUM MESS' : rawName
            setRestaurantName(cleanName)
            setSiteTagline(settings.site_tagline || 'Authentic Home-Style Meals Served Daily with Love')
            setSiteBio(settings.site_bio || 'Authentic home-style meals served daily with love. High quality, hygienic, and nutritious dining for every guest.')
            setSiteLogo(settings.site_logo || '')
            setSiteFavicon(settings.site_favicon || '')

            // Hero Slider Images
            if (Array.isArray(settings.hero_slider_images) && settings.hero_slider_images.length > 0) {
                setHeroSliderImages(settings.hero_slider_images)
            } else if (settings.hero_slider_images && typeof settings.hero_slider_images === 'string') {
                try {
                    const parsed = JSON.parse(settings.hero_slider_images)
                    if (Array.isArray(parsed) && parsed.length > 0) setHeroSliderImages(parsed)
                } catch { }
            }

            setHeroFloating1(settings.hero_floating_image_1 || '/images/food/biryani_premium.png')
            setHeroFloating2(settings.hero_floating_image_2 || '/images/food/parotta.png')
            setHeroPromiseTitle(settings.hero_promise_title || 'Tradition in Every Bite')
            setHeroPromiseSubtitle(settings.hero_promise_subtitle || 'Our Promise')

            // Section Images
            setCookMainImage(settings.cook_main_image || '/images/Cook/cook.webp')
            setCookAccentImage(settings.cook_accent_image || '/images/food/parotta.png')
            setCookBadgeText(settings.cook_badge_text || 'The Heart of our Mess')
            setCookHeading(settings.cook_heading || 'Crafted with Passion, Served with Pride')
            setPromoBannerImage(settings.promo_banner_image || '')

            // Gallery
            setGalleryBadgeText(settings.gallery_badge_text || 'Visual Feast')
            setGalleryHeading(settings.gallery_heading || 'Explore Our Signature Dishes')
            setGallerySubtitle(
                settings.gallery_subtitle ||
                'Explore our signature dishes at our restaurants - Malabari Restaurant, Frij Al Murar, Naif, Dubai. Al Shamil Restaurants & Cafeteria, Madina Mall Food Court & Premium Chef Restaurant, Near Galadari Driving Centre - Al Qusais Industrial Area 4 - Dubai'
            )
            if (Array.isArray(settings.gallery_items) && settings.gallery_items.length > 0) {
                setGalleryItems(settings.gallery_items)
            } else {
                setGalleryItems(DEFAULT_GALLERY_ITEMS)
            }

            // Operations
            setContactPhone(settings.contact_phone || '+971 4 264 2613')
            setContactWhatsapp(settings.contact_whatsapp || '+971 50 123 4567')
            setContactEmail(settings.contact_email || 'contact@chefs-kitchen.com')
            setContactAddress(settings.contact_address || 'Al Nahda & Deira, Dubai, United Arab Emirates')
            setSocialFacebook(settings.social_facebook || 'https://facebook.com')
            setSocialInstagram(settings.social_instagram || 'https://instagram.com')
            setSocialTwitter(settings.social_twitter || 'https://twitter.com')
            setSocialYoutube(settings.social_youtube || 'https://youtube.com')
            setCurrency(settings.currency || 'AED')
            setTaxRate(settings.tax_rate || '5')
            setDeliveryCharge(settings.delivery_charge || '0.00')
            setDeliveryTimingLunch(settings.delivery_timing_lunch || '12:00 PM - 02:00 PM')
            setDeliveryTimingDinner(settings.delivery_timing_dinner || '07:30 PM - 09:30 PM')
        }
    }, [settings])

    // Single upload helper
    const handleFileUpload = async (file: File, onUploaded: (url: string) => void, targetId: string) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (PNG, JPG, WebP, SVG)')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        setUploadingTarget(targetId)

        try {
            const res = await axios.post('/api/upload', formData)
            const uploadedUrl = res.data.secure_url || res.data.path || res.data.url
            onUploaded(uploadedUrl)
            toast.success('Image uploaded to DigitalOcean Spaces! Remember to Save changes.')
        } catch (error: any) {
            console.error('Image upload error:', error)
            toast.error(error.response?.data?.error || 'Failed to upload image')
        } finally {
            setUploadingTarget(null)
        }
    }

    // Multiple batch upload helper
    const handleMultipleFilesUpload = async (
        files: FileList | File[],
        onUploadedUrls: (urls: string[]) => void,
        targetId: string
    ) => {
        const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))
        if (fileArray.length === 0) {
            toast.error('Please select valid image files (PNG, JPG, WebP, SVG)')
            return
        }

        const formData = new FormData()
        fileArray.forEach(file => {
            formData.append('files', file)
        })

        setUploadingTarget(targetId)
        const toastId = toast.loading(`Uploading ${fileArray.length} image(s) to DigitalOcean Spaces...`)

        try {
            const res = await axios.post('/api/upload', formData)
            const urls: string[] = res.data.urls || (res.data.path ? [res.data.path] : [])
            if (urls.length > 0) {
                onUploadedUrls(urls)
                toast.success(`Successfully uploaded ${urls.length} images to DigitalOcean Spaces! Click Save to apply.`, { id: toastId })
            } else {
                toast.error('No images returned from upload', { id: toastId })
            }
        } catch (error: any) {
            console.error('Multiple upload error:', error)
            toast.error(error.response?.data?.error || 'Failed to upload images', { id: toastId })
        } finally {
            setUploadingTarget(null)
        }
    }

    // Save All Settings
    const [saving, setSaving] = useState(false)
    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setSaving(true)

        const payload: Record<string, string> = {
            restaurant_name: restaurantName,
            site_tagline: siteTagline,
            site_bio: siteBio,
            site_logo: siteLogo,
            site_favicon: siteFavicon,

            // Hero Section Media
            hero_slider_images: JSON.stringify(heroSliderImages),
            hero_floating_image_1: heroFloating1,
            hero_floating_image_2: heroFloating2,
            hero_promise_title: heroPromiseTitle,
            hero_promise_subtitle: heroPromiseSubtitle,

            // Cook Section Media
            cook_main_image: cookMainImage,
            cook_accent_image: cookAccentImage,
            cook_badge_text: cookBadgeText,
            cook_heading: cookHeading,
            promo_banner_image: promoBannerImage,

            // Gallery
            gallery_badge_text: galleryBadgeText,
            gallery_heading: galleryHeading,
            gallery_subtitle: gallerySubtitle,
            gallery_items: JSON.stringify(galleryItems),

            // Operations & Contacts
            contact_phone: contactPhone,
            contact_whatsapp: contactWhatsapp,
            contact_email: contactEmail,
            contact_address: contactAddress,
            social_facebook: socialFacebook,
            social_instagram: socialInstagram,
            social_twitter: socialTwitter,
            social_youtube: socialYoutube,
            currency: currency,
            tax_rate: taxRate,
            delivery_charge: deliveryCharge,
            delivery_timing_lunch: deliveryTimingLunch,
            delivery_timing_dinner: deliveryTimingDinner,
        }

        try {
            await axios.post('/api/settings', { settings: payload })
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            setJustSaved(true)
            toast.success('Website configuration & media updated successfully!')
            setTimeout(() => setJustSaved(false), 4500)
        } catch (err: any) {
            console.error('Save error:', err)
            toast.error(err.response?.data?.error || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    // Hero Slider helpers
    const addHeroSlide = (url: string) => {
        if (!url.trim()) return
        setHeroSliderImages(prev => [...prev, url.trim()])
    }

    const removeHeroSlide = (index: number) => {
        setHeroSliderImages(prev => prev.filter((_, i) => i !== index))
        setSelectedHeroSlides(prev => prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i)))
    }

    const moveHeroSlide = (from: number, to: number) => {
        if (to < 0 || to >= heroSliderImages.length) return
        setHeroSliderImages(prev => {
            const copy = [...prev]
            const [moved] = copy.splice(from, 1)
            copy.splice(to, 0, moved)
            return copy
        })
    }

    // Hero Multi-Select & Bulk Delete
    const toggleSelectHeroSlide = (index: number) => {
        setSelectedHeroSlides(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const selectAllHeroSlides = () => {
        setSelectedHeroSlides(heroSliderImages.map((_, i) => i))
    }

    const deselectAllHeroSlides = () => {
        setSelectedHeroSlides([])
    }

    const deleteSelectedHeroSlides = () => {
        if (selectedHeroSlides.length === 0) return
        const count = selectedHeroSlides.length
        setHeroSliderImages(prev => prev.filter((_, i) => !selectedHeroSlides.includes(i)))
        setSelectedHeroSlides([])
        toast.success(`Removed ${count} slide(s). Click Save to apply changes.`)
    }

    // Hero Drag & Drop Handlers
    const handleHeroDragStart = (e: React.DragEvent, index: number) => {
        setDraggedHeroIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
    }

    const handleHeroDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragOverHeroIndex !== index) {
            setDragOverHeroIndex(index)
        }
    }

    const handleHeroDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (draggedHeroIndex === null || draggedHeroIndex === dropIndex) {
            setDraggedHeroIndex(null)
            setDragOverHeroIndex(null)
            return
        }

        setHeroSliderImages(prev => {
            const updated = [...prev]
            const [movedItem] = updated.splice(draggedHeroIndex, 1)
            updated.splice(dropIndex, 0, movedItem)
            return updated
        })

        setSelectedHeroSlides([])
        setDraggedHeroIndex(null)
        setDragOverHeroIndex(null)
        toast.success('Slide order updated! Remember to Save.')
    }

    const handleHeroDragEnd = () => {
        setDraggedHeroIndex(null)
        setDragOverHeroIndex(null)
    }

    // Gallery helpers
    const addGalleryItem = () => {
        const newItem: GalleryItem = {
            name: 'Signature Dish',
            src: 'https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/images/food/biryani_premium.png'
        }
        setGalleryItems(prev => [...prev, newItem])
    }

    const updateGalleryItem = (index: number, field: keyof GalleryItem, value: string) => {
        setGalleryItems(prev => {
            const copy = [...prev]
            copy[index] = { ...copy[index], [field]: value }
            return copy
        })
    }

    const removeGalleryItem = (index: number) => {
        setGalleryItems(prev => prev.filter((_, i) => i !== index))
        setSelectedGalleryItems(prev => prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i)))
    }

    // Gallery Multi-Select & Bulk Delete
    const toggleSelectGalleryItem = (index: number) => {
        setSelectedGalleryItems(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const selectAllGalleryItems = () => {
        setSelectedGalleryItems(galleryItems.map((_, i) => i))
    }

    const deselectAllGalleryItems = () => {
        setSelectedGalleryItems([])
    }

    const deleteSelectedGalleryItems = () => {
        if (selectedGalleryItems.length === 0) return
        const count = selectedGalleryItems.length
        setGalleryItems(prev => prev.filter((_, i) => !selectedGalleryItems.includes(i)))
        setSelectedGalleryItems([])
        toast.success(`Removed ${count} dish(es). Click Save to apply changes.`)
    }

    // Gallery Drag & Drop Handlers
    const handleGalleryDragStart = (e: React.DragEvent, index: number) => {
        setDraggedGalleryIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
    }

    const handleGalleryDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragOverGalleryIndex !== index) {
            setDragOverGalleryIndex(index)
        }
    }

    const handleGalleryDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (draggedGalleryIndex === null || draggedGalleryIndex === dropIndex) {
            setDraggedGalleryIndex(null)
            setDragOverGalleryIndex(null)
            return
        }

        setGalleryItems(prev => {
            const updated = [...prev]
            const [movedItem] = updated.splice(draggedGalleryIndex, 1)
            updated.splice(dropIndex, 0, movedItem)
            return updated
        })

        setSelectedGalleryItems([])
        setDraggedGalleryIndex(null)
        setDragOverGalleryIndex(null)
        toast.success('Dish order updated! Remember to Save.')
    }

    const handleGalleryDragEnd = () => {
        setDraggedGalleryIndex(null)
        setDragOverGalleryIndex(null)
    }

    return (
        <div className='max-w-6xl mx-auto space-y-8 pb-20'>
            {/* Header Title */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title text-2.5xl font-black text-grey-dark flex items-center gap-3'>
                        <span className='w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl'>
                            <Icon icon='solar:palette-bold-duotone' />
                        </span>
                        Website &amp; Dynamic Media Manager
                    </h1>
                    <p className='admin-page-subtitle text-sm text-grey-muted mt-1'>
                        Manage brand assets, hero carousel sliders, section photos, and signature galleries across your website in real-time.
                    </p>
                </div>

                <button
                    type='button'
                    onClick={() => handleSave()}
                    disabled={saving || !!uploadingTarget}
                    className='px-7 py-3.5 bg-primary hover:bg-primary/90 active:scale-95 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer text-sm shrink-0'
                >
                    {saving ? (
                        <>
                            <Icon icon='line-md:loading-loop' className='text-xl' />
                            <span>Saving Changes...</span>
                        </>
                    ) : (
                        <>
                            <Icon icon='solar:diskette-bold' className='text-xl' />
                            <span>Save All Changes</span>
                        </>
                    )}
                </button>
            </div>

            {/* Saved Success Notification */}
            {justSaved && (
                <div className='bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-fade-in shadow-xs'>
                    <Icon icon='solar:check-circle-bold' className='text-2xl text-green-600 shrink-0' />
                    <div>
                        <p className='font-extrabold'>Changes published successfully!</p>
                        <p className='text-xs text-green-700 font-medium'>Live website hero sliders, section images, and content are now synchronized.</p>
                    </div>
                </div>
            )}

            {/* Modern Tab Navigation */}
            <div className='bg-white p-2 rounded-2xl border border-grey/10 shadow-xs flex flex-wrap gap-2'>
                {[
                    { id: 'branding', label: 'Brand & Identity', icon: 'solar:shop-bold-duotone', desc: 'Logo & Name' },
                    { id: 'hero', label: 'Hero & Slider Images', icon: 'solar:gallery-wide-bold-duotone', badge: heroSliderImages.length, desc: 'Banners' },
                    { id: 'sections', label: 'Section Images', icon: 'solar:chef-hat-bold-duotone', desc: 'Chef & About' },
                    { id: 'gallery', label: 'Signature Dishes', icon: 'solar:plate-bold-duotone', badge: galleryItems.length, desc: 'Food Grid' },
                    { id: 'operations', label: 'Contact & Store', icon: 'solar:phone-calling-rounded-bold-duotone', desc: 'Hours & Info' },
                ].map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type='button'
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 min-w-[170px] px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${isActive
                                ? 'bg-primary text-grey-dark shadow-md shadow-primary/20 scale-[1.01]'
                                : 'text-grey-muted hover:bg-grey/5 hover:text-grey-dark'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${isActive ? 'bg-white text-grey-dark shadow-xs' : 'bg-grey/10 text-grey-dark'}`}>
                                <Icon icon={tab.icon} />
                            </div>
                            <div className='text-left'>
                                <div className='flex items-center gap-1.5'>
                                    <span className='font-extrabold'>{tab.label}</span>
                                    {tab.badge !== undefined && (
                                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${isActive ? 'bg-grey-dark text-white' : 'bg-primary/20 text-primary'}`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] block ${isActive ? 'text-grey-dark/70 font-semibold' : 'text-grey-muted'}`}>{tab.desc}</span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* TAB CONTENT AREAS */}
            <form onSubmit={handleSave} className='space-y-8'>
                {/* 1. BRAND & IDENTITY TAB */}
                {activeTab === 'branding' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <div className='border-b border-grey/10 pb-4 flex items-center justify-between'>
                                <div>
                                    <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5'>
                                        <Icon icon='solar:gallery-wide-bold-duotone' className='text-primary text-2xl' />
                                        Brand Logo &amp; Identity
                                    </h2>
                                    <p className='text-xs text-grey-muted mt-0.5'>Configure your main restaurant logo and site identity.</p>
                                </div>
                                {isLoading && <span className='text-xs text-grey-muted animate-pulse'>Loading active configuration...</span>}
                            </div>

                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
                                {/* Logo Upload Box */}
                                <div className='space-y-3'>
                                    <label className='block text-xs font-black uppercase tracking-wider text-grey-dark/70'>
                                        Website Logo (Header &amp; Footer)
                                    </label>
                                    
                                    <div className='border-2 border-dashed border-grey/20 hover:border-primary/50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-grey/5 relative group min-h-[200px]'>
                                        {siteLogo ? (
                                            <div className='space-y-3 w-full flex flex-col items-center'>
                                                <div className='p-4 bg-white rounded-xl shadow-xs border border-grey/10 max-h-32 flex items-center justify-center max-w-full'>
                                                    <img src={siteLogo} alt='Website Logo' className='max-h-24 max-w-full object-contain' />
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <label className='px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-extrabold cursor-pointer transition-all'>
                                                        Change Logo
                                                        <input
                                                            type='file'
                                                            accept='image/*'
                                                            className='hidden'
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleFileUpload(file, setSiteLogo, 'logo')
                                                            }}
                                                        />
                                                    </label>
                                                    <button
                                                        type='button'
                                                        onClick={() => setSiteLogo('')}
                                                        className='px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-extrabold transition-all'
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='space-y-3 flex flex-col items-center'>
                                                <div className='w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl'>
                                                    {uploadingTarget === 'logo' ? <Icon icon='line-md:loading-loop' /> : <Icon icon='solar:upload-track-2-bold-duotone' />}
                                                </div>
                                                <div>
                                                    <p className='text-xs font-bold text-grey-dark'>
                                                        {uploadingTarget === 'logo' ? 'Uploading to DigitalOcean Spaces...' : 'Upload Brand Logo'}
                                                    </p>
                                                    <p className='text-[10px] text-grey-muted mt-0.5'>PNG, SVG, JPG, WebP up to 15MB</p>
                                                </div>
                                                <label className='px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer'>
                                                    Choose File
                                                    <input
                                                        type='file'
                                                        accept='image/*'
                                                        className='hidden'
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) handleFileUpload(file, setSiteLogo, 'logo')
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-[10px] font-bold uppercase text-grey-muted mb-1'>
                                            Or Paste Logo Direct Image URL
                                        </label>
                                        <input
                                            type='url'
                                            value={siteLogo}
                                            onChange={(e) => setSiteLogo(e.target.value)}
                                            placeholder='https://rythmtechnical.sgp1.digitaloceanspaces.com/mess_website/logo.png'
                                            className='w-full px-3 py-2 bg-grey/5 border border-grey/10 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                </div>

                                {/* Brand Name & Descriptions */}
                                <div className='lg:col-span-2 space-y-4'>
                                    <div>
                                        <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                            Restaurant Brand Name *
                                        </label>
                                        <input
                                            type='text'
                                            required
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                            placeholder='PREMIUM MESS'
                                            className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                            Brand Tagline / Slogan
                                        </label>
                                        <input
                                            type='text'
                                            value={siteTagline}
                                            onChange={(e) => setSiteTagline(e.target.value)}
                                            placeholder='Authentic Home-Style Meals Served Daily with Love'
                                            className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                            About Bio (Footer &amp; About Description)
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={siteBio}
                                            onChange={(e) => setSiteBio(e.target.value)}
                                            placeholder='Authentic home-style meals served daily with love...'
                                            className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. HERO & SLIDER IMAGES TAB */}
                {activeTab === 'hero' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='space-y-8'>
                        {/* Hero Slider Management */}
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between border-b border-grey/10 pb-4 gap-4'>
                                <div>
                                    <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5'>
                                        <Icon icon='solar:slider-vertical-bold-duotone' className='text-primary text-2xl' />
                                        Hero Rotating Image Slider
                                    </h2>
                                    <p className='text-xs text-grey-muted mt-0.5'>
                                        Upload and manage background dish photos that rotate every 5 seconds on the homepage Hero section.
                                    </p>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <label className='px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20 transition-all active:scale-95'>
                                        {uploadingTarget === 'hero-slide-new' ? (
                                            <Icon icon='line-md:loading-loop' className='text-lg' />
                                        ) : (
                                            <Icon icon='solar:upload-track-2-bold' className='text-lg' />
                                        )}
                                        <span>Upload Multiple Slides</span>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            multiple
                                            className='hidden'
                                            disabled={!!uploadingTarget}
                                            onChange={(e) => {
                                                const files = e.target.files
                                                if (files && files.length > 0) {
                                                    handleMultipleFilesUpload(
                                                        files,
                                                        (urls) => setHeroSliderImages(prev => [...prev, ...urls]),
                                                        'hero-slide-new'
                                                    )
                                                }
                                                e.target.value = ''
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Batch Drag & Drop Upload Zone */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    const files = e.dataTransfer.files
                                    if (files && files.length > 0) {
                                        handleMultipleFilesUpload(
                                            files,
                                            (urls) => setHeroSliderImages(prev => [...prev, ...urls]),
                                            'hero-slide-new'
                                        )
                                    }
                                }}
                                className='p-6 border-2 border-dashed border-primary/40 hover:border-primary bg-[#FFFDF5] rounded-3xl text-center space-y-2 group transition-all cursor-pointer'
                                onClick={() => {
                                    const input = document.getElementById('heroMultiFileInput') as HTMLInputElement
                                    input?.click()
                                }}
                            >
                                <div className='w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto group-hover:scale-110 transition-transform'>
                                    <Icon icon='solar:cloud-upload-bold-duotone' />
                                </div>
                                <div>
                                    <p className='text-xs font-black text-grey-dark'>
                                        {uploadingTarget === 'hero-slide-new' ? 'Uploading files to DigitalOcean Spaces...' : 'Select Multiple Slide Images or Drag & Drop Here'}
                                    </p>
                                    <p className='text-[11px] text-grey-muted mt-0.5'>
                                        Hold <kbd className='px-1.5 py-0.5 bg-grey/10 rounded font-mono text-[10px]'>Ctrl</kbd> or <kbd className='px-1.5 py-0.5 bg-grey/10 rounded font-mono text-[10px]'>Shift</kbd> to pick multiple images at once (PNG, JPG, WebP)
                                    </p>
                                </div>
                                <input
                                    id='heroMultiFileInput'
                                    type='file'
                                    accept='image/*'
                                    multiple
                                    className='hidden'
                                    disabled={!!uploadingTarget}
                                    onChange={(e) => {
                                        const files = e.target.files
                                        if (files && files.length > 0) {
                                            handleMultipleFilesUpload(
                                                files,
                                                (urls) => setHeroSliderImages(prev => [...prev, ...urls]),
                                                'hero-slide-new'
                                            )
                                        }
                                        e.target.value = ''
                                    }}
                                />
                            </div>

                            {/* Hero Multi-Select Bulk Action Toolbar */}
                            {heroSliderImages.length > 0 && (
                                <div className='flex flex-wrap items-center justify-between gap-3 p-3.5 bg-grey/5 rounded-2xl border border-grey/10 text-xs'>
                                    <div className='flex items-center gap-2'>
                                        <button
                                            type='button'
                                            onClick={selectedHeroSlides.length === heroSliderImages.length ? deselectAllHeroSlides : selectAllHeroSlides}
                                            className='px-3 py-1.5 bg-white border border-grey/15 hover:border-primary rounded-xl font-bold text-grey-dark flex items-center gap-1.5 transition-all cursor-pointer'
                                        >
                                            <Icon
                                                icon={selectedHeroSlides.length === heroSliderImages.length ? 'solar:check-square-bold' : 'solar:square-minimalistic-outline'}
                                                className={selectedHeroSlides.length === heroSliderImages.length ? 'text-primary text-base' : 'text-grey-muted text-base'}
                                            />
                                            <span>{selectedHeroSlides.length === heroSliderImages.length ? 'Deselect All' : 'Select All'}</span>
                                        </button>

                                        <span className='text-grey-muted font-medium'>
                                            {selectedHeroSlides.length > 0 ? (
                                                <span className='text-primary font-black'>{selectedHeroSlides.length} of {heroSliderImages.length} selected</span>
                                            ) : (
                                                <span>{heroSliderImages.length} slides • Drag cards to reorder</span>
                                            )}
                                        </span>
                                    </div>

                                    {selectedHeroSlides.length > 0 && (
                                        <button
                                            type='button'
                                            onClick={deleteSelectedHeroSlides}
                                            className='px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95'
                                        >
                                            <Icon icon='solar:trash-bin-trash-bold' className='text-sm' />
                                            <span>Delete Selected ({selectedHeroSlides.length})</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Slides Grid */}
                            {heroSliderImages.length === 0 ? (
                                <div className='p-8 rounded-2xl border-2 border-dashed border-grey/20 text-center space-y-3 bg-grey/5'>
                                    <Icon icon='solar:gallery-bold-duotone' className='text-4xl text-grey-muted mx-auto' />
                                    <p className='text-sm font-bold text-grey-dark'>No slider images configured</p>
                                    <p className='text-xs text-grey-muted'>Upload or add image URLs below to enable dynamic rotating banner slides.</p>
                                    <button
                                        type='button'
                                        onClick={() => setHeroSliderImages(DEFAULT_SLIDER_IMAGES)}
                                        className='px-4 py-2 bg-grey-dark text-white rounded-xl text-xs font-bold'
                                    >
                                        Load Default Preset Slides
                                    </button>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                                    {heroSliderImages.map((imgUrl, index) => {
                                        const isSelected = selectedHeroSlides.includes(index)
                                        const isDragging = draggedHeroIndex === index
                                        const isDragOver = dragOverHeroIndex === index

                                        return (
                                            <div
                                                key={index}
                                                draggable
                                                onDragStart={(e) => handleHeroDragStart(e, index)}
                                                onDragOver={(e) => handleHeroDragOver(e, index)}
                                                onDrop={(e) => handleHeroDrop(e, index)}
                                                onDragEnd={handleHeroDragEnd}
                                                className={`rounded-2xl p-3 relative group transition-all shadow-xs cursor-move select-none ${
                                                    isSelected
                                                        ? 'bg-primary/5 border-2 border-primary ring-2 ring-primary/20'
                                                        : isDragOver
                                                        ? 'bg-amber-50 border-2 border-dashed border-amber-500 scale-102'
                                                        : isDragging
                                                        ? 'opacity-40 border-2 border-dashed border-grey/30 bg-grey/10'
                                                        : 'bg-[#FFFDF5] border-2 border-[#FFD54F]/30 hover:border-[#FFD54F]'
                                                }`}
                                            >
                                                <div className='aspect-4/3 rounded-xl overflow-hidden bg-grey/10 relative mb-3'>
                                                    <img
                                                        src={imgUrl}
                                                        alt={`Slide ${index + 1}`}
                                                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none'
                                                    />

                                                    {/* Slide number badge & Drag grip */}
                                                    <div className='absolute top-2 left-2 flex items-center gap-1 bg-grey-dark/85 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md'>
                                                        <Icon icon='solar:move-bold' className='text-xs text-[#FFD54F]' />
                                                        <span>Slide #{index + 1}</span>
                                                    </div>

                                                    {/* Selection Checkbox */}
                                                    <button
                                                        type='button'
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleSelectHeroSlide(index)
                                                        }}
                                                        className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md ${
                                                            isSelected
                                                                ? 'bg-primary text-white ring-2 ring-white'
                                                                : 'bg-black/60 text-white/70 hover:bg-black hover:text-white'
                                                        }`}
                                                    >
                                                        <Icon
                                                            icon={isSelected ? 'solar:check-circle-bold' : 'solar:circle-outline'}
                                                            className='text-sm'
                                                        />
                                                    </button>
                                                </div>

                                                {/* URL Input */}
                                                <input
                                                    type='text'
                                                    value={imgUrl}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        setHeroSliderImages(prev => {
                                                            const copy = [...prev]
                                                            copy[index] = val
                                                            return copy
                                                        })
                                                    }}
                                                    placeholder='Image URL'
                                                    className='w-full px-2.5 py-1.5 bg-white border border-grey/10 rounded-lg text-[11px] font-medium mb-3 focus:outline-none focus:ring-1 focus:ring-primary'
                                                    onClick={(e) => e.stopPropagation()}
                                                />

                                                {/* Action Buttons */}
                                                <div className='flex items-center justify-between gap-1'>
                                                    <div className='flex items-center gap-1'>
                                                        <button
                                                            type='button'
                                                            disabled={index === 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveHeroSlide(index, index - 1)
                                                            }}
                                                            title='Move Left'
                                                            className='p-1.5 bg-white hover:bg-grey/10 disabled:opacity-30 rounded-lg text-grey-dark text-xs border border-grey/10 cursor-pointer'
                                                        >
                                                            <Icon icon='solar:arrow-left-bold' />
                                                        </button>
                                                        <button
                                                            type='button'
                                                            disabled={index === heroSliderImages.length - 1}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                moveHeroSlide(index, index + 1)
                                                            }}
                                                            title='Move Right'
                                                            className='p-1.5 bg-white hover:bg-grey/10 disabled:opacity-30 rounded-lg text-grey-dark text-xs border border-grey/10 cursor-pointer'
                                                        >
                                                            <Icon icon='solar:arrow-right-bold' />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type='button'
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeHeroSlide(index)
                                                        }}
                                                        className='p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer'
                                                        title='Delete Slide'
                                                    >
                                                        <Icon icon='solar:trash-bin-trash-bold' />
                                                        <span className='text-[10px]'>Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Direct URL Add Box */}
                            <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 flex flex-col sm:flex-row items-center gap-3'>
                                <input
                                    type='url'
                                    id='newSlideUrlInput'
                                    placeholder='Or paste direct Image URL (e.g. https://res.cloudinary.com/.../banner.jpg)'
                                    className='flex-1 w-full px-4 py-2.5 bg-white border border-grey/15 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20'
                                />
                                <button
                                    type='button'
                                    onClick={() => {
                                        const input = document.getElementById('newSlideUrlInput') as HTMLInputElement
                                        if (input && input.value) {
                                            addHeroSlide(input.value)
                                            input.value = ''
                                            toast.success('Slide added from URL')
                                        }
                                    }}
                                    className='w-full sm:w-auto px-5 py-2.5 bg-grey-dark text-white rounded-xl text-xs font-bold hover:bg-black transition-all shrink-0'
                                >
                                    Add Slide URL
                                </button>
                            </div>
                        </div>

                        {/* Floating Decorative Dishes in Hero */}
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <div className='border-b border-grey/10 pb-4'>
                                <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5'>
                                    <Icon icon='solar:plate-bold-duotone' className='text-primary text-2xl' />
                                    Hero Floating Decorative Food Badges
                                </h2>
                                <p className='text-xs text-grey-muted mt-0.5'>Customize the floating 3D food plates and promise badge on the Hero section.</p>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {/* Floating Dish 1 */}
                                <div className='p-5 bg-grey/5 rounded-2xl border border-grey/10 space-y-3'>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70'>
                                        Top-Right Floating Dish (e.g. Biryani Plate)
                                    </label>
                                    <div className='flex items-center gap-4'>
                                        <div className='w-20 h-20 rounded-full bg-white border-2 border-primary/30 overflow-hidden shrink-0 shadow-sm flex items-center justify-center'>
                                            <img src={heroFloating1} alt='Dish 1' className='w-full h-full object-cover' />
                                        </div>
                                        <div className='flex-1 space-y-2'>
                                            <input
                                                type='text'
                                                value={heroFloating1}
                                                onChange={(e) => setHeroFloating1(e.target.value)}
                                                className='w-full px-3 py-2 bg-white border border-grey/10 rounded-xl text-xs font-medium'
                                                placeholder='/images/food/biryani_premium.png'
                                            />
                                            <label className='inline-block px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold cursor-pointer'>
                                                Upload Dish Image
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    className='hidden'
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleFileUpload(file, setHeroFloating1, 'float-1')
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Dish 2 */}
                                <div className='p-5 bg-grey/5 rounded-2xl border border-grey/10 space-y-3'>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70'>
                                        Bottom-Left Floating Dish (e.g. Parotta Plate)
                                    </label>
                                    <div className='flex items-center gap-4'>
                                        <div className='w-20 h-20 rounded-full bg-white border-2 border-primary/30 overflow-hidden shrink-0 shadow-sm flex items-center justify-center'>
                                            <img src={heroFloating2} alt='Dish 2' className='w-full h-full object-cover' />
                                        </div>
                                        <div className='flex-1 space-y-2'>
                                            <input
                                                type='text'
                                                value={heroFloating2}
                                                onChange={(e) => setHeroFloating2(e.target.value)}
                                                className='w-full px-3 py-2 bg-white border border-grey/10 rounded-xl text-xs font-medium'
                                                placeholder='/images/food/parotta.png'
                                            />
                                            <label className='inline-block px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold cursor-pointer'>
                                                Upload Dish Image
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    className='hidden'
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleFileUpload(file, setHeroFloating2, 'float-2')
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 3. SECTION IMAGES TAB (CHEF & ABOUT US) */}
                {activeTab === 'sections' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='space-y-8'>
                        {/* Cook / About Us Section */}
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <div className='border-b border-grey/10 pb-4'>
                                <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5'>
                                    <Icon icon='solar:chef-hat-bold-duotone' className='text-primary text-2xl' />
                                    About Us &amp; Master Chef Section ("The Heart of our Mess")
                                </h2>
                                <p className='text-xs text-grey-muted mt-0.5'>Update the main featured chef/kitchen photograph and floating accent badges.</p>
                            </div>

                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                                {/* Main Cook Image */}
                                <div className='space-y-4 p-6 bg-grey/5 rounded-2xl border border-grey/10'>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70'>
                                        Main Featured Photo (Chef / Kitchen)
                                    </label>
                                    <div className='aspect-4/3 rounded-2xl overflow-hidden bg-white border-2 border-primary/20 relative shadow-sm'>
                                        <img src={cookMainImage} alt='Cook Main' className='w-full h-full object-cover' />
                                        <label className='absolute bottom-3 right-3 bg-grey-dark/90 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md'>
                                            <Icon icon='solar:camera-bold' />
                                            <span>Change Photo</span>
                                            <input
                                                type='file'
                                                accept='image/*'
                                                className='hidden'
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleFileUpload(file, setCookMainImage, 'cook-main')
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <div className='space-y-2'>
                                        <input
                                            type='text'
                                            value={cookMainImage}
                                            onChange={(e) => setCookMainImage(e.target.value)}
                                            placeholder='/images/Cook/cook.webp'
                                            className='w-full px-3 py-2 bg-white border border-grey/10 rounded-xl text-xs font-medium'
                                        />
                                    </div>
                                </div>

                                {/* Accent Badges & Content */}
                                <div className='space-y-4 p-6 bg-grey/5 rounded-2xl border border-grey/10'>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70'>
                                        Accent Floating Dish Badge
                                    </label>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='w-24 h-24 rounded-full bg-white border-2 border-primary/30 overflow-hidden shrink-0 shadow-sm flex items-center justify-center'>
                                            <img src={cookAccentImage} alt='Accent' className='w-full h-full object-cover' />
                                        </div>
                                        <div className='flex-1 space-y-2'>
                                            <input
                                                type='text'
                                                value={cookAccentImage}
                                                onChange={(e) => setCookAccentImage(e.target.value)}
                                                className='w-full px-3 py-2 bg-white border border-grey/10 rounded-xl text-xs font-medium'
                                                placeholder='/images/food/parotta.png'
                                            />
                                            <label className='inline-block px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold cursor-pointer'>
                                                Upload Accent Image
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    className='hidden'
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleFileUpload(file, setCookAccentImage, 'cook-accent')
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className='space-y-3 pt-2 border-t border-grey/10'>
                                        <div>
                                            <label className='block text-[11px] font-bold text-grey-dark/70 mb-1'>Section Top Badge</label>
                                            <input
                                                type='text'
                                                value={cookBadgeText}
                                                onChange={(e) => setCookBadgeText(e.target.value)}
                                                className='w-full px-3 py-2 bg-white border border-grey/10 rounded-xl text-xs font-medium'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-[11px] font-bold text-grey-dark/70 mb-1'>Section Main Heading</label>
                                            <input
                                                type='text'
                                                value={cookHeading}
                                                onChange={(e) => setCookHeading(e.target.value)}
                                                className='w-full px-3 py-2 bg-white border border-grey/10 rounded-xl text-xs font-medium'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 4. SIGNATURE DISHES GALLERY TAB */}
                {activeTab === 'gallery' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between border-b border-grey/10 pb-4 gap-4'>
                                <div>
                                    <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5'>
                                        <Icon icon='solar:plate-bold-duotone' className='text-primary text-2xl' />
                                        Signature Dishes &amp; Visual Feast Gallery
                                    </h2>
                                    <p className='text-xs text-grey-muted mt-0.5'>
                                        Add, customize, and manage the dish cards displayed in the "Explore Our Signature Dishes" homepage section.
                                    </p>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <label className='px-4 py-2.5 bg-grey-dark hover:bg-black text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0'>
                                        {uploadingTarget === 'gallery-batch-new' ? (
                                            <Icon icon='line-md:loading-loop' className='text-lg' />
                                        ) : (
                                            <Icon icon='solar:upload-track-2-bold' className='text-lg' />
                                        )}
                                        <span>Batch Upload Dishes</span>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            multiple
                                            className='hidden'
                                            disabled={!!uploadingTarget}
                                            onChange={(e) => {
                                                const files = e.target.files
                                                if (files && files.length > 0) {
                                                    const filesArray = Array.from(files)
                                                    handleMultipleFilesUpload(
                                                        files,
                                                        (urls) => {
                                                            const newDishes: GalleryItem[] = urls.map((url, i) => {
                                                                const fName = filesArray[i]?.name?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Signature Dish'
                                                                const formattedName = fName.charAt(0).toUpperCase() + fName.slice(1)
                                                                return {
                                                                    name: formattedName,
                                                                    src: url
                                                                }
                                                            })
                                                            setGalleryItems(prev => [...prev, ...newDishes])
                                                        },
                                                        'gallery-batch-new'
                                                    )
                                                }
                                                e.target.value = ''
                                            }}
                                        />
                                    </label>

                                    <button
                                        type='button'
                                        onClick={addGalleryItem}
                                        className='px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0'
                                    >
                                        <Icon icon='solar:add-circle-bold' className='text-lg' />
                                        <span>Add Blank Card</span>
                                    </button>
                                </div>
                            </div>

                            {/* Gallery Section Header & Subtitle Settings */}
                            <div className='p-6 bg-grey/5 rounded-2xl border border-grey/10 space-y-4'>
                                <h3 className='text-xs font-black uppercase text-grey-dark/80 flex items-center gap-2'>
                                    <Icon icon='solar:pen-bold' className='text-primary text-base' />
                                    Section Header &amp; Restaurant Locations Subtitle
                                </h3>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-[11px] font-bold text-grey-dark/70 mb-1'>Section Top Badge</label>
                                        <input
                                            type='text'
                                            value={galleryBadgeText}
                                            onChange={(e) => setGalleryBadgeText(e.target.value)}
                                            placeholder='Visual Feast'
                                            className='w-full px-3 py-2 bg-white border border-grey/15 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-[11px] font-bold text-grey-dark/70 mb-1'>Section Main Heading</label>
                                        <input
                                            type='text'
                                            value={galleryHeading}
                                            onChange={(e) => setGalleryHeading(e.target.value)}
                                            placeholder='Explore Our Signature Dishes'
                                            className='w-full px-3 py-2 bg-white border border-grey/15 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-[11px] font-bold text-grey-dark/70 mb-1'>
                                        Restaurant Branch Locations / Description Subtitle
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={gallerySubtitle}
                                        onChange={(e) => setGallerySubtitle(e.target.value)}
                                        placeholder='Explore our signature dishes at our restaurants...'
                                        className='w-full px-3 py-2 bg-white border border-grey/15 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed'
                                    />
                                    <p className='text-[10px] text-grey-muted mt-1'>
                                        This text is displayed with a location pin badge beneath the "Explore Our Signature Dishes" heading on the homepage.
                                    </p>
                                </div>
                            </div>

                            {/* Gallery Multi-Select Bulk Action Toolbar */}
                            {galleryItems.length > 0 && (
                                <div className='flex flex-wrap items-center justify-between gap-3 p-3.5 bg-grey/5 rounded-2xl border border-grey/10 text-xs'>
                                    <div className='flex items-center gap-2'>
                                        <button
                                            type='button'
                                            onClick={selectedGalleryItems.length === galleryItems.length ? deselectAllGalleryItems : selectAllGalleryItems}
                                            className='px-3 py-1.5 bg-white border border-grey/15 hover:border-primary rounded-xl font-bold text-grey-dark flex items-center gap-1.5 transition-all cursor-pointer'
                                        >
                                            <Icon
                                                icon={selectedGalleryItems.length === galleryItems.length ? 'solar:check-square-bold' : 'solar:square-minimalistic-outline'}
                                                className={selectedGalleryItems.length === galleryItems.length ? 'text-primary text-base' : 'text-grey-muted text-base'}
                                            />
                                            <span>{selectedGalleryItems.length === galleryItems.length ? 'Deselect All' : 'Select All'}</span>
                                        </button>

                                        <span className='text-grey-muted font-medium'>
                                            {selectedGalleryItems.length > 0 ? (
                                                <span className='text-primary font-black'>{selectedGalleryItems.length} of {galleryItems.length} selected</span>
                                            ) : (
                                                <span>{galleryItems.length} dishes • Drag cards to reorder</span>
                                            )}
                                        </span>
                                    </div>

                                    {selectedGalleryItems.length > 0 && (
                                        <button
                                            type='button'
                                            onClick={deleteSelectedGalleryItems}
                                            className='px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95'
                                        >
                                            <Icon icon='solar:trash-bin-trash-bold' className='text-sm' />
                                            <span>Delete Selected ({selectedGalleryItems.length})</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Gallery Dishes Grid */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {galleryItems.map((item, index) => {
                                    const isSelected = selectedGalleryItems.includes(index)
                                    const isDragging = draggedGalleryIndex === index
                                    const isDragOver = dragOverGalleryIndex === index

                                    return (
                                        <div
                                            key={index}
                                            draggable
                                            onDragStart={(e) => handleGalleryDragStart(e, index)}
                                            onDragOver={(e) => handleGalleryDragOver(e, index)}
                                            onDrop={(e) => handleGalleryDrop(e, index)}
                                            onDragEnd={handleGalleryDragEnd}
                                            className={`p-5 rounded-3xl transition-all shadow-xs space-y-4 cursor-move select-none ${
                                                isSelected
                                                    ? 'bg-primary/5 border-2 border-primary ring-2 ring-primary/20'
                                                    : isDragOver
                                                    ? 'bg-amber-50 border-2 border-dashed border-amber-500 scale-102'
                                                    : isDragging
                                                    ? 'opacity-40 border-2 border-dashed border-grey/30 bg-grey/10'
                                                    : 'bg-[#FFFDF5] border-2 border-[#FFD54F]/30 hover:border-[#FFD54F]'
                                            }`}
                                        >
                                            <div className='aspect-4/3 rounded-2xl overflow-hidden bg-white border border-grey/10 relative group'>
                                                <img
                                                    src={item.src}
                                                    alt={item.name}
                                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none'
                                                />

                                                {/* Dish Index Badge & Drag Grip */}
                                                <div className='absolute top-2 left-2 flex items-center gap-1 bg-grey-dark/85 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md'>
                                                    <Icon icon='solar:move-bold' className='text-xs text-[#FFD54F]' />
                                                    <span>Dish #{index + 1}</span>
                                                </div>

                                                {/* Selection Checkbox */}
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleSelectGalleryItem(index)
                                                    }}
                                                    className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md ${
                                                        isSelected
                                                            ? 'bg-primary text-white ring-2 ring-white'
                                                            : 'bg-black/60 text-white/70 hover:bg-black hover:text-white'
                                                    }`}
                                                >
                                                    <Icon
                                                        icon={isSelected ? 'solar:check-circle-bold' : 'solar:circle-outline'}
                                                        className='text-sm'
                                                    />
                                                </button>

                                                <label
                                                    onClick={(e) => e.stopPropagation()}
                                                    className='absolute bottom-2 right-2 bg-grey-dark/90 hover:bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-md'
                                                >
                                                    <Icon icon='solar:camera-bold' />
                                                    <span>Change Photo</span>
                                                    <input
                                                        type='file'
                                                        accept='image/*'
                                                        className='hidden'
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                handleFileUpload(file, (url) => updateGalleryItem(index, 'src', url), `gallery-${index}`)
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            <div className='space-y-3' onClick={(e) => e.stopPropagation()}>
                                                <div>
                                                    <label className='block text-[10px] font-black uppercase text-grey-dark/60 mb-1'>Dish Name</label>
                                                    <input
                                                        type='text'
                                                        value={item.name}
                                                        onChange={(e) => updateGalleryItem(index, 'name', e.target.value)}
                                                        placeholder='e.g. Special Biryani'
                                                        className='w-full px-3 py-2 bg-white border border-grey/15 rounded-xl text-xs font-bold'
                                                    />
                                                </div>

                                                <div>
                                                    <label className='block text-[10px] font-black uppercase text-grey-dark/60 mb-1'>Image URL</label>
                                                    <input
                                                        type='text'
                                                        value={item.src}
                                                        onChange={(e) => updateGalleryItem(index, 'src', e.target.value)}
                                                        className='w-full px-3 py-1.5 bg-white border border-grey/10 rounded-xl text-[11px] font-medium text-grey-dark/70'
                                                    />
                                                </div>

                                                <div className='flex justify-end pt-2 border-t border-grey/10'>
                                                    <button
                                                        type='button'
                                                        onClick={() => removeGalleryItem(index)}
                                                        className='px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer'
                                                    >
                                                        <Icon icon='solar:trash-bin-trash-bold' />
                                                        <span>Delete Dish</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 5. CONTACT & OPERATIONS TAB */}
                {activeTab === 'operations' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='space-y-8'>
                        {/* Contact & Location */}
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5 border-b border-grey/10 pb-4'>
                                <Icon icon='solar:phone-calling-rounded-bold-duotone' className='text-primary text-2xl' />
                                Contact &amp; Physical Store Information
                            </h2>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Primary Telephone Number *
                                    </label>
                                    <input
                                        type='text'
                                        required
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder='+971 4 264 2613'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        WhatsApp Business Ordering Number
                                    </label>
                                    <input
                                        type='text'
                                        value={contactWhatsapp}
                                        onChange={(e) => setContactWhatsapp(e.target.value)}
                                        placeholder='+971 50 123 4567'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Support / Inquiry Email *
                                    </label>
                                    <input
                                        type='email'
                                        required
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder='contact@chefs-kitchen.com'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Physical Store Address *
                                    </label>
                                    <input
                                        type='text'
                                        required
                                        value={contactAddress}
                                        onChange={(e) => setContactAddress(e.target.value)}
                                        placeholder='Al Nahda & Deira, Dubai, United Arab Emirates'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5 border-b border-grey/10 pb-4'>
                                <Icon icon='solar:share-circle-bold-duotone' className='text-primary text-2xl' />
                                Social Media Channels
                            </h2>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2 flex items-center gap-2'>
                                        <Icon icon='logos:facebook' /> Facebook Profile URL
                                    </label>
                                    <input
                                        type='url'
                                        value={socialFacebook}
                                        onChange={(e) => setSocialFacebook(e.target.value)}
                                        placeholder='https://facebook.com/yourpage'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2 flex items-center gap-2'>
                                        <Icon icon='logos:instagram-icon' /> Instagram Profile URL
                                    </label>
                                    <input
                                        type='url'
                                        value={socialInstagram}
                                        onChange={(e) => setSocialInstagram(e.target.value)}
                                        placeholder='https://instagram.com/yourpage'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2 flex items-center gap-2'>
                                        <Icon icon='fa6-brands:x-twitter' /> Twitter / X Profile URL
                                    </label>
                                    <input
                                        type='url'
                                        value={socialTwitter}
                                        onChange={(e) => setSocialTwitter(e.target.value)}
                                        placeholder='https://twitter.com/yourpage'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2 flex items-center gap-2'>
                                        <Icon icon='logos:youtube-icon' /> YouTube Channel URL
                                    </label>
                                    <input
                                        type='url'
                                        value={socialYoutube}
                                        onChange={(e) => setSocialYoutube(e.target.value)}
                                        placeholder='https://youtube.com/c/yourchannel'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Operations & Timings */}
                        <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                            <h2 className='text-xl font-black text-grey-dark flex items-center gap-2.5 border-b border-grey/10 pb-4'>
                                <Icon icon='solar:clock-circle-bold-duotone' className='text-primary text-2xl' />
                                Operations, Pricing &amp; Timings
                            </h2>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Currency Code *
                                    </label>
                                    <input
                                        type='text'
                                        required
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        placeholder='AED'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Tax / VAT Rate (%)
                                    </label>
                                    <input
                                        type='text'
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(e.target.value)}
                                        placeholder='5'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Delivery Charge ({currency})
                                    </label>
                                    <input
                                        type='text'
                                        value={deliveryCharge}
                                        onChange={(e) => setDeliveryCharge(e.target.value)}
                                        placeholder='0.00'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Lunch Delivery Slot
                                    </label>
                                    <input
                                        type='text'
                                        value={deliveryTimingLunch}
                                        onChange={(e) => setDeliveryTimingLunch(e.target.value)}
                                        placeholder='12:00 PM - 02:00 PM'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>

                                <div className='md:col-span-2'>
                                    <label className='block text-xs font-black uppercase text-grey-dark/70 mb-2'>
                                        Dinner Delivery Slot
                                    </label>
                                    <input
                                        type='text'
                                        value={deliveryTimingDinner}
                                        onChange={(e) => setDeliveryTimingDinner(e.target.value)}
                                        placeholder='07:30 PM - 09:30 PM'
                                        className='w-full px-4 py-3 bg-grey/5 border border-grey/15 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Floating Bottom Save Bar */}
                <div className='flex items-center justify-between bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-grey/10 shadow-lg sticky bottom-6 z-20'>
                    <div className='flex items-center gap-2 text-xs font-bold text-grey-muted hidden sm:flex'>
                        <Icon icon='solar:info-circle-bold' className='text-base text-primary' />
                        <span>All tab configurations are saved simultaneously.</span>
                    </div>

                    <button
                        type='submit'
                        disabled={saving || !!uploadingTarget}
                        className='px-10 py-3.5 bg-primary hover:bg-primary/90 active:scale-95 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer text-sm w-full sm:w-auto'
                    >
                        {saving ? (
                            <>
                                <Icon icon='line-md:loading-loop' className='text-xl' />
                                <span>Saving All Settings...</span>
                            </>
                        ) : (
                            <>
                                <Icon icon='solar:diskette-bold' className='text-xl' />
                                <span>Save All Settings &amp; Media</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default function WebsiteSettingsPage() {
    return (
        <Suspense fallback={
            <div className='min-h-[400px] flex items-center justify-center'>
                <Icon icon='line-md:loading-loop' className='text-4xl text-primary' />
            </div>
        }>
            <WebsiteSettingsContent />
        </Suspense>
    )
}
