'use client'

import React, { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useInvoiceDownload } from '@/app/hooks/useInvoiceDownload'

interface FoodItem {
    id: string
    name: string
    category: string
    price?: number
}

interface FoodMenu {
    id: string
    name: string
    price: number
    foodItems: FoodItem[]
}

interface Order {
    id: string
    createdAt: string
    startDate: string
    status: string
    paymentStatus: string
    totalAmount: number
    deliveryLocation: string
    address: string
    buildingName?: string
    flatRoomNumber?: string
    selectedMenus: FoodMenu[]
    selectionsJson: any
    activeDates: string[]
    servedDates: string[]
    customer: {
        name: string
        phone: string
        email: string
    }
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { downloadInvoice, isGenerating } = useInvoiceDownload()

    const { data: order, isLoading, error } = useQuery<Order>({
        queryKey: ['order', resolvedParams.id],
        queryFn: async () => {
            const res = await axios.get(`/api/orders/${resolvedParams.id}`)
            return res.data
        },
    })

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[50vh] space-y-4'>
                <div className='w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl animate-spin'>
                    <Icon icon='line-md:loading-loop' />
                </div>
                <p className='text-xs font-semibold text-grey-muted'>Loading order details...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className='bg-white rounded-3xl border border-grey/10 p-12 text-center shadow-xs space-y-4'>
                <div className='w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-red-200'>
                    <Icon icon='solar:danger-triangle-bold' />
                </div>
                <h2 className='text-lg font-bold text-grey-dark'>Order not found</h2>
                <p className='text-xs text-grey-muted'>The requested subscription order could not be retrieved.</p>
                <Link
                    href='/my-orders'
                    className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-grey-dark font-extrabold text-xs hover:bg-primary-hover transition-all'
                >
                    <Icon icon='solar:alt-arrow-left-bold' />
                    <span>Back to My Orders</span>
                </Link>
            </div>
        )
    }

    const activeDates = order.activeDates || []
    const servedDates = order.servedDates || []
    const startDate = activeDates.length > 0 ? new Date(activeDates[0]) : null
    const endDate = activeDates.length > 0 ? new Date(activeDates[activeDates.length - 1]) : null
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    const servedCount = servedDates.length
    const totalDays = activeDates.length || (order.selectionsJson?.weekdayPlan?.days || 26) + (order.selectionsJson?.sundayPlan?.days || ((order as any).includeSundays ? 4 : 0))
    const remainingDays = activeDates.filter((d) => new Date(d) >= today && !servedDates.includes(d)).length
    const servedPercent = Math.min(100, Math.round((servedCount / (totalDays || 1)) * 100))

    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A'
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const sanitizeDishName = (name: string) => {
        if (!name) return ''
        return name.replace(/^(breakfast|lunch|dinner|meal)\s*[-:]\s*/i, '').trim() || name
    }

    const getItemsForDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
            const isSunday = dayName === 'Sunday'
            const selections = order.selectionsJson || {}
            const items: FoodItem[] = []

            const chosenSlots: string[] = (selections.chosenMealSlots || []).map((s: string) => s.toLowerCase())

            // 1. If it's Sunday
            if (isSunday) {
                const sundayPlan = selections.sundayPlan
                if (sundayPlan || (order as any).includeSundays) {
                    items.push({
                        id: sundayPlan?.id || 'sunday-feast',
                        name: sanitizeDishName(sundayPlan?.name || 'Sunday Special Biryani Feast'),
                        category: 'SUNDAY FEAST',
                    })
                }
                return items
            }

            // 2. Weekday Meals: Check modern dailyDishes structure: selectionsJson.dailyDishes[dayName] = { breakfast: itemId, lunch: itemId }
            const dailyDishes = selections.dailyDishes || {}
            if (dailyDishes[dayName] && typeof dailyDishes[dayName] === 'object') {
                const daySlots = dailyDishes[dayName]

                // Filter strictly by chosenMealSlots if defined
                const slotsToInclude = chosenSlots.length > 0
                    ? chosenSlots
                    : Object.keys(daySlots)

                slotsToInclude.forEach((slot) => {
                    const dishIdOrObj = daySlots[slot] || daySlots[slot.toLowerCase()]
                    if (!dishIdOrObj) return

                    if (typeof dishIdOrObj === 'object' && dishIdOrObj.name) {
                        items.push({
                            id: dishIdOrObj.id || slot,
                            name: sanitizeDishName(dishIdOrObj.name),
                            category: slot.toUpperCase(),
                        })
                    } else {
                        let matched: any = null
                        order.selectedMenus?.forEach((m) => {
                            const found = m.foodItems?.find((fi) => fi.id === dishIdOrObj || fi.name?.toLowerCase() === String(dishIdOrObj).toLowerCase())
                            if (found) matched = found
                        })
                        items.push({
                            id: dishIdOrObj,
                            name: sanitizeDishName(matched ? matched.name : String(dishIdOrObj)),
                            category: slot.toUpperCase(),
                        })
                    }
                })
            }

            // 3. Legacy structure fallback
            if (items.length === 0) {
                Object.entries(selections).forEach(([key, val]: [string, any]) => {
                    if (val && typeof val === 'object' && !Array.isArray(val) && val[dayName]) {
                        const itemId = val[dayName]
                        let matched: any = null
                        order.selectedMenus?.forEach((m) => {
                            const found = m.foodItems?.find((fi) => fi.id === itemId)
                            if (found) matched = found
                        })
                        if (matched) {
                            items.push({
                                id: matched.id,
                                name: sanitizeDishName(matched.name),
                                category: matched.category?.toUpperCase() || 'MEAL',
                            })
                        } else if (typeof itemId === 'string') {
                            items.push({
                                id: itemId,
                                name: sanitizeDishName(itemId),
                                category: 'MEAL',
                            })
                        }
                    }
                })
            }

            return items
        } catch {
            return []
        }
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-grey/10 shadow-xs'>
                <div className='flex items-center gap-3.5'>
                    <button
                        type='button'
                        onClick={() => router.back()}
                        className='w-10 h-10 rounded-2xl bg-grey/5 hover:bg-grey/10 border border-grey/10 text-grey-dark flex items-center justify-center transition-colors cursor-pointer'
                        title='Back to My Orders'
                    >
                        <Icon icon='solar:alt-arrow-left-bold' className='text-base' />
                    </button>
                    <div>
                        <div className='flex items-center gap-2.5 flex-wrap'>
                            <h2 className='text-xl sm:text-2xl font-bold text-grey-dark tracking-tight'>
                                {order.id.startsWith('ORD-') ? order.id : `Order #${order.id.slice(-6).toUpperCase()}`}
                            </h2>
                            <span
                                className={`px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1.5 ${
                                    order.status === 'CONFIRMED' || order.status === 'ACCEPTED'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : order.status === 'ACTIVE'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : order.status === 'COMPLETED'
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        order.status === 'CONFIRMED' || order.status === 'ACCEPTED'
                                            ? 'bg-blue-600'
                                            : order.status === 'ACTIVE'
                                            ? 'bg-emerald-600'
                                            : order.status === 'COMPLETED'
                                            ? 'bg-green-600'
                                            : 'bg-amber-500'
                                    }`}
                                />
                                {order.status}
                            </span>
                        </div>
                        <p className='text-xs text-grey-muted mt-0.5'>
                            Subscription Ref: <span className='font-mono text-grey-dark'>{order.id}</span>
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() => downloadInvoice(order.id)}
                        disabled={isGenerating}
                        className='px-4 py-2 bg-white hover:bg-grey/5 border border-grey/15 rounded-2xl text-xs font-semibold text-grey-dark transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
                    >
                        {isGenerating ? (
                            <Icon icon='line-md:loading-loop' className='text-xs' />
                        ) : (
                            <Icon icon='solar:printer-bold-duotone' className='text-sm text-primary' />
                        )}
                        <span>Download Invoice</span>
                    </button>
                </div>
            </div>

            {/* 4 Stats Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='bg-white p-5 rounded-3xl border border-grey/10 shadow-xs space-y-1'>
                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider block'>Start Date</span>
                    <p className='text-base font-bold text-grey-dark'>{formatDate(startDate)}</p>
                    <span className='text-[11px] text-grey-muted block'>Ends approx {formatDate(endDate)}</span>
                </div>

                <div className='bg-white p-5 rounded-3xl border border-grey/10 shadow-xs space-y-1'>
                    <span className='text-[10px] font-bold text-emerald-700 uppercase tracking-wider block'>Delivered Progress</span>
                    <p className='text-base font-bold text-emerald-700'>{servedCount} of {totalDays} Days ({servedPercent}%)</p>
                    <span className='text-[11px] text-grey-muted block'>Completed meal servings</span>
                </div>

                <div className='bg-white p-5 rounded-3xl border border-grey/10 shadow-xs space-y-1'>
                    <span className='text-[10px] font-bold text-primary uppercase tracking-wider block'>Remaining Meals</span>
                    <p className='text-base font-bold text-primary'>{remainingDays} Days Remaining</p>
                    <span className='text-[11px] text-grey-muted block'>Scheduled in your calendar</span>
                </div>

                <div className='bg-white p-5 rounded-3xl border border-grey/10 shadow-xs space-y-1'>
                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider block'>Total Paid</span>
                    <p className='text-base font-bold text-grey-dark'>AED {order.totalAmount.toFixed(2)}</p>
                    <span className='text-[11px] text-emerald-700 font-semibold flex items-center gap-1'>
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                        {order.paymentStatus || 'PENDING'}
                    </span>
                </div>
            </div>

            {/* Delivery Location & Notes */}
            <div className='bg-white p-6 rounded-3xl border border-grey/10 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-1 text-xs'>
                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider block'>Delivery Location</span>
                    <p className='font-bold text-grey-dark'>{order.address}</p>
                    {(order.buildingName || order.flatRoomNumber) && (
                        <p className='text-grey-muted font-medium'>
                            Bldg: <strong>{order.buildingName || 'N/A'}</strong> • Flat/Room: <strong>{order.flatRoomNumber || 'N/A'}</strong>
                        </p>
                    )}
                </div>
                <div className='space-y-1 text-xs'>
                    <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider block'>Drop Preference</span>
                    <p className='font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg inline-block'>
                        {order.deliveryLocation}
                    </p>
                </div>
            </div>

            {/* Full Calendar Schedule Grid */}
            <div className='bg-white p-6 sm:p-8 rounded-3xl border border-grey/10 shadow-xs space-y-5'>
                <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                    <div>
                        <h3 className='text-base font-bold text-grey-dark'>Complete Meal Calendar Schedule</h3>
                        <p className='text-xs text-grey-muted'>Day-by-day food item dishes and delivery status</p>
                    </div>
                    <span className='px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200'>
                        {servedCount} / {totalDays} Served
                    </span>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5'>
                    {activeDates.map((dateStr, index) => {
                        const date = new Date(dateStr)
                        const isValid = !isNaN(date.getTime())
                        const items = getItemsForDate(dateStr)
                        const isServed = servedDates.includes(dateStr)

                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                                    isServed
                                        ? 'bg-emerald-50/50 border-emerald-200'
                                        : 'bg-white border-grey/10 hover:border-grey/25 shadow-2xs'
                                }`}
                            >
                                <div className='flex items-center justify-between border-b border-grey/10 pb-2'>
                                    <div>
                                        <span className='text-[10px] font-bold uppercase text-primary tracking-wider block'>
                                            Day {index + 1} • {isValid ? date.toLocaleDateString('en-US', { weekday: 'short' }) : 'Day'}
                                        </span>
                                        <span className='text-xs font-bold text-grey-dark'>
                                            {isValid ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : dateStr}
                                        </span>
                                    </div>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                            isServed
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-grey/10 text-grey-muted'
                                        }`}
                                    >
                                        {isServed ? (
                                            <>
                                                <Icon icon='solar:check-read-bold' className='text-xs' />
                                                <span>Served</span>
                                            </>
                                        ) : (
                                            <span>Scheduled</span>
                                        )}
                                    </span>
                                </div>

                                <div className='space-y-1.5'>
                                    {items.length > 0 ? (
                                        items.map((item, iIdx) => (
                                            <div key={iIdx} className='p-2 rounded-xl bg-grey/5 border border-grey/10 space-y-0.5'>
                                                <span className='text-[9px] font-bold uppercase text-grey-muted tracking-wider block'>
                                                    {item.category}
                                                </span>
                                                <span className='text-xs font-semibold text-grey-dark block leading-tight'>
                                                    {item.name}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className='text-xs text-grey-muted italic py-1'>Chef Special Mess Preparation</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
