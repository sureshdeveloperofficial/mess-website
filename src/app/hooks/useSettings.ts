'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface WebsiteSettingsData {
    // Brand
    restaurant_name?: string
    site_tagline?: string
    site_bio?: string
    site_logo?: string
    site_favicon?: string

    // Hero Section
    hero_slider_images?: string[]
    hero_floating_image_1?: string
    hero_floating_image_2?: string
    hero_promise_title?: string
    hero_promise_subtitle?: string

    // Section Images (About / Chef)
    cook_main_image?: string
    cook_accent_image?: string
    cook_badge_text?: string
    cook_heading?: string
    cook_description_1?: string
    cook_description_2?: string

    // Signature Dishes Gallery
    gallery_badge_text?: string
    gallery_heading?: string
    gallery_subtitle?: string
    gallery_items?: Array<{
        name: string
        src: string
        price?: string
        link?: string
    }>

    // Promo / Banners
    promo_banner_image?: string
    app_download_banner_image?: string

    // Contact & Social
    contact_phone?: string
    contact_whatsapp?: string
    contact_email?: string
    contact_address?: string
    social_facebook?: string
    social_instagram?: string
    social_twitter?: string
    social_youtube?: string

    // Operations
    currency?: string
    tax_rate?: string
    delivery_charge?: string
    delivery_timing_lunch?: string
    delivery_timing_dinner?: string

    [key: string]: any
}

export function useSettings() {
    return useQuery<WebsiteSettingsData>({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await axios.get('/api/settings?t=' + Date.now())
            const data = res.data || {}

            // Parse hero_slider_images if string
            if (typeof data.hero_slider_images === 'string') {
                try {
                    data.hero_slider_images = JSON.parse(data.hero_slider_images)
                } catch {
                    data.hero_slider_images = []
                }
            }

            // Parse gallery_items if string
            if (typeof data.gallery_items === 'string') {
                try {
                    data.gallery_items = JSON.parse(data.gallery_items)
                } catch {
                    data.gallery_items = []
                }
            }

            return data
        },
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: 'always',
    })
}
