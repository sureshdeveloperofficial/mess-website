'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, FilterOption } from '@/app/components/Admin/DataTable'
import { useInvoiceDownload } from '@/app/hooks/useInvoiceDownload'

export interface FoodItem {
    id: string
    name: string
    category: string
    price?: number
}

export interface FoodMenu {
    id: string
    name: string
    price: number
    days?: number
    foodItems: FoodItem[]
}

export interface Order {
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

const columnHelper = createColumnHelper<Order>()

export default function CustomerOrdersPage() {
    const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE')
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const { downloadInvoice, isGenerating } = useInvoiceDownload()

    const { data, isLoading, error } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const res = await axios.get('/api/orders/my-orders?limit=100')
            return res.data
        },
    })

    const orders: Order[] = data?.orders || []

    // Helper to sanitize dish name (strips "BREAKFAST - ", "LUNCH - ", "DINNER - ")
    const sanitizeDishName = (name: string) => {
        if (!name) return ''
        return name.replace(/^(breakfast|lunch|dinner|meal)\s*[-:]\s*/i, '').trim() || name
    }

    // Helper to get items for a specific date from selectionsJson filtered by chosenMealSlots
    const getItemsForDate = (order: Order, dateStr: string) => {
        try {
            const date = new Date(dateStr)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }) // e.g. "Monday"
            const isSunday = dayName === 'Sunday'
            const selections = order.selectionsJson || {}
            const items: { id: string; name: string; category?: string }[] = []

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
                        // Lookup food item across selected menus
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

    // Filter computation
    const filteredOrders = useMemo(() => {
        if (activeFilter === 'pending') {
            return orders.filter((o) => o.status === 'PENDING')
        }
        if (activeFilter === 'confirmed') {
            return orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'ACCEPTED')
        }
        if (activeFilter === 'active') {
            return orders.filter((o) => o.status === 'ACTIVE')
        }
        if (activeFilter === 'completed') {
            return orders.filter((o) => o.status === 'COMPLETED')
        }
        if (activeFilter === 'paid') {
            return orders.filter((o) => o.paymentStatus === 'PAID')
        }
        return orders
    }, [orders, activeFilter])

    // Filter options with live badge counts
    const filterOptions: FilterOption[] = useMemo(() => {
        const pendingCount = orders.filter((o) => o.status === 'PENDING').length
        const activeCount = orders.filter((o) => o.status === 'ACTIVE').length
        const completedCount = orders.filter((o) => o.status === 'COMPLETED').length
        const paidCount = orders.filter((o) => o.paymentStatus === 'PAID').length

        return [
            { id: 'all', label: 'All Subscriptions', count: orders.length },
            { id: 'active', label: 'Active Delivering', count: activeCount },
            { id: 'pending', label: 'Pending Review', count: pendingCount },
            { id: 'completed', label: 'Completed', count: completedCount },
            { id: 'paid', label: 'Paid', count: paidCount },
        ]
    }, [orders])

    // Reusable DataTable Columns Definition with Clean UI Chips & Modern Aesthetics
    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'Order Details',
                cell: (info) => {
                    const order = info.row.original
                    const shortId = order.id.slice(-6).toUpperCase()

                    return (
                        <div className='flex items-center gap-3 py-1 min-w-[200px] whitespace-nowrap'>
                            <div className='w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-primary flex items-center justify-center shrink-0 shadow-2xs'>
                                <Icon icon='solar:bag-check-bold-duotone' className='text-xl' />
                            </div>
                            <div className='min-w-0'>
                                <div className='flex items-center gap-1.5'>
                                    <span className='font-bold text-xs text-grey-dark tracking-tight whitespace-nowrap'>
                                        Order #{shortId}
                                    </span>
                                </div>
                                <span className='text-[11px] text-grey-muted flex items-center gap-1 mt-0.5 whitespace-nowrap'>
                                    <Icon icon='solar:calendar-bold' className='text-[10px] text-grey-muted shrink-0' />
                                    <span>{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </span>
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('selectionsJson', {
                header: 'Meal Plan & Slots',
                cell: (info) => {
                    const order = info.row.original
                    const weekdayPlan = order.selectionsJson?.weekdayPlan
                    const sundayPlan = order.selectionsJson?.sundayPlan
                    const chosenSlots: string[] = order.selectionsJson?.chosenMealSlots || []

                    return (
                        <div className='space-y-1.5 py-1 min-w-[240px] whitespace-nowrap'>
                            {/* Plan Name Pill */}
                            <div className='flex items-center gap-1.5 flex-nowrap'>
                                {weekdayPlan ? (
                                    <span className='px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap'>
                                        <Icon icon='solar:chef-hat-bold' className='text-amber-700 text-xs shrink-0' />
                                        <span>{weekdayPlan.name} ({weekdayPlan.days || 26} Days)</span>
                                    </span>
                                ) : (
                                    <span className='px-3 py-1 rounded-xl bg-grey/5 border border-grey/15 text-grey-dark text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap'>
                                        <Icon icon='solar:chef-hat-bold' className='text-grey-muted text-xs shrink-0' />
                                        <span>Standard Plan</span>
                                    </span>
                                )}

                                {sundayPlan && (
                                    <span className='px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-900 text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs whitespace-nowrap'>
                                        <Icon icon='solar:star-fall-bold' className='text-purple-700 text-xs shrink-0' />
                                        <span>+ Feast</span>
                                    </span>
                                )}
                            </div>

                            {/* Chosen Meal Slots Chips */}
                            {chosenSlots.length > 0 && (
                                <div className='flex items-center gap-1.5 flex-nowrap'>
                                    {chosenSlots.map((slot) => {
                                        const isBreakfast = slot.toLowerCase() === 'breakfast'
                                        const isLunch = slot.toLowerCase() === 'lunch'
                                        
                                        return (
                                            <span
                                                key={slot}
                                                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border whitespace-nowrap ${
                                                    isBreakfast
                                                        ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                                        : isLunch
                                                        ? 'bg-orange-50 text-orange-800 border-orange-200/80'
                                                        : 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                                                }`}
                                            >
                                                <Icon
                                                    icon={isBreakfast ? 'solar:cup-bold' : isLunch ? 'solar:chef-hat-bold' : 'solar:moon-stars-bold'}
                                                    className='text-xs shrink-0'
                                                />
                                                <span className='capitalize'>{slot}</span>
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                },
            }),
            columnHelper.accessor('activeDates', {
                header: 'Delivery Progress',
                cell: (info) => {
                    const order = info.row.original
                    const activeDates = order.activeDates || []
                    const servedDates = order.servedDates || []
                    const weekdayPlan = order.selectionsJson?.weekdayPlan
                    const sundayPlan = order.selectionsJson?.sundayPlan
                    const totalDays = activeDates.length || (weekdayPlan?.days || 26) + (sundayPlan?.days || ((order as any).includeSundays ? 4 : 0))
                    const servedCount = servedDates.length
                    const servedPercent = Math.min(100, Math.round((servedCount / (totalDays || 1)) * 100))

                    return (
                        <div className='space-y-1.5 min-w-[160px] py-1 whitespace-nowrap'>
                            <div className='flex items-center justify-between text-xs font-bold gap-2'>
                                <span className='text-grey-dark flex items-center gap-1 whitespace-nowrap'>
                                    <Icon icon='solar:scooter-bold' className='text-primary text-xs shrink-0' />
                                    <span>{servedCount}/{totalDays} Days</span>
                                </span>
                                <span className='text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold text-[10px] border border-emerald-200 whitespace-nowrap'>
                                    {servedPercent}%
                                </span>
                            </div>
                            <div className='w-full bg-grey/15 h-2 rounded-full overflow-hidden'>
                                <div
                                    className='bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300'
                                    style={{ width: `${servedPercent}%` }}
                                />
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('startDate', {
                header: 'Start Date',
                cell: (info) => {
                    const dateStr = info.getValue()
                    const date = new Date(dateStr)
                    const isValid = !isNaN(date.getTime())

                    return (
                        <div className='text-xs font-semibold text-grey-dark py-1 min-w-[140px] whitespace-nowrap'>
                            <div className='flex items-center gap-1.5 whitespace-nowrap'>
                                <Icon icon='solar:calendar-mark-bold-duotone' className='text-primary text-sm shrink-0' />
                                <span>{isValid ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : dateStr}</span>
                            </div>
                            <span className='text-[10px] text-grey-muted block mt-0.5 whitespace-nowrap'>
                                {isValid ? date.toLocaleDateString('en-US', { weekday: 'long' }) : ''}
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('totalAmount', {
                header: 'Total & Payment',
                cell: (info) => {
                    const order = info.row.original
                    const isPaid = order.paymentStatus === 'PAID'

                    return (
                        <div className='space-y-1 py-1 min-w-[130px] whitespace-nowrap'>
                            <div className='font-bold text-xs text-grey-dark whitespace-nowrap'>
                                AED {info.getValue().toFixed(2)}
                            </div>
                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                                    isPaid
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                                <span>{order.paymentStatus || 'PENDING'}</span>
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => {
                    const status = info.getValue()
                    const isConfirmed = status === 'CONFIRMED' || status === 'ACCEPTED'
                    const isActive = status === 'ACTIVE'
                    const isCompleted = status === 'COMPLETED'

                    return (
                        <div className='min-w-[140px] whitespace-nowrap py-1'>
                            <span
                                className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 border shadow-2xs whitespace-nowrap ${
                                    isConfirmed
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : isActive
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : isCompleted
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        isConfirmed
                                            ? 'bg-blue-600'
                                            : isActive
                                            ? 'bg-emerald-600'
                                            : isCompleted
                                            ? 'bg-green-600'
                                            : 'bg-amber-500'
                                    }`}
                                />
                                <span>
                                    {isConfirmed
                                        ? 'Order Accepted'
                                        : isActive
                                        ? 'Active Delivering'
                                        : status === 'PENDING'
                                        ? 'Pending Review'
                                        : status}
                                </span>
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (info) => {
                    const order = info.row.original

                    return (
                        <div className='flex items-center gap-2 justify-end py-1 min-w-[140px] whitespace-nowrap'>
                            <button
                                type='button'
                                onClick={() => downloadInvoice(order.id)}
                                disabled={isGenerating}
                                className='p-2 rounded-xl bg-grey/5 hover:bg-grey/10 border border-grey/15 text-grey-dark transition-all cursor-pointer disabled:opacity-40 shadow-2xs shrink-0'
                                title='Download PDF Invoice'
                            >
                                {isGenerating ? (
                                    <Icon icon='line-md:loading-loop' className='text-sm' />
                                ) : (
                                    <Icon icon='solar:printer-bold-duotone' className='text-sm text-primary' />
                                )}
                            </button>

                            <Link
                                href={`/my-orders/${order.id}`}
                                className='px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all shrink-0 whitespace-nowrap'
                            >
                                <span>Calendar</span>
                                <Icon icon='solar:arrow-right-up-bold' className='text-[10px]' />
                            </Link>
                        </div>
                    )
                },
            }),
        ],
        [isGenerating, downloadInvoice]
    )

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[50vh] space-y-4'>
                <div className='w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl animate-spin'>
                    <Icon icon='line-md:loading-loop' />
                </div>
                <p className='text-xs font-semibold text-grey-muted'>Loading your subscriptions...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='bg-white rounded-3xl border border-red-200 p-8 sm:p-12 text-center shadow-xs'>
                <div className='w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-red-200'>
                    <Icon icon='solar:danger-triangle-bold' />
                </div>
                <h2 className='text-lg font-bold text-grey-dark mb-2'>Unable to load orders</h2>
                <p className='text-xs text-grey-muted mb-6'>Please check your connection or sign in again.</p>
                <button
                    type='button'
                    onClick={() => window.location.reload()}
                    className='px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer'
                >
                    Refresh Page
                </button>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header with Title and View Switcher */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-grey/10 shadow-xs'>
                <div>
                    <h2 className='text-xl sm:text-2xl font-bold text-grey-dark tracking-tight'>
                        My Subscriptions &amp; Orders
                    </h2>
                    <p className='text-xs text-grey-muted mt-1'>
                        Manage your active meal plans, calendar deliveries, and invoices
                    </p>
                </div>

                <div className='flex items-center gap-3'>
                    {/* View Mode Toggle */}
                    <div className='flex items-center bg-grey/5 p-1 rounded-2xl border border-grey/10 text-xs font-semibold'>
                        <button
                            type='button'
                            onClick={() => setViewMode('TABLE')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                viewMode === 'TABLE'
                                    ? 'bg-white text-primary shadow-xs font-bold'
                                    : 'text-grey-muted hover:text-grey-dark'
                            }`}
                        >
                            <Icon icon='solar:list-bold' className='text-sm' />
                            <span>Table View</span>
                        </button>
                        <button
                            type='button'
                            onClick={() => setViewMode('CARDS')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                viewMode === 'CARDS'
                                    ? 'bg-white text-primary shadow-xs font-bold'
                                    : 'text-grey-muted hover:text-grey-dark'
                            }`}
                        >
                            <Icon icon='solar:widget-2-bold' className='text-sm' />
                            <span>Cards View</span>
                        </button>
                    </div>

                    <Link
                        href='/get-started'
                        className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs hover:bg-primary/90 shadow-md shadow-primary/20 transition-all'
                    >
                        <Icon icon='solar:cart-large-bold' className='text-base' />
                        <span className='hidden sm:inline'>Order New Plan</span>
                    </Link>
                </div>
            </div>

            {/* Empty State */}
            {orders.length === 0 ? (
                <div className='bg-white rounded-3xl border border-grey/10 p-12 sm:p-16 text-center shadow-xs space-y-4'>
                    <div className='w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto border border-primary/20'>
                        <Icon icon='solar:box-minimalistic-bold-duotone' />
                    </div>
                    <h3 className='text-lg font-bold text-grey-dark'>No Active Subscriptions Found</h3>
                    <p className='text-xs text-grey-muted max-w-md mx-auto'>
                        You haven't subscribed to any meal plans yet. Choose from our delicious 26-day weekday mess plans and Sunday Biryani feasts!
                    </p>
                    <div className='pt-2'>
                        <Link
                            href='/get-started'
                            className='inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:scale-105 transition-all'
                        >
                            <Icon icon='solar:chef-hat-bold-duotone' className='text-lg' />
                            <span>Explore Plans &amp; Start Today</span>
                        </Link>
                    </div>
                </div>
            ) : viewMode === 'TABLE' ? (
                /* 1. REUSABLE DATA TABLE VIEW */
                <DataTable
                    data={filteredOrders}
                    columns={columns}
                    searchPlaceholder='Search by order ID, plan, or date...'
                    filterOptions={filterOptions}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    initialPageSize={10}
                    emptyMessage='No matching subscriptions found'
                    emptySubtext='Try adjusting your search query or filter tabs'
                />
            ) : (
                /* 2. DETAILED INTERACTIVE CARDS VIEW */
                <div className='space-y-6'>
                    {/* Status Filter Tabs for Cards View */}
                    <div className='flex items-center gap-2 overflow-x-auto pb-1'>
                        {filterOptions.map((f) => (
                            <button
                                key={f.id}
                                type='button'
                                onClick={() => setActiveFilter(f.id)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                    activeFilter === f.id
                                        ? 'bg-primary text-white border-primary shadow-xs'
                                        : 'bg-white text-grey-muted border-grey/10 hover:border-grey/20 hover:text-grey-dark'
                                }`}
                            >
                                {f.label} ({f.count})
                            </button>
                        ))}
                    </div>

                    <div className='space-y-6'>
                        {filteredOrders.map((order) => {
                            const activeDates = (order.activeDates || []) as string[]
                            const servedDates = (order.servedDates || []) as string[]
                            const today = new Date(new Date().setHours(0, 0, 0, 0))
                            const weekdayPlan = order.selectionsJson?.weekdayPlan
                            const sundayPlan = order.selectionsJson?.sundayPlan
                            const chosenSlots = order.selectionsJson?.chosenMealSlots || []
                            const totalDays = activeDates.length || (weekdayPlan?.days || 26) + (sundayPlan?.days || ((order as any).includeSundays ? 4 : 0))
                            const servedCount = servedDates.length
                            const servedPercent = Math.min(100, Math.round((servedCount / (totalDays || 1)) * 100))
                            const remainingDays = activeDates.filter((d) => new Date(d) >= today && !servedDates.includes(d)).length

                            return (
                                <div
                                    key={order.id}
                                    className='bg-white rounded-3xl border border-grey/10 shadow-xs overflow-hidden transition-all hover:shadow-md'
                                >
                                    {/* Card Top Banner */}
                                    <div className='p-5 sm:px-7 border-b border-grey/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]/50'>
                                        <div className='flex items-center gap-3 flex-wrap'>
                                            <span className='font-bold text-sm text-grey-dark'>
                                                Order #{order.id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className='text-grey/30 hidden sm:inline'>•</span>
                                            <span className='text-xs text-grey-muted'>
                                                Starts {new Date(order.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className='text-grey/30 hidden sm:inline'>•</span>
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
                                                {order.status === 'CONFIRMED' || order.status === 'ACCEPTED'
                                                    ? 'Order Accepted'
                                                    : order.status === 'ACTIVE'
                                                    ? 'Deliveries Active'
                                                    : order.status === 'PENDING'
                                                    ? 'Pending Review'
                                                    : order.status}
                                            </span>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <button
                                                type='button'
                                                onClick={() => downloadInvoice(order.id)}
                                                disabled={isGenerating}
                                                className='px-3 py-1.5 bg-white hover:bg-grey/5 border border-grey/15 rounded-xl text-xs font-semibold text-grey-dark transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
                                                title='Download PDF Invoice'
                                            >
                                                {isGenerating ? (
                                                    <Icon icon='line-md:loading-loop' className='text-xs' />
                                                ) : (
                                                    <Icon icon='solar:printer-bold-duotone' className='text-sm text-primary' />
                                                )}
                                                <span>Invoice</span>
                                            </button>

                                            <Link
                                                href={`/my-orders/${order.id}`}
                                                className='px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs'
                                            >
                                                <span>View Calendar</span>
                                                <Icon icon='solar:arrow-right-up-bold' className='text-xs' />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Card Body Content */}
                                    <div className='p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-6'>
                                        {/* Column 1: Subscribed Plan Details & Progress */}
                                        <div className='space-y-4'>
                                            <div>
                                                <span className='text-[10px] font-bold uppercase tracking-wider text-grey-muted block mb-1.5'>
                                                    Subscribed Plan
                                                </span>
                                                <div className='flex flex-wrap gap-1.5 mb-2'>
                                                    {weekdayPlan ? (
                                                        <span className='px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold'>
                                                            {weekdayPlan.name} ({weekdayPlan.days || 26} Days)
                                                        </span>
                                                    ) : (
                                                        <span className='px-2.5 py-1 bg-grey/5 border border-grey/10 text-grey-dark rounded-lg text-xs font-bold'>
                                                            Standard Meal Plan
                                                        </span>
                                                    )}
                                                    {sundayPlan && (
                                                        <span className='px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg text-xs font-bold'>
                                                            + Sunday Feast
                                                        </span>
                                                    )}
                                                </div>

                                                {chosenSlots.length > 0 && (
                                                    <p className='text-xs text-grey-muted font-medium'>
                                                        Meal Slots:{' '}
                                                        <strong className='text-grey-dark uppercase font-semibold'>
                                                            {chosenSlots.join(' + ')}
                                                        </strong>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Delivery Progress Bar */}
                                            <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 space-y-2'>
                                                <div className='flex items-center justify-between text-xs font-bold'>
                                                    <span className='text-grey-dark flex items-center gap-1.5'>
                                                        <Icon icon='solar:scooter-bold' className='text-primary text-sm' />
                                                        <span>Delivery Progress</span>
                                                    </span>
                                                    <span className='text-emerald-700 font-bold'>
                                                        {servedCount} / {totalDays} Days ({servedPercent}%)
                                                    </span>
                                                </div>
                                                <div className='w-full bg-grey/15 h-2 rounded-full overflow-hidden'>
                                                    <div
                                                        className='bg-primary h-full rounded-full transition-all duration-300'
                                                        style={{ width: `${servedPercent}%` }}
                                                    />
                                                </div>
                                                <p className='text-[11px] text-grey-muted'>
                                                    {remainingDays > 0
                                                        ? `${remainingDays} upcoming delivery days remaining`
                                                        : 'All scheduled meals delivered!'}
                                                </p>
                                            </div>

                                            {/* Payment & Drop Info */}
                                            <div className='grid grid-cols-2 gap-3 text-xs'>
                                                <div className='p-3 bg-grey/5 rounded-xl border border-grey/10'>
                                                    <span className='text-[10px] text-grey-muted font-semibold uppercase block'>
                                                        Payment
                                                    </span>
                                                    <span className='font-bold text-grey-dark mt-0.5 flex items-center gap-1'>
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                order.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'
                                                            }`}
                                                        />
                                                        {order.paymentStatus || 'PENDING'}
                                                    </span>
                                                </div>
                                                <div className='p-3 bg-primary/10 rounded-xl border border-primary/20'>
                                                    <span className='text-[10px] text-grey-muted font-semibold uppercase block'>
                                                        Total Amount
                                                    </span>
                                                    <span className='font-bold text-grey-dark mt-0.5 block'>
                                                        AED {order.totalAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 2 & 3: Upcoming Scheduled Meals Grid */}
                                        <div className='lg:col-span-2 border-t lg:border-t-0 lg:border-l border-grey/10 pt-4 lg:pt-0 lg:pl-6 space-y-3'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-[11px] font-bold text-grey-dark uppercase tracking-wider flex items-center gap-1.5'>
                                                    <Icon icon='solar:calendar-mark-bold-duotone' className='text-primary text-sm' />
                                                    <span>Upcoming &amp; Served Meals Preview</span>
                                                </span>
                                                <Link
                                                    href={`/my-orders/${order.id}`}
                                                    className='text-xs font-bold text-primary hover:underline flex items-center gap-0.5'
                                                >
                                                    <span>Full Calendar ({activeDates.length} Days)</span>
                                                    <Icon icon='solar:arrow-right-up-bold' className='text-xs' />
                                                </Link>
                                            </div>

                                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                                                {activeDates.slice(0, 6).map((dateStr, dIdx) => {
                                                    const date = new Date(dateStr)
                                                    const isValid = !isNaN(date.getTime())
                                                    const items = getItemsForDate(order, dateStr)
                                                    const isServed = servedDates.includes(dateStr)

                                                    return (
                                                        <div
                                                            key={dIdx}
                                                            className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                                                                isServed
                                                                    ? 'bg-emerald-50/50 border-emerald-200'
                                                                    : 'bg-white border-grey/10 hover:border-grey/25 shadow-2xs'
                                                            }`}
                                                        >
                                                            <div className='flex items-center justify-between border-b border-grey/10 pb-1.5'>
                                                                <div>
                                                                    <span className='text-[10px] font-bold text-primary uppercase block'>
                                                                        {isValid ? date.toLocaleDateString('en-US', { weekday: 'short' }) : 'Day'}
                                                                    </span>
                                                                    <span className='text-xs font-bold text-grey-dark'>
                                                                        {isValid ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : dateStr}
                                                                    </span>
                                                                </div>
                                                                <span
                                                                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 ${
                                                                        isServed
                                                                            ? 'bg-emerald-600 text-white'
                                                                            : 'bg-grey/10 text-grey-muted'
                                                                    }`}
                                                                >
                                                                    {isServed ? (
                                                                        <>
                                                                            <Icon icon='solar:check-read-bold' className='text-[10px]' />
                                                                            <span>Served</span>
                                                                        </>
                                                                    ) : (
                                                                        <span>Scheduled</span>
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className='space-y-1'>
                                                                {items.length > 0 ? (
                                                                    items.map((item, iIdx) => (
                                                                        <div key={iIdx} className='text-[11px] leading-tight'>
                                                                            <span className='text-[9px] font-bold uppercase text-grey-muted mr-1'>
                                                                                {item.category}:
                                                                            </span>
                                                                            <span className='font-semibold text-grey-dark'>
                                                                                {item.name}
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <p className='text-[11px] text-grey-muted italic'>Chef Daily Mess Meal</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
