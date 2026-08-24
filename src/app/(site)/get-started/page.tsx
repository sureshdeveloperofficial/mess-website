'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import { getFullImageUrl } from '@/utils/image'

type FoodItem = {
    id: string
    name: string
    image: string | null
    price: number
    category?: { name: string }
}

type MealType = {
    id: string
    name: string
    icon?: string
}

type FoodMenu = {
    id: string
    name: string
    description: string | null
    price: number
    orderNo?: number
    days?: number
    servingCount?: number
    isActive?: boolean
    availableDays?: string[]
    scheduleJson?: any
    mealType?: MealType | null
    foodItems: FoodItem[]
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const STANDARD_MEAL_SLOTS = [
    { key: 'breakfast', label: 'Breakfast', icon: 'solar:cup-hot-bold-duotone', desc: 'Morning freshly cooked breakfast' },
    { key: 'lunch', label: 'Lunch', icon: 'solar:sun-bold-duotone', desc: 'Hearty afternoon lunch meal' },
    { key: 'dinner', label: 'Dinner', icon: 'solar:moon-stars-bold-duotone', desc: 'Wholesome evening dinner meal' },
]

const DROP_LOCATIONS = [
    { value: 'Inside my room', label: 'Inside my room', icon: 'solar:door-bold-duotone' },
    { value: 'Outside my room', label: 'Outside my room', icon: 'solar:door-minimalistic-bold-duotone' },
    { value: 'Security desk', label: 'Security desk', icon: 'solar:shield-user-bold-duotone' },
    { value: 'Others', label: 'Others (Custom location)', icon: 'solar:map-point-wave-bold-duotone' },
]

function GetStartedContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlPlanId = searchParams.get('planId')
    const { data: session, status: authStatus } = useSession()

    // 1. Fetch all public food plans
    const { data: menus = [], isLoading: isMenusLoading } = useQuery<FoodMenu[]>({
        queryKey: ['public-food-plans-order'],
        queryFn: async () => {
            const response = await axios.get('/api/food-menu?activeOnly=true')
            return response.data
        },
        staleTime: 1000 * 60 * 5,
    })

    // Fetch live bank transfer and website configuration settings
    const { data: siteSettings } = useQuery<Record<string, string>>({
        queryKey: ['site-settings'],
        queryFn: async () => {
            const response = await axios.get('/api/settings')
            return response.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const [copiedField, setCopiedField] = useState<string | null>(null)
    const handleCopyText = (text: string, fieldName: string) => {
        if (!text) return
        navigator.clipboard.writeText(text)
        setCopiedField(fieldName)
        toast.success(`Copied ${fieldName} to clipboard!`, { icon: '📋' })
        setTimeout(() => setCopiedField(null), 2500)
    }

    const activePlans = useMemo(
        () =>
            menus
                .filter((m) => m.isActive !== false)
                .sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0)),
        [menus]
    )

    // Partition into Weekday Plans (Mon - Sat) and Sunday Special Plans
    const weekdayPlans = useMemo(() => {
        return activePlans
            .filter((p) => {
                const isSundayOnly = (p.availableDays?.length === 1 && p.availableDays[0] === 'Sunday') || p.name.toLowerCase().includes('sunday')
                return !isSundayOnly
            })
            .sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0))
    }, [activePlans])

    const sundayPlans = useMemo(() => {
        return activePlans
            .filter((p) => {
                const isSundayOnly = (p.availableDays?.length === 1 && p.availableDays[0] === 'Sunday') || p.name.toLowerCase().includes('sunday')
                return isSundayOnly
            })
            .sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0))
    }, [activePlans])

    // Plan Mode: 'full' (Monthly Weekday + Optional Sunday Add-on) vs 'sunday_only'
    const [planMode, setPlanMode] = useState<'full' | 'sunday_only'>('full')

    // Selected Weekday plan ID (Mon - Sat)
    const [selectedWeekdayPlanId, setSelectedWeekdayPlanId] = useState<string>('')

    // Selected Sunday Feast plan ID (null = Mon-Sat only)
    const [selectedSundayPlanId, setSelectedSundayPlanId] = useState<string | null>(null)

    // Sync selected plan from URL / default
    useEffect(() => {
        if (activePlans.length === 0) return

        if (urlPlanId) {
            const isSunday = sundayPlans.some((p) => p.id === urlPlanId)
            if (isSunday) {
                setPlanMode('sunday_only')
                setSelectedSundayPlanId(urlPlanId)
                setSelectedWeekdayPlanId('')
                return
            }
            const isWeekday = weekdayPlans.some((p) => p.id === urlPlanId)
            if (isWeekday) {
                setPlanMode('full')
                setSelectedWeekdayPlanId(urlPlanId)
                return
            }
        }

        // Set default weekday plan (prefer 2 Time Meal Plan)
        if (!selectedWeekdayPlanId && weekdayPlans.length > 0) {
            const defaultW = weekdayPlans.find((p) => p.servingCount === 2) || weekdayPlans[0]
            setSelectedWeekdayPlanId(defaultW.id)
        }
    }, [urlPlanId, activePlans, weekdayPlans, sundayPlans, selectedWeekdayPlanId])

    const selectedWeekdayPlan = useMemo(() => {
        if (planMode === 'sunday_only') return null
        return weekdayPlans.find((p) => p.id === selectedWeekdayPlanId) || weekdayPlans[0] || null
    }, [weekdayPlans, selectedWeekdayPlanId, planMode])

    const selectedSundayPlan = useMemo(() => {
        if (!selectedSundayPlanId) return null
        return sundayPlans.find((p) => p.id === selectedSundayPlanId) || null
    }, [sundayPlans, selectedSundayPlanId])

    // Primary representative plan for days / mealType
    const selectedPlan = selectedWeekdayPlan || selectedSundayPlan || activePlans[0] || null

    const totalPlanPrice = useMemo(() => {
        if (planMode === 'sunday_only') {
            return selectedSundayPlan?.price || 0
        }
        const wPrice = selectedWeekdayPlan?.price || 0
        const sPrice = selectedSundayPlan?.price || 0
        return wPrice + sPrice
    }, [planMode, selectedWeekdayPlan, selectedSundayPlan])

    const servingCount = useMemo(() => {
        if (planMode === 'sunday_only') {
            return selectedSundayPlan?.servingCount || 1
        }
        return selectedWeekdayPlan?.servingCount || 1
    }, [planMode, selectedWeekdayPlan, selectedSundayPlan])

    // Customer chosen meal slots for this plan (e.g. ['lunch'], or ['lunch', 'dinner'], or ['breakfast', 'lunch', 'dinner'])
    const [chosenMealSlots, setChosenMealSlots] = useState<string[]>([])

    // Initialize chosen meal slots based on plan's servingCount
    useEffect(() => {
        if (!selectedPlan) return

        const planNameLower = selectedPlan.name.toLowerCase()
        const defaultSlots: string[] = []

        if (servingCount === 3) {
            defaultSlots.push('breakfast', 'lunch', 'dinner')
        } else if (servingCount === 2) {
            if (planNameLower.includes('breakfast') && planNameLower.includes('lunch')) {
                defaultSlots.push('breakfast', 'lunch')
            } else {
                defaultSlots.push('lunch', 'dinner')
            }
        } else {
            // servingCount === 1
            if (planNameLower.includes('breakfast')) {
                defaultSlots.push('breakfast')
            } else if (planNameLower.includes('lunch')) {
                defaultSlots.push('lunch')
            } else {
                defaultSlots.push('dinner')
            }
        }

        setChosenMealSlots(defaultSlots)
    }, [selectedPlan, servingCount])

    // Toggle or pick meal slots when servingCount is 1 or 2
    const handleToggleMealSlot = (slotKey: string) => {
        if (servingCount === 3) return // All 3 slots fixed

        if (servingCount === 1) {
            setChosenMealSlots([slotKey])
            return
        }

        // servingCount === 2
        setChosenMealSlots((prev) => {
            if (prev.includes(slotKey)) {
                if (prev.length === 1) return prev // Keep at least 1
                return prev.filter((s) => s !== slotKey)
            } else {
                if (prev.length >= 2) {
                    // Replace the first one to keep strictly 2
                    return [prev[1], slotKey]
                }
                return [...prev, slotKey]
            }
        })
    }

    // Days configured for the selected plan combination
    const planServingDays = useMemo(() => {
        if (planMode === 'sunday_only') {
            return ['Sunday']
        }
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        if (selectedSundayPlanId) {
            days.push('Sunday')
        }
        return ALL_DAYS.filter((d) => days.includes(d))
    }, [planMode, selectedSundayPlanId])

    // Active day tab state for dish selection
    const [activeDayTab, setActiveDayTab] = useState<string>('')

    useEffect(() => {
        if (planServingDays.length > 0 && (!activeDayTab || !planServingDays.includes(activeDayTab))) {
            setActiveDayTab(planServingDays[0])
        }
    }, [planServingDays, activeDayTab])

    // All available dishes pool from selected plans
    const allPlanItems = useMemo(() => {
        const items: FoodItem[] = []
        const seen = new Set<string>()
        if (selectedWeekdayPlan?.foodItems) {
            selectedWeekdayPlan.foodItems.forEach((i) => {
                if (!seen.has(i.id)) {
                    seen.add(i.id)
                    items.push(i)
                }
            })
        }
        if (selectedSundayPlan?.foodItems) {
            selectedSundayPlan.foodItems.forEach((i) => {
                if (!seen.has(i.id)) {
                    seen.add(i.id)
                    items.push(i)
                }
            })
        }
        return items.length > 0 ? items : selectedPlan?.foodItems || []
    }, [selectedWeekdayPlan, selectedSundayPlan, selectedPlan])

    // Customer day-by-day SINGLE dish selection: { [dayName]: { [mealSlot]: foodItemId } }
    const [selections, setSelections] = useState<Record<string, Record<string, string>>>({})

    // Auto-select first available dish for each chosen slot when plan or chosen slots change
    useEffect(() => {
        if (!selectedPlan || chosenMealSlots.length === 0) return

        const sched = selectedPlan.scheduleJson || {}
        const sundaySched = selectedSundayPlan?.scheduleJson || {}

        setSelections((prev) => {
            const next: Record<string, Record<string, string>> = { ...prev }

            planServingDays.forEach((day) => {
                if (!next[day]) next[day] = {}
                const isSunday = day === 'Sunday'
                const daySched = (isSunday && selectedSundayPlan) ? (sundaySched[day] || sched[day] || {}) : (sched[day] || {})
                const targetItems = (isSunday && selectedSundayPlan?.foodItems && selectedSundayPlan.foodItems.length > 0)
                    ? selectedSundayPlan.foodItems
                    : allPlanItems

                chosenMealSlots.forEach((slot) => {
                    if (!next[day][slot]) {
                        // Find matching dish ID from schedule or fallback
                        let candidateIds: string[] = []
                        if (daySched[slot] && Array.isArray(daySched[slot])) {
                            candidateIds = daySched[slot]
                        } else {
                            Object.keys(daySched).forEach((k) => {
                                if (k.toLowerCase().includes(slot.toLowerCase()) && Array.isArray(daySched[k])) {
                                    candidateIds = daySched[k]
                                }
                            })
                        }

                        const validItem =
                            targetItems.find((i) => candidateIds.includes(i.id)) ||
                            targetItems.find((i) => i.name.toLowerCase().includes(slot.toLowerCase())) ||
                            targetItems[0]

                        if (validItem) {
                            next[day][slot] = validItem.id
                        }
                    }
                })
            })

            return next
        })
    }, [selectedPlan, selectedSundayPlan, planServingDays, chosenMealSlots, allPlanItems])

    // Helper: Select only ONE item for a given day and slot
    const handleSelectDish = (day: string, slot: string, itemId: string) => {
        setSelections((prev) => ({
            ...prev,
            [day]: {
                ...(prev[day] || {}),
                [slot]: itemId,
            },
        }))
    }

    // Helper: Copy selection of current day to all other serving days
    const handleCopyToAllDays = () => {
        if (!activeDayTab || !selections[activeDayTab]) return
        const currentDayChoices = selections[activeDayTab]

        setSelections((prev) => {
            const next = { ...prev }
            planServingDays.forEach((day) => {
                next[day] = { ...currentDayChoices }
            })
            return next
        })
        toast.success(`Applied ${activeDayTab}'s menu selection to all days!`, { icon: '✨' })
    }

    // Customer & Delivery Form State
    const tomorrowDate = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
    }, [])

    const todayDate = useMemo(() => new Date().toISOString().split('T')[0], [])

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        whatsappNo: '',
        startDate: tomorrowDate,
        flatRoomNumber: '',
        buildingName: '',
        areaCity: 'Al Nahda, Dubai',
        dropLocation: 'Inside my room',
        customDropLocation: '',
        specialNotes: '',
        paymentMethod: 'COD',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Pre-fill from session if logged in
    useEffect(() => {
        if (session?.user) {
            setFormData((prev) => ({
                ...prev,
                customerName: prev.customerName || session.user?.name || '',
                customerEmail: prev.customerEmail || session.user?.email || '',
                customerPhone: prev.customerPhone || (session.user as any)?.phone || '',
                whatsappNo: prev.whatsappNo || (session.user as any)?.whatsappNo || (session.user as any)?.phone || '',
            }))
        }
    }, [session])

    // Copy Contact Number to WhatsApp Number helper
    const handleCopyPhoneToWhatsApp = () => {
        if (!formData.customerPhone) {
            toast.error('Please enter your Contact Number first')
            return
        }
        setFormData((prev) => ({ ...prev, whatsappNo: prev.customerPhone }))
        toast.success('WhatsApp number synced with Contact Number!')
    }

    // Validate and submit order
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedPlan) {
            toast.error('Please select a meal plan')
            return
        }

        if (chosenMealSlots.length !== servingCount) {
            toast.error(`Please select exactly ${servingCount} meal slot(s) for your ${servingCount} Time Meal Plan`)
            return
        }

        if (!session?.user) {
            toast.error('Please sign in or create an account to place your order')
            const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/get-started'
            router.push(`/signin?callbackUrl=${encodeURIComponent(currentUrl)}`)
            return
        }

        if (!formData.customerName.trim()) {
            toast.error('Please enter your Full Name')
            return
        }

        if (!formData.customerPhone.trim()) {
            toast.error('Please enter your Contact Phone Number')
            return
        }

        if (!formData.whatsappNo.trim()) {
            toast.error('Please enter your WhatsApp Number for delivery updates')
            return
        }

        if (!formData.flatRoomNumber.trim()) {
            toast.error('Please enter your Flat or Room Number')
            return
        }

        if (!formData.buildingName.trim()) {
            toast.error('Please enter your Building Name')
            return
        }

        if (!formData.areaCity.trim()) {
            toast.error('Please enter your Area or City')
            return
        }

        if (formData.dropLocation === 'Others' && !formData.customDropLocation.trim()) {
            toast.error('Please specify your custom drop location instructions')
            return
        }

        setIsSubmitting(true)

        try {
            const finalDropLocation =
                formData.dropLocation === 'Others'
                    ? `Others: ${formData.customDropLocation.trim()}`
                    : formData.dropLocation

            const fullAddress = `${formData.buildingName.trim()}, ${formData.flatRoomNumber.trim()}, ${formData.areaCity.trim()}`

            const selectedMenuIds = [
                planMode === 'full' ? selectedWeekdayPlanId : null,
                selectedSundayPlanId,
            ].filter(Boolean) as string[]

            const planRemarks = [
                selectedWeekdayPlan ? `Weekday Plan: ${selectedWeekdayPlan.name} (${chosenMealSlots.map((s) => s.toUpperCase()).join(' + ')})` : '',
                selectedSundayPlan ? `Sunday Feast: ${selectedSundayPlan.name}` : '',
                formData.specialNotes.trim() ? `Notes: ${formData.specialNotes.trim()}` : '',
            ]
                .filter(Boolean)
                .join(' | ')

            const payload = {
                customerName: formData.customerName.trim(),
                customerPhone: formData.customerPhone.trim(),
                customerEmail: formData.customerEmail.trim() || undefined,
                whatsappNo: formData.whatsappNo.trim(),
                address: fullAddress,
                buildingName: formData.buildingName.trim(),
                flatRoomNumber: formData.flatRoomNumber.trim(),
                deliveryLocation: finalDropLocation,
                startDate: formData.startDate,
                totalAmount: totalPlanPrice,
                paymentMethod: formData.paymentMethod,
                orderRemarks: planRemarks,
                menuIds: selectedMenuIds,
                selectionsJson: {
                    chosenMealSlots,
                    dailyDishes: selections,
                    weekdayPlan: selectedWeekdayPlan ? {
                        id: selectedWeekdayPlan.id,
                        name: selectedWeekdayPlan.name,
                        price: selectedWeekdayPlan.price,
                        days: selectedWeekdayPlan.days || 26,
                        servingCount: selectedWeekdayPlan.servingCount || 1,
                        availableDays: selectedWeekdayPlan.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    } : null,
                    sundayPlan: selectedSundayPlan ? {
                        id: selectedSundayPlan.id,
                        name: selectedSundayPlan.name,
                        price: selectedSundayPlan.price,
                        days: selectedSundayPlan.days || 4,
                        servingCount: selectedSundayPlan.servingCount || 1,
                        availableDays: selectedSundayPlan.availableDays || ['Sunday']
                    } : null,
                },
                includeSundays: planServingDays.includes('Sunday'),
                sundaysCount: selectedSundayPlanId ? 4 : 0,
                activeDates: planServingDays,
            }

            const response = await axios.post('/api/orders', payload)
            const createdOrder = response.data

            toast.success('🎉 Meal plan order placed successfully!')
            router.push(`/checkout/success?orderId=${createdOrder.id}`)
        } catch (err: any) {
            console.error('Order placement error:', err)
            toast.error(err.response?.data?.error || 'Failed to place order. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isMenusLoading) {
        return (
            <div className='min-h-screen pt-36 pb-20 flex flex-col items-center justify-center bg-[#FFF9F5]'>
                <div className='w-14 h-14 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4' />
                <p className='text-grey-dark font-bold text-sm tracking-wide'>
                    Loading Meal Plans...
                </p>
            </div>
        )
    }

    return (
        <main className='pt-20 bg-[#FFF9F5] min-h-screen text-grey-dark pb-24'>
            {/* Top Page Header - Clean Admin Dashboard Typography */}
            <div className='pt-14 pb-10 bg-linear-to-b from-primary/15 via-primary/5 to-transparent relative overflow-hidden'>
                <div className='max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                    <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 text-grey-dark text-xs font-semibold mb-3.5 border border-primary/30'>
                        <Icon icon='solar:bag-check-bold' className='text-sm text-grey-dark' />
                        <span>Step-by-Step Meal Subscription</span>
                    </div>

                    <h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-grey-dark tracking-tight'>
                        Customize & <span className='text-primary'>Order Meal Plan</span>
                    </h1>

                    <p className='text-grey-muted mt-2.5 max-w-2xl text-sm sm:text-base font-normal leading-relaxed'>
                        Select your meal package, choose your daily dishes, and enter your delivery address to get fresh home-cooked meals delivered daily.
                    </p>
                </div>
            </div>

            {/* Main Form Container */}
            <div className='max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-2'>
                <form onSubmit={handlePlaceOrder}>
                    <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
                        
                        {/* LEFT COLUMN: Steps (8 Cols) */}
                        <div className='lg:col-span-8 space-y-8'>
                            
                            {/* STEP 1: Select Active Meal Plan */}
                            <section className='bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-grey/10 space-y-6'>
                                <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-8 h-8 rounded-xl bg-primary text-grey-dark font-bold text-sm flex items-center justify-center shadow-xs'>
                                            1
                                        </div>
                                        <div>
                                            <h2 className='text-lg sm:text-xl font-bold text-grey-dark'>
                                                Select Your Meal Package
                                            </h2>
                                            <p className='text-xs text-grey-muted font-normal'>
                                                Choose your weekday subscription and optional Sunday feast upgrade
                                            </p>
                                        </div>
                                    </div>
                                    <div className='hidden sm:flex items-center gap-1.5 p-1 bg-grey/5 rounded-xl border border-grey/10'>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                setPlanMode('full')
                                                if (!selectedWeekdayPlanId && weekdayPlans.length > 0) {
                                                    setSelectedWeekdayPlanId(weekdayPlans[0].id)
                                                }
                                            }}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                                planMode === 'full'
                                                    ? 'bg-white text-grey-dark shadow-xs border border-grey/10'
                                                    : 'text-grey-muted hover:text-grey-dark'
                                            }`}
                                        >
                                            🍱 Monthly Mess (Mon–Sat)
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                setPlanMode('sunday_only')
                                                if (!selectedSundayPlanId && sundayPlans.length > 0) {
                                                    setSelectedSundayPlanId(sundayPlans[0].id)
                                                }
                                            }}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                                planMode === 'sunday_only'
                                                    ? 'bg-white text-grey-dark shadow-xs border border-grey/10'
                                                    : 'text-grey-muted hover:text-grey-dark'
                                            }`}
                                        >
                                            🍗 Sunday Only Specials
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Plan Mode Switcher */}
                                <div className='sm:hidden flex items-center gap-1 p-1 bg-grey/5 rounded-xl border border-grey/10'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setPlanMode('full')
                                            if (!selectedWeekdayPlanId && weekdayPlans.length > 0) {
                                                setSelectedWeekdayPlanId(weekdayPlans[0].id)
                                            }
                                        }}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                                            planMode === 'full'
                                                ? 'bg-white text-grey-dark shadow-xs border border-grey/10'
                                                : 'text-grey-muted'
                                        }`}
                                    >
                                        🍱 Monthly (Mon–Sat)
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setPlanMode('sunday_only')
                                            if (!selectedSundayPlanId && sundayPlans.length > 0) {
                                                setSelectedSundayPlanId(sundayPlans[0].id)
                                            }
                                        }}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                                            planMode === 'sunday_only'
                                                ? 'bg-white text-grey-dark shadow-xs border border-grey/10'
                                                : 'text-grey-muted'
                                        }`}
                                    >
                                        🍗 Sunday Only
                                    </button>
                                </div>

                                {planMode === 'full' ? (
                                    <>
                                        {/* SECTION 1: Weekday Base Plans (Mon - Sat) */}
                                        <div className='space-y-3'>
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <span className='text-xs font-bold uppercase tracking-wider text-grey-dark flex items-center gap-1.5'>
                                                        <span>1. Base Weekday Plan (Monday – Saturday)</span>
                                                        <span className='px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200'>
                                                            6 Days/Wk
                                                        </span>
                                                    </span>
                                                    <p className='text-[11px] text-grey-muted mt-0.5'>
                                                        Your chosen plan is selected below. Click any card to upgrade or switch anytime:
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                                {weekdayPlans.map((plan) => {
                                                    const isSelected = selectedWeekdayPlanId === plan.id
                                                    const planServing = plan.servingCount || 1

                                                    return (
                                                        <button
                                                            key={plan.id}
                                                            type='button'
                                                            onClick={() => setSelectedWeekdayPlanId(plan.id)}
                                                            className={`p-5 rounded-2xl text-left transition-all duration-200 relative cursor-pointer flex flex-col justify-between border ${
                                                                isSelected
                                                                    ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]'
                                                                    : 'bg-grey/5 border-grey/10 hover:border-primary/40 hover:bg-white'
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <div className='absolute top-3 right-3 flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary text-grey-dark shadow-xs'>
                                                                    <Icon icon='solar:check-read-bold' className='text-xs font-bold' />
                                                                    <span>Active Choice</span>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <div className='flex items-center gap-1.5 flex-wrap mb-2.5'>
                                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-block ${isSelected ? 'bg-primary/20 border-primary/30 text-grey-dark' : 'bg-white border-grey/10 text-grey-dark'}`}>
                                                                        {planServing} Time Daily
                                                                    </span>
                                                                    {planServing === 2 && (
                                                                        <span className='text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white inline-block shadow-2xs'>
                                                                            ★ Most Popular
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h3 className='font-bold text-base text-grey-dark capitalize mb-1 line-clamp-1'>
                                                                    {plan.name}
                                                                </h3>
                                                                <p className='text-xs text-grey-muted font-normal mb-4 line-clamp-2'>
                                                                    {plan.description || `${planServing === 1 ? '1 Daily Meal' : planServing === 2 ? '2 Daily Meals (e.g. Lunch + Dinner)' : 'Full Day 3 Meals (Breakfast, Lunch, Dinner)'}`}
                                                                </p>
                                                            </div>

                                                            <div className='border-t border-grey/10 pt-3 flex items-baseline justify-between'>
                                                                <span className='text-xl font-extrabold text-grey-dark'>
                                                                    AED {plan.price.toFixed(0)}
                                                                </span>
                                                                <span className='text-xs font-medium text-grey-muted'>
                                                                    / month
                                                                </span>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* SECTION 2: Sunday Special Feast Upgrade */}
                                        <div className='pt-4 border-t border-grey/10 space-y-3'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <Icon icon='solar:chef-hat-bold-duotone' className='text-primary text-lg' />
                                                    <span className='text-xs font-bold uppercase tracking-wider text-grey-dark'>
                                                        2. Add Sunday Special Feast Pass (Optional Weekend Upgrade)
                                                    </span>
                                                </div>
                                                <span className='text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200'>
                                                    Biryani & Feasts
                                                </span>
                                            </div>
                                            <p className='text-xs text-grey-muted'>
                                                Include delicious Biryani, Ghee Rice, and special weekend feasts every Sunday with free doorstep delivery:
                                            </p>

                                            <div className='grid grid-cols-1 sm:grid-cols-4 gap-3'>
                                                {/* Option: No Sunday */}
                                                <button
                                                    type='button'
                                                    onClick={() => setSelectedSundayPlanId(null)}
                                                    className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                                                        selectedSundayPlanId === null
                                                            ? 'bg-white border-2 border-primary shadow-xs'
                                                            : 'bg-grey/5 border-grey/10 hover:border-primary/40'
                                                    }`}
                                                >
                                                    <div className='flex items-center justify-between mb-1'>
                                                        <span className='text-xs font-bold text-grey-dark'>
                                                            No Sunday Pass
                                                        </span>
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSundayPlanId === null ? 'border-primary bg-primary' : 'border-grey/30'}`}>
                                                            {selectedSundayPlanId === null && <div className='w-1.5 h-1.5 rounded-full bg-grey-dark' />}
                                                        </div>
                                                    </div>
                                                    <p className='text-[11px] text-grey-muted mb-2'>
                                                        Mon – Sat only
                                                    </p>
                                                    <span className='text-xs font-bold text-grey-dark'>
                                                        + AED 0
                                                    </span>
                                                </button>

                                                {/* Sunday Plans (1 Time, 2 Time, 3 Time) */}
                                                {sundayPlans.map((sPlan) => {
                                                    const isSelected = selectedSundayPlanId === sPlan.id
                                                    const sServing = sPlan.servingCount || 1

                                                    return (
                                                        <button
                                                            key={sPlan.id}
                                                            type='button'
                                                            onClick={() => setSelectedSundayPlanId(sPlan.id)}
                                                            className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-primary/10 border-2 border-primary shadow-xs'
                                                                    : 'bg-purple-50/50 border-purple-200/60 hover:border-primary/40 hover:bg-white'
                                                            }`}
                                                        >
                                                            <div className='flex items-center justify-between mb-1'>
                                                                <span className='text-xs font-bold text-grey-dark'>
                                                                    {sServing} Meal{sServing > 1 ? 's' : ''} / Sunday
                                                                </span>
                                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-grey/30'}`}>
                                                                    {isSelected && <div className='w-1.5 h-1.5 rounded-full bg-grey-dark' />}
                                                                </div>
                                                            </div>
                                                            <p className='text-[11px] text-grey-muted mb-2 line-clamp-1'>
                                                                {sServing === 1 ? 'Biryani / Feast' : sServing === 2 ? 'Feast + Dinner' : 'Breakfast + Feast + Dinner'}
                                                            </p>
                                                            <div className='flex items-baseline justify-between'>
                                                                <span className='text-xs font-bold text-purple-900'>
                                                                    + AED {sPlan.price.toFixed(0)}
                                                                </span>
                                                                <span className='text-[10px] text-grey-muted'>
                                                                    / 4 Sundays
                                                                </span>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* SUNDAY ONLY PLANS */
                                    <div className='space-y-4'>
                                        <div className='bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center justify-between'>
                                            <div className='flex items-center gap-2.5'>
                                                <Icon icon='solar:calendar-date-bold' className='text-purple-700 text-xl' />
                                                <div>
                                                    <h4 className='text-xs font-bold text-purple-900'>
                                                        Sunday Only Feast Subscription
                                                    </h4>
                                                    <p className='text-[11px] text-purple-700'>
                                                        Delivered strictly every Sunday (4 Sundays per month).
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                            {sundayPlans.map((plan) => {
                                                const isSelected = selectedSundayPlanId === plan.id
                                                const planServing = plan.servingCount || 1

                                                return (
                                                    <button
                                                        key={plan.id}
                                                        type='button'
                                                        onClick={() => setSelectedSundayPlanId(plan.id)}
                                                        className={`p-5 rounded-2xl text-left transition-all duration-200 relative cursor-pointer flex flex-col justify-between border ${
                                                            isSelected
                                                                ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]'
                                                                : 'bg-grey/5 border-grey/10 hover:border-primary/40 hover:bg-white'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className='absolute top-3 right-3 flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary text-grey-dark shadow-xs'>
                                                                <Icon icon='solar:check-read-bold' className='text-xs font-bold' />
                                                                <span>Active Choice</span>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <div className='flex items-center gap-1.5 flex-wrap mb-2.5'>
                                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-block ${isSelected ? 'bg-primary/20 border-primary/30 text-grey-dark' : 'bg-white border-grey/10 text-grey-dark'}`}>
                                                                    {planServing} Meal{planServing > 1 ? 's' : ''} / Sunday
                                                                </span>
                                                                <span className='text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 inline-block'>
                                                                    Sunday Only
                                                                </span>
                                                            </div>
                                                            <h3 className='font-bold text-base text-grey-dark capitalize mb-1 line-clamp-1'>
                                                                {plan.name}
                                                            </h3>
                                                            <p className='text-xs text-grey-muted font-normal mb-4 line-clamp-2'>
                                                                {plan.description || `${planServing === 1 ? '1 Sunday Feast Meal' : planServing === 2 ? '2 Sunday Meals' : 'Full Day 3 Sunday Meals'}`}
                                                            </p>
                                                        </div>

                                                        <div className='border-t border-grey/10 pt-3 flex items-baseline justify-between'>
                                                            <span className='text-xl font-extrabold text-grey-dark'>
                                                                AED {plan.price.toFixed(0)}
                                                            </span>
                                                            <span className='text-xs font-medium text-grey-muted'>
                                                                / 4 Sundays
                                                            </span>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* STEP 2: Choose Meal Type(s) Based on Serving Count */}
                            <section className='bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-grey/10'>
                                <div className='flex items-center justify-between border-b border-grey/10 pb-4 mb-6'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-8 h-8 rounded-xl bg-primary text-grey-dark font-bold text-sm flex items-center justify-center shadow-xs'>
                                            2
                                        </div>
                                        <div>
                                            <h2 className='text-lg sm:text-xl font-bold text-grey-dark'>
                                                Choose Meal Type ({servingCount} Required)
                                            </h2>
                                            <p className='text-xs text-grey-muted font-normal'>
                                                {servingCount === 1 && 'Select which meal you would like to receive daily (Choose 1):'}
                                                {servingCount === 2 && 'Select any 2 meals you would like to receive daily (Choose 2):'}
                                                {servingCount === 3 && 'All 3 meals (Breakfast + Lunch + Dinner) are included daily:'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className='px-3 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-500/20'>
                                        {chosenMealSlots.length}/{servingCount} Selected
                                    </span>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                    {STANDARD_MEAL_SLOTS.map((slot) => {
                                        const isChosen = chosenMealSlots.includes(slot.key)
                                        const isLocked = servingCount === 3

                                        return (
                                            <div
                                                key={slot.key}
                                                onClick={() => !isLocked && handleToggleMealSlot(slot.key)}
                                                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative ${
                                                    isLocked ? 'cursor-default' : 'cursor-pointer'
                                                } ${
                                                    isChosen
                                                        ? 'bg-primary/10 border-2 border-primary shadow-xs'
                                                        : 'bg-grey/5 border-grey/10 hover:border-primary/40'
                                                }`}
                                            >
                                                {/* Checkbox / Radio Indicator */}
                                                <div
                                                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                                                        isChosen
                                                            ? 'bg-primary border-primary text-grey-dark'
                                                            : 'border-grey/30 bg-white'
                                                    }`}
                                                >
                                                    {isChosen && (
                                                        <Icon icon='solar:check-read-bold' className='text-xs font-bold' />
                                                    )}
                                                </div>

                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center gap-1.5 mb-1'>
                                                        <Icon icon={slot.icon} className='text-base text-primary shrink-0' />
                                                        <h4 className='font-bold text-sm text-grey-dark'>
                                                            {slot.label}
                                                        </h4>
                                                    </div>
                                                    <p className='text-xs text-grey-muted font-normal leading-tight'>
                                                        {slot.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>

                            {/* STEP 3: Day-by-Day Single Dish Selection */}
                            <section className='bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-grey/10'>
                                <div className='flex flex-wrap items-center justify-between border-b border-grey/10 pb-4 mb-6 gap-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-8 h-8 rounded-xl bg-primary text-grey-dark font-bold text-sm flex items-center justify-center shadow-xs'>
                                            3
                                        </div>
                                        <div>
                                            <h2 className='text-lg sm:text-xl font-bold text-grey-dark'>
                                                Daily Dish Selection
                                            </h2>
                                            <p className='text-xs text-grey-muted font-normal'>
                                                Select <strong className='text-grey-dark font-semibold'>1 dish per meal slot</strong> for each day
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type='button'
                                        onClick={handleCopyToAllDays}
                                        className='px-3.5 py-1.5 rounded-xl bg-grey/5 hover:bg-primary/20 text-grey-dark border border-grey/10 hover:border-primary/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer'
                                    >
                                        <Icon icon='solar:copy-bold' className='text-sm text-primary' />
                                        <span>Apply {activeDayTab} Dishes to All Days</span>
                                    </button>
                                </div>

                                {/* Day Selection Tabs */}
                                <div className='flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none'>
                                    {planServingDays.map((day) => {
                                        const isActive = activeDayTab === day
                                        const dayChoice = selections[day]
                                        const hasSelection = dayChoice && Object.values(dayChoice).some(Boolean)

                                        return (
                                            <button
                                                key={day}
                                                type='button'
                                                onClick={() => setActiveDayTab(day)}
                                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                                                    isActive
                                                        ? 'bg-primary text-grey-dark border-primary shadow-xs'
                                                        : hasSelection
                                                        ? 'bg-grey/5 text-grey-dark border-grey/10 hover:border-primary/40'
                                                        : 'bg-white text-grey-muted border-grey/10 hover:bg-grey/5'
                                                }`}
                                            >
                                                <span>{day}</span>
                                                {hasSelection && (
                                                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 inline-block' />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Dish Options for Active Day */}
                                {(() => {
                                    if (!selectedPlan) return null
                                    const sched = selectedPlan.scheduleJson || {}
                                    const daySched = sched[activeDayTab] || {}
                                    const allPlanItems = selectedPlan.foodItems || []

                                    return (
                                        <div className='space-y-6'>
                                            {chosenMealSlots.map((slotKey) => {
                                                const slotInfo = STANDARD_MEAL_SLOTS.find((s) => s.key === slotKey)
                                                
                                                // Find candidate dish IDs in scheduleJson
                                                let candidateIds: string[] = []
                                                if (daySched[slotKey] && Array.isArray(daySched[slotKey])) {
                                                    candidateIds = daySched[slotKey]
                                                } else {
                                                    Object.keys(daySched).forEach((k) => {
                                                        if (k.toLowerCase().includes(slotKey.toLowerCase()) && Array.isArray(daySched[k])) {
                                                            candidateIds = daySched[k]
                                                        }
                                                    })
                                                }

                                                let eligibleDishes = allPlanItems.filter((item) =>
                                                    candidateIds.length > 0 ? candidateIds.includes(item.id) : true
                                                )

                                                if (eligibleDishes.length === 0) {
                                                    eligibleDishes = allPlanItems
                                                }

                                                const selectedDishId = selections[activeDayTab]?.[slotKey] || eligibleDishes[0]?.id

                                                return (
                                                    <div key={slotKey} className='bg-[#FFF9F5] p-5 rounded-2xl border border-primary/20'>
                                                        <div className='flex items-center justify-between mb-4'>
                                                            <div className='flex items-center gap-2'>
                                                                <Icon icon={slotInfo?.icon || 'solar:cup-hot-bold-duotone'} className='text-primary text-base' />
                                                                <h4 className='font-bold text-sm text-grey-dark'>
                                                                    {activeDayTab} • {slotInfo?.label || slotKey} Meal
                                                                </h4>
                                                            </div>
                                                            <span className='text-xs font-normal text-grey-muted'>
                                                                (Choose 1 option)
                                                            </span>
                                                        </div>

                                                        {eligibleDishes.length === 0 ? (
                                                            <p className='text-xs text-grey-muted py-4 text-center'>
                                                                Chef's special rotating menu will be prepared for {activeDayTab} {slotKey}.
                                                            </p>
                                                        ) : (
                                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                                                                {eligibleDishes.map((dish) => {
                                                                    const isChosen = selectedDishId === dish.id

                                                                    return (
                                                                        <div
                                                                            key={dish.id}
                                                                            onClick={() => handleSelectDish(activeDayTab, slotKey, dish.id)}
                                                                            className={`p-3.5 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer border ${
                                                                                isChosen
                                                                                    ? 'bg-white border-2 border-primary shadow-xs'
                                                                                    : 'bg-white/80 border-grey/10 hover:border-primary/40 hover:bg-white'
                                                                            }`}
                                                                        >
                                                                            {/* Radio Indicator */}
                                                                            <div
                                                                                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                                                                    isChosen
                                                                                        ? 'bg-primary border-primary text-grey-dark'
                                                                                        : 'border-grey/30 bg-transparent'
                                                                                }`}
                                                                            >
                                                                                {isChosen && (
                                                                                    <div className='w-1.5 h-1.5 rounded-full bg-grey-dark' />
                                                                                )}
                                                                            </div>

                                                                            {/* Dish Image */}
                                                                            <div className='w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-grey/5 border border-grey/10'>
                                                                                <Image
                                                                                    src={getFullImageUrl(dish.image) || '/images/food/biryani_premium.png'}
                                                                                    alt={dish.name}
                                                                                    fill
                                                                                    className='object-cover'
                                                                                />
                                                                            </div>

                                                                            {/* Dish Details */}
                                                                            <div className='flex-1 min-w-0'>
                                                                                <h5 className='font-bold text-sm text-grey-dark capitalize line-clamp-2 leading-snug'>
                                                                                    {dish.name}
                                                                                </h5>
                                                                                {dish.category?.name && (
                                                                                    <span className='text-[11px] font-normal text-grey-muted'>
                                                                                        {dish.category.name}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })()}
                            </section>

                            {/* STEP 4: Delivery & Customer Information Form */}
                            <section className='bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-grey/10 space-y-6'>
                                <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-8 h-8 rounded-xl bg-primary text-grey-dark font-bold text-sm flex items-center justify-center shadow-xs'>
                                            4
                                        </div>
                                        <div>
                                            <h2 className='text-lg sm:text-xl font-bold text-grey-dark'>
                                                Service & Delivery Details
                                            </h2>
                                            <p className='text-xs text-grey-muted font-normal'>
                                                Where and when should we deliver your meals?
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Auth Pre-fill Banner */}
                                {session?.user ? (
                                    <div className='p-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3 text-xs font-semibold text-grey-dark'>
                                        <div className='flex items-center gap-2.5'>
                                            <Icon icon='solar:user-check-bold' className='text-base text-primary shrink-0' />
                                            <span>Logged in as <strong>{session.user.name || session.user.email}</strong>. Contact details pre-filled.</span>
                                        </div>
                                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200'>
                                            Verified Account
                                        </span>
                                    </div>
                                ) : (
                                    <div className='p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs'>
                                        <div className='flex items-center gap-2 text-amber-900'>
                                            <Icon icon='solar:lock-bold' className='text-base text-amber-600 shrink-0' />
                                            <span><strong>Account Required:</strong> Please sign in to confirm and place your order.</span>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/get-started'
                                                router.push(`/signin?callbackUrl=${encodeURIComponent(currentUrl)}`)
                                            }}
                                            className='px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-grey-dark font-bold text-xs shrink-0 shadow-xs cursor-pointer'
                                        >
                                            Sign In / Register
                                        </button>
                                    </div>
                                )}

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                    
                                    {/* Start Service From (Date) */}
                                    <div className='sm:col-span-2'>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Start My Service From (Select Date) <span className='text-red-500'>*</span>
                                        </label>
                                        <div className='relative'>
                                            <input
                                                type='date'
                                                min={todayDate}
                                                required
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-sm font-semibold text-grey-dark outline-hidden transition-all'
                                            />
                                        </div>
                                        <span className='text-[11px] text-grey-muted mt-1 block'>
                                            Your meal deliveries will begin on this selected date.
                                        </span>
                                    </div>

                                    {/* Customer Name */}
                                    <div>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Full Name <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='text'
                                            required
                                            placeholder='e.g. Suresh Kumar'
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-sm font-semibold text-grey-dark outline-hidden transition-all placeholder:font-normal'
                                        />
                                    </div>

                                    {/* Contact Phone Number */}
                                    <div>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Contact Number <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='tel'
                                            required
                                            placeholder='+971 50 123 4567'
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-sm font-semibold text-grey-dark outline-hidden transition-all placeholder:font-normal'
                                        />
                                    </div>

                                    {/* WhatsApp Number with Quick Sync Button */}
                                    <div className='sm:col-span-2'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <label className='text-xs font-semibold uppercase tracking-wider text-grey-muted'>
                                                WhatsApp Number (For Delivery Updates) <span className='text-red-500'>*</span>
                                            </label>
                                            <button
                                                type='button'
                                                onClick={handleCopyPhoneToWhatsApp}
                                                className='text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer'
                                            >
                                                <Icon icon='solar:copy-bold' />
                                                <span>Same as Contact Number</span>
                                            </button>
                                        </div>
                                        <div className='relative'>
                                            <input
                                                type='tel'
                                                required
                                                placeholder='+971 50 123 4567'
                                                value={formData.whatsappNo}
                                                onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                                                className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-sm font-semibold text-grey-dark outline-hidden transition-all pl-11 placeholder:font-normal'
                                            />
                                            <Icon icon='logos:whatsapp-icon' className='text-lg absolute left-4 top-1/2 -translate-y-1/2' />
                                        </div>
                                    </div>

                                    {/* Flat / Room Number */}
                                    <div>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Flat / Room Number <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='text'
                                            required
                                            placeholder='e.g. Room 304 or Flat 12B'
                                            value={formData.flatRoomNumber}
                                            onChange={(e) => setFormData({ ...formData, flatRoomNumber: e.target.value })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-sm font-semibold text-grey-dark outline-hidden transition-all placeholder:font-normal'
                                        />
                                    </div>

                                    {/* Building Name */}
                                    <div>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Building Name <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='text'
                                            required
                                            placeholder='e.g. Al Hilal Building'
                                            value={formData.buildingName}
                                            onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-sm font-semibold text-grey-dark outline-hidden transition-all placeholder:font-normal'
                                        />
                                    </div>

                                    {/* Area / City */}
                                    <div className='sm:col-span-2'>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Area / City (UAE) <span className='text-red-500'>*</span>
                                        </label>
                                        <input
                                            type='text'
                                            required
                                            placeholder='e.g. Al Nahda 2, Dubai / Muhaisnah / Deira'
                                            value={formData.areaCity}
                                            onChange={(e) => setFormData({ ...formData, areaCity: e.target.value })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-sm font-semibold text-grey-dark outline-hidden transition-all placeholder:font-normal'
                                        />
                                    </div>

                                    {/* Drop My Food Delivery (Dropdown) */}
                                    <div className='sm:col-span-2'>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Drop My Food Delivery <span className='text-red-500'>*</span>
                                        </label>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'>
                                            {DROP_LOCATIONS.map((loc) => {
                                                const isSelected = formData.dropLocation === loc.value
                                                return (
                                                    <button
                                                        key={loc.value}
                                                        type='button'
                                                        onClick={() => setFormData({ ...formData, dropLocation: loc.value })}
                                                        className={`p-3.5 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer border ${
                                                            isSelected
                                                                ? 'bg-primary/10 border-2 border-primary text-grey-dark font-bold shadow-xs'
                                                                : 'bg-grey/5 border-grey/10 text-grey-dark hover:border-primary/40'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                                                isSelected ? 'bg-primary border-primary' : 'border-grey/30'
                                                            }`}
                                                        >
                                                            {isSelected && <div className='w-1.5 h-1.5 rounded-full bg-grey-dark' />}
                                                        </div>
                                                        <Icon icon={loc.icon} className='text-lg text-primary' />
                                                        <span className='text-xs font-semibold'>{loc.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Dynamic "Others" custom location input */}
                                        <AnimatePresence>
                                            {formData.dropLocation === 'Others' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className='overflow-hidden pt-2'
                                                >
                                                    <label className='block text-xs font-semibold text-grey-muted mb-1.5'>
                                                        Please specify drop instructions:
                                                    </label>
                                                    <input
                                                        type='text'
                                                        required
                                                        placeholder='e.g. Leave with security guard Mr. Ali / Room 204 next door'
                                                        value={formData.customDropLocation}
                                                        onChange={(e) => setFormData({ ...formData, customDropLocation: e.target.value })}
                                                        className='w-full px-4 py-3 rounded-xl bg-white border-2 border-primary/60 focus:border-primary text-xs font-semibold text-grey-dark outline-hidden shadow-xs'
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Special Notes */}
                                    <div className='sm:col-span-2'>
                                        <label className='block text-xs font-semibold uppercase tracking-wider text-grey-muted mb-2'>
                                            Special Dietary / Delivery Instructions (Optional)
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder='e.g. Less spicy, ring bell twice, no cutlery needed'
                                            value={formData.specialNotes}
                                            onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                                            className='w-full px-4 py-3 rounded-xl bg-grey/5 border border-grey/10 focus:border-primary focus:bg-white text-xs font-normal text-grey-dark outline-hidden transition-all'
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Sticky Order Summary & Submit (4 Cols) */}
                        <div className='lg:col-span-4 lg:sticky lg:top-28 space-y-6'>
                            <div className='bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-grey/10 space-y-6'>
                                <div className='border-b border-grey/10 pb-4'>
                                    <span className='text-xs font-semibold uppercase tracking-wider text-primary block mb-1'>
                                        Order Summary
                                    </span>
                                    <h3 className='text-lg sm:text-xl font-bold text-grey-dark'>
                                        Subscription Overview
                                    </h3>
                                </div>

                                {selectedPlan && (
                                    <div className='space-y-4 text-xs'>
                                        {/* Itemized Plan Breakdown */}
                                        <div className='bg-[#FFF9F5] p-4 rounded-2xl border border-primary/20 space-y-3'>
                                            <span className='text-xs font-semibold uppercase tracking-wider text-grey-muted block'>
                                                Subscription Breakdown
                                            </span>

                                            {/* Weekday Plan Row */}
                                            {selectedWeekdayPlan && (
                                                <div className='border-b border-primary/15 pb-2.5'>
                                                    <div className='flex items-baseline justify-between'>
                                                        <h4 className='font-bold text-sm text-grey-dark capitalize'>
                                                            {selectedWeekdayPlan.name}
                                                        </h4>
                                                        <span className='font-bold text-sm text-grey-dark'>
                                                            AED {selectedWeekdayPlan.price.toFixed(0)}
                                                        </span>
                                                    </div>
                                                    <div className='mt-1 flex items-center gap-1 flex-wrap text-[10px] text-grey-muted'>
                                                        <span className='px-1.5 py-0.5 rounded bg-primary/20 text-grey-dark font-semibold'>
                                                            {selectedWeekdayPlan.servingCount} Time / Day
                                                        </span>
                                                        <span className='px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'>
                                                            {selectedWeekdayPlan.days || 26} Days Plan
                                                        </span>
                                                        <span className='px-1.5 py-0.5 rounded bg-grey/10 text-grey-dark'>
                                                            {chosenMealSlots.map((s) => s.toUpperCase()).join(' + ')}
                                                        </span>
                                                        <span className='px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold'>
                                                            Mon – Sat
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sunday Plan Row */}
                                            {selectedSundayPlan ? (
                                                <div className='border-b border-primary/15 pb-2.5'>
                                                    <div className='flex items-baseline justify-between'>
                                                        <h4 className='font-bold text-sm text-purple-900 capitalize flex items-center gap-1'>
                                                            <span>🍗 {selectedSundayPlan.name}</span>
                                                        </h4>
                                                        <span className='font-bold text-sm text-purple-900'>
                                                            + AED {selectedSundayPlan.price.toFixed(0)}
                                                        </span>
                                                    </div>
                                                    <div className='mt-1 flex items-center gap-1 text-[10px] text-purple-700'>
                                                        <span className='px-1.5 py-0.5 rounded bg-purple-100 font-semibold'>
                                                            {selectedSundayPlan.servingCount} Meal(s) every Sunday
                                                        </span>
                                                        <span className='px-1.5 py-0.5 rounded bg-purple-100 font-semibold'>
                                                            Biryani Feast
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : planMode === 'full' ? (
                                                <div className='border-b border-primary/15 pb-2 text-[11px] text-grey-muted flex items-center justify-between'>
                                                    <span>Sunday Feast:</span>
                                                    <span className='font-semibold text-grey-dark'>Not included (Mon–Sat)</span>
                                                </div>
                                            ) : null}

                                            {/* Combined Total */}
                                            <div className='pt-1 flex items-baseline justify-between'>
                                                <div>
                                                    <span className='text-xs font-bold text-grey-dark block'>
                                                        Total Monthly Pass
                                                    </span>
                                                    <span className='text-[10px] text-grey-muted'>
                                                        Includes all selected meals & delivery
                                                    </span>
                                                </div>
                                                <span className='font-extrabold text-xl text-grey-dark'>
                                                    AED {totalPlanPrice.toFixed(0)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Delivery Info Preview */}
                                        <div className='space-y-2.5 px-1'>
                                            <div className='flex items-center justify-between text-grey-muted'>
                                                <span className='font-normal'>Start Date:</span>
                                                <strong className='text-grey-dark font-semibold'>{formData.startDate || 'Tomorrow'}</strong>
                                            </div>
                                            <div className='flex items-center justify-between text-grey-muted'>
                                                <span className='font-normal'>Serving Schedule:</span>
                                                <strong className='text-grey-dark font-semibold text-right text-xs'>
                                                    {planServingDays.length === 7
                                                        ? '7 Days / Wk (Mon - Sun)'
                                                        : planServingDays.length === 6 && !planServingDays.includes('Sunday')
                                                        ? '6 Days / Wk (Mon – Sat)'
                                                        : planServingDays.length === 1 && planServingDays.includes('Sunday')
                                                        ? 'Sunday Special Only'
                                                        : `${planServingDays.length} Days / Wk`}
                                                </strong>
                                            </div>
                                            <div className='flex items-center justify-between text-grey-muted'>
                                                <span className='font-normal'>Meals Per Day:</span>
                                                <strong className='text-grey-dark font-semibold'>{servingCount} Meal(s) Daily</strong>
                                            </div>
                                            <div className='flex items-center justify-between text-grey-muted'>
                                                <span className='font-normal'>Drop Location:</span>
                                                <strong className='text-grey-dark font-semibold truncate max-w-[150px]'>
                                                    {formData.dropLocation}
                                                </strong>
                                            </div>
                                            <div className='flex items-center justify-between text-grey-muted'>
                                                <span className='font-normal'>Delivery Charge:</span>
                                                <span className='text-emerald-600 font-semibold uppercase tracking-wider text-[11px] bg-emerald-100 px-2 py-0.5 rounded-full'>
                                                    FREE
                                                </span>
                                            </div>
                                        </div>

                                        {/* Payment Method Selection */}
                                        <div className='pt-3 border-t border-grey/10 space-y-3'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs font-semibold uppercase tracking-wider text-grey-muted block'>
                                                    Payment Method
                                                </span>
                                                <span className='text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10'>
                                                    {formData.paymentMethod === 'BANK_TRANSFER' ? 'Direct Bank Wire' : 'Pay Upon Delivery'}
                                                </span>
                                            </div>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <button
                                                    type='button'
                                                    onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                                                    className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                                                        formData.paymentMethod === 'COD'
                                                            ? 'bg-primary text-grey-dark border-primary shadow-xs'
                                                            : 'bg-grey/5 text-grey-muted border-grey/10 hover:border-primary/40'
                                                    }`}
                                                >
                                                    <Icon icon='solar:hand-money-bold-duotone' className='text-base' />
                                                    <span>Cash On Delivery</span>
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={() => setFormData({ ...formData, paymentMethod: 'BANK_TRANSFER' })}
                                                    className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                                                        formData.paymentMethod === 'BANK_TRANSFER'
                                                            ? 'bg-primary text-grey-dark border-primary shadow-xs'
                                                            : 'bg-grey/5 text-grey-muted border-grey/10 hover:border-primary/40'
                                                    }`}
                                                >
                                                    <Icon icon='solar:card-2-bold-duotone' className='text-base' />
                                                    <span>Bank Transfer</span>
                                                </button>
                                            </div>

                                            {/* Dynamic Bank Transfer Voucher / Details */}
                                            <AnimatePresence>
                                                {formData.paymentMethod === 'BANK_TRANSFER' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -6, height: 0 }}
                                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                        exit={{ opacity: 0, y: -6, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className='overflow-hidden'
                                                    >
                                                        <div className='bg-gradient-to-b from-[#1C1D22] to-[#25262E] text-white p-4 rounded-2xl border border-white/10 shadow-md space-y-3 mt-1'>
                                                            {/* Bank Header */}
                                                            <div className='flex items-center justify-between border-b border-white/10 pb-2.5'>
                                                                <div className='flex items-center gap-2'>
                                                                    <Icon icon='solar:buildings-bold-duotone' className='text-xl text-[#f3ba2f]' />
                                                                    <span className='font-bold text-xs uppercase tracking-wide text-white'>
                                                                        {siteSettings?.bank_name || 'Emirates NBD'}
                                                                    </span>
                                                                </div>
                                                                <span className='text-[9px] font-mono tracking-widest text-[#f3ba2f] font-bold px-2 py-0.5 rounded-md border border-[#f3ba2f]/30 bg-[#f3ba2f]/10'>
                                                                    UAE CORPORATE
                                                                </span>
                                                            </div>

                                                            {/* Account Name */}
                                                            <div>
                                                                <span className='text-[9px] uppercase tracking-wider text-white/50 block'>
                                                                    Beneficiary Name
                                                                </span>
                                                                <span className='text-xs font-semibold text-white/95 block'>
                                                                    {siteSettings?.account_name || 'Premium Mess Services LLC'}
                                                                </span>
                                                            </div>

                                                            {/* IBAN with 1-click Copy */}
                                                            <div className='p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1'>
                                                                <div className='flex items-center justify-between'>
                                                                    <span className='text-[9px] uppercase tracking-wider text-white/50'>
                                                                        Official IBAN Number
                                                                    </span>
                                                                    <button
                                                                        type='button'
                                                                        onClick={() => handleCopyText(siteSettings?.iban_number || 'AE12 0310 0000 1012 3456 7890', 'IBAN')}
                                                                        className='text-[10px] font-bold text-[#f3ba2f] hover:text-[#f3ba2f]/80 transition-colors flex items-center gap-1 cursor-pointer'
                                                                    >
                                                                        <Icon icon={copiedField === 'IBAN' ? 'solar:check-circle-bold' : 'solar:copy-bold-duotone'} />
                                                                        <span>{copiedField === 'IBAN' ? 'Copied' : 'Copy IBAN'}</span>
                                                                    </button>
                                                                </div>
                                                                <p className='font-mono font-bold text-xs text-[#f3ba2f] tracking-wider break-all select-all'>
                                                                    {siteSettings?.iban_number || 'AE12 0310 0000 1012 3456 7890'}
                                                                </p>
                                                            </div>

                                                            {/* Account Number & SWIFT */}
                                                            <div className='grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]'>
                                                                <div>
                                                                    <div className='flex items-center justify-between'>
                                                                        <span className='text-[9px] uppercase tracking-wider text-white/50'>Account No</span>
                                                                        <button
                                                                            type='button'
                                                                            onClick={() => handleCopyText(siteSettings?.account_number || '101234567890', 'Account Number')}
                                                                            className='text-[9px] text-white/70 hover:text-white flex items-center gap-0.5 cursor-pointer'
                                                                        >
                                                                            <Icon icon={copiedField === 'Account Number' ? 'solar:check-circle-bold' : 'solar:copy-bold'} />
                                                                        </button>
                                                                    </div>
                                                                    <span className='font-mono font-semibold text-white/90'>
                                                                        {siteSettings?.account_number || '101234567890'}
                                                                    </span>
                                                                </div>
                                                                <div className='text-right'>
                                                                    <span className='text-[9px] uppercase tracking-wider text-white/50 block'>SWIFT / BIC</span>
                                                                    <span className='font-mono font-semibold text-white/90'>
                                                                        {siteSettings?.swift_code || 'EBILAEADXXX'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* WhatsApp / Confirmation Guidance Note */}
                                                            <div className='p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-[10px] text-amber-200 leading-snug'>
                                                                <Icon icon='logos:whatsapp-icon' className='text-sm shrink-0 mt-0.5' />
                                                                <span>
                                                                    {siteSettings?.whatsapp_instruction ||
                                                                        'Please share your transfer confirmation receipt screenshot on WhatsApp after placing the order for immediate plan activation.'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Total Amount */}
                                        <div className='pt-4 border-t-2 border-dashed border-grey/15 flex items-baseline justify-between'>
                                            <div>
                                                <span className='text-xs font-medium text-grey-muted block'>Total Payable:</span>
                                                <span className='text-[11px] text-grey-muted'>Includes all meals & delivery</span>
                                            </div>
                                            <span className='text-2xl font-bold text-grey-dark'>
                                                AED {selectedPlan.price.toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type='submit'
                                    disabled={isSubmitting || !selectedPlan}
                                    className={`w-full py-3.5 rounded-xl text-grey-dark font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                        session?.user ? 'bg-primary hover:bg-primary/90' : 'bg-amber-400 hover:bg-amber-500'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className='w-4 h-4 border-2 border-grey-dark border-t-transparent rounded-full animate-spin' />
                                            <span>Processing Order...</span>
                                        </>
                                    ) : !session?.user ? (
                                        <>
                                            <Icon icon='solar:lock-bold' className='text-base' />
                                            <span>Sign In to Place Order</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirm & Place Order</span>
                                            <Icon icon='solar:arrow-right-bold' className='text-base' />
                                        </>
                                    )}
                                </button>

                                {/* Trust Badges */}
                                <div className='pt-2 space-y-2 text-xs text-grey-muted font-medium'>
                                    <div className='flex items-center gap-2'>
                                        <Icon icon='solar:shield-check-bold' className='text-primary text-base shrink-0' />
                                        <span>Authentic Home-Cooked Quality</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Icon icon='solar:clock-circle-bold' className='text-primary text-base shrink-0' />
                                        <span>On-Time Room & Flat Delivery Daily</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Icon icon='solar:refresh-circle-bold' className='text-primary text-base shrink-0' />
                                        <span>Pause or Adjust Dates Anytime</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default function GetStartedPage() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FFF9F5]'>
                    <div className='w-14 h-14 border-3 border-primary border-t-transparent rounded-full animate-spin' />
                </div>
            }
        >
            <GetStartedContent />
        </Suspense>
    )
}
