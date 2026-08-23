'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { format } from 'date-fns'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInvoiceDownload } from '@/app/hooks/useInvoiceDownload'
import CustomSelect, { SelectOption } from '@/app/components/Common/CustomSelect'

export type Customer = {
    id: string
    name: string
    phone: string
    email?: string
    whatsappNo?: string
}

export type FoodItem = {
    id: string
    name: string
    image?: string
    category?: string
    description?: string
    price?: number
}

export type FoodMenu = {
    id: string
    name: string
    foodItems?: FoodItem[]
}

export type Order = {
    id: string
    customerId: string
    customer: Customer
    address: string
    buildingName?: string
    flatRoomNumber?: string
    startDate: string
    paymentMethod: string
    paymentStatus?: string
    deliveryLocation: string
    totalAmount: number
    status: string
    orderRemarks?: string
    paymentRemarks?: string
    paymentReceiptUrl?: string
    createdAt: string
    selectedMenus: FoodMenu[]
    selectionsJson?: any
    includeSundays?: boolean
    sundaysCount?: number
    activeDates: string[]
    servedDates?: string[]
}

interface OrderViewDialogProps {
    order: Order | null
    isOpen: boolean
    onClose: () => void
    onOrderUpdated?: () => void
}

export function OrderViewDialog({ order, isOpen, onClose, onOrderUpdated }: OrderViewDialogProps) {
    const queryClient = useQueryClient()
    const { downloadInvoice, isGenerating } = useInvoiceDownload()

    const [statusValue, setStatusValue] = useState<string>(order?.status || 'PENDING')
    const [paymentStatusValue, setPaymentStatusValue] = useState<string>(order?.paymentStatus || 'PENDING')
    const [servedDatesList, setServedDatesList] = useState<string[]>(order?.servedDates || [])
    const [scheduleFilter, setScheduleFilter] = useState<'ALL' | 'PENDING' | 'SERVED'>('ALL')
    const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS')

    // Sync state when order changes
    React.useEffect(() => {
        if (order) {
            setStatusValue(order.status || 'PENDING')
            setPaymentStatusValue(order.paymentStatus || 'PENDING')
            setServedDatesList(order.servedDates || [])
        }
    }, [order])

    // Update status mutation
    const updateMutation = useMutation({
        mutationFn: async (updatedFields: { status?: string; paymentStatus?: string; servedDates?: string[] }) => {
            if (!order) return
            const res = await axios.patch(`/api/orders/${order.id}`, updatedFields)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order', order?.id] })
            toast.success('Order updated successfully!')
            if (onOrderUpdated) onOrderUpdated()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to update order')
        },
    })

    const handleToggleDateServed = (dateStr: string) => {
        const isCurrentlyServed = servedDatesList.includes(dateStr)
        const nextServedDates = isCurrentlyServed
            ? servedDatesList.filter((d) => d !== dateStr)
            : [...servedDatesList, dateStr]

        setServedDatesList(nextServedDates)
        updateMutation.mutate({ servedDates: nextServedDates })
    }

    // Build lookup map for food items across all attached menus
    const foodItemMap = useMemo(() => {
        const map = new Map<string, FoodItem>()
        if (order?.selectedMenus) {
            order.selectedMenus.forEach((menu) => {
                if (menu.foodItems) {
                    menu.foodItems.forEach((item) => {
                        map.set(item.id, item)
                        map.set(item.name.toLowerCase(), item)
                    })
                }
            })
        }
        return map
    }, [order])

    if (!isOpen || !order) return null

    const shortId = order.id.slice(-6).toUpperCase()
    const customer = order.customer
    const initials = customer?.name
        ? customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()
        : 'CU'

    const weekdayPlanMeta = order.selectionsJson?.weekdayPlan
    const sundayPlanMeta = order.selectionsJson?.sundayPlan
    const chosenSlots: string[] = order.selectionsJson?.chosenMealSlots || []
    const dailyDishes = order.selectionsJson?.dailyDishes || {}

    const totalDaysCount = (order.activeDates || []).length || (weekdayPlanMeta?.days || 26) + (sundayPlanMeta?.days || (order.includeSundays ? 4 : 0))
    const servedCount = servedDatesList.length
    const servedPercent = Math.min(100, Math.round((servedCount / (totalDaysCount || 1)) * 100))

    // Helper to sanitize dish name (strips "BREAKFAST - ", "LUNCH - ", "DINNER - ")
    const sanitizeDishName = (name: string) => {
        if (!name) return ''
        return name.replace(/^(breakfast|lunch|dinner|meal)\s*[-:]\s*/i, '').trim() || name
    }

    // Helper to resolve dish display for a day & slot
    const getDishInfo = (day: string, slot: string) => {
        const dishIdOrName = dailyDishes?.[day]?.[slot] || dailyDishes?.[day]?.[slot.toLowerCase()]
        if (!dishIdOrName) return null

        if (typeof dishIdOrName === 'object' && dishIdOrName !== null) {
            return { ...dishIdOrName, name: sanitizeDishName(dishIdOrName.name) }
        }

        const found = foodItemMap.get(dishIdOrName) || foodItemMap.get(String(dishIdOrName).toLowerCase())
        if (found) return { ...found, name: sanitizeDishName(found.name) }

        return { name: sanitizeDishName(dishIdOrName) }
    }

    const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    // Compile daily schedule array with full food item details
    const scheduledDaysList = (order.activeDates || []).map((dateStr, index) => {
        const parsedDate = new Date(dateStr)
        const isValid = !isNaN(parsedDate.getTime())
        const dayOfWeek = isValid ? dayNameMap[parsedDate.getDay()] : 'Monday'
        const isSunday = dayOfWeek === 'Sunday'
        const isServed = servedDatesList.includes(dateStr)

        const meals: { slot: string; dishName: string; icon: string; bg: string; text: string; border: string }[] = []

        if (isSunday) {
            const feastDish = getDishInfo('Sunday', 'lunch') || getDishInfo('Sunday', 'sunday') || { name: sundayPlanMeta?.name || 'Sunday Special Biryani Feast' }
            meals.push({
                slot: 'Sunday Feast',
                dishName: feastDish.name,
                icon: 'solar:star-fall-bold',
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                border: 'border-purple-200',
            })
        } else if (chosenSlots.length > 0) {
            chosenSlots.forEach((slot) => {
                const dish = getDishInfo(dayOfWeek, slot)
                const isBreakfast = slot.toLowerCase() === 'breakfast'
                const isLunch = slot.toLowerCase() === 'lunch'
                
                meals.push({
                    slot: slot.toUpperCase(),
                    dishName: dish?.name || 'Chef Daily Specialty',
                    icon: isBreakfast ? 'solar:cup-bold' : isLunch ? 'solar:chef-hat-bold' : 'solar:moon-stars-bold',
                    bg: isBreakfast ? 'bg-amber-50/80' : isLunch ? 'bg-orange-50/80' : 'bg-indigo-50/80',
                    text: isBreakfast ? 'text-amber-800' : isLunch ? 'text-orange-800' : 'text-indigo-800',
                    border: isBreakfast ? 'border-amber-200' : isLunch ? 'border-orange-200' : 'border-indigo-200',
                })
            })
        } else {
            meals.push({
                slot: 'Meal Plan',
                dishName: 'Daily Mess Special',
                icon: 'solar:chef-hat-bold',
                bg: 'bg-amber-50/80',
                text: 'text-amber-800',
                border: 'border-amber-200',
            })
        }

        return {
            dayNumber: index + 1,
            dateStr,
            parsedDate,
            formattedDate: isValid ? format(parsedDate, 'dd MMM yyyy') : dateStr,
            dayOfWeek,
            dayOfWeekShort: isValid ? format(parsedDate, 'EEE') : dayOfWeek.substring(0, 3),
            isSunday,
            isServed,
            meals,
        }
    })

    const filteredSchedule = scheduledDaysList.filter((item) => {
        if (scheduleFilter === 'SERVED') return item.isServed
        if (scheduleFilter === 'PENDING') return !item.isServed
        return true
    })

    return (
        <AnimatePresence>
            <div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 12 }}
                    transition={{ duration: 0.2 }}
                    className='bg-white rounded-3xl w-[95vw] max-w-[1360px] shadow-2xl border border-grey/10 overflow-hidden my-3 sm:my-6 flex flex-col max-h-[92vh]'
                >
                    {/* 1. DIALOG HEADER */}
                    <div className='p-4 sm:px-8 border-b border-grey/10 flex items-center justify-between bg-white sticky top-0 z-20'>
                        <div className='flex items-center gap-3.5'>
                            <div className='w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shrink-0'>
                                <Icon icon='solar:bag-check-bold-duotone' />
                            </div>
                            <div>
                                <div className='flex items-center gap-2.5 flex-wrap'>
                                    <h2 className='text-lg sm:text-xl font-bold text-grey-dark tracking-tight'>
                                        Order #{shortId}
                                    </h2>
                                    <span
                                        className={`px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1.5 ${
                                            order.status === 'CONFIRMED' || order.status === 'ACCEPTED'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : order.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : order.status === 'COMPLETED'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : order.status === 'CANCELLED'
                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                        }`}
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                order.status === 'CONFIRMED' || order.status === 'ACCEPTED'
                                                    ? 'bg-blue-600'
                                                    : order.status === 'ACTIVE'
                                                    ? 'bg-emerald-600'
                                                    : order.status === 'COMPLETED'
                                                    ? 'bg-green-600'
                                                    : order.status === 'CANCELLED'
                                                    ? 'bg-red-600'
                                                    : 'bg-amber-500'
                                            }`}
                                        />
                                        {order.status}
                                    </span>
                                </div>
                                <p className='text-xs text-grey-muted mt-0.5 flex items-center gap-1.5'>
                                    <Icon icon='solar:calendar-bold' className='text-xs text-primary' />
                                    <span>Placed on {format(new Date(order.createdAt), 'dd MMMM yyyy (hh:mm a)')}</span>
                                    <span className='text-grey/30'>•</span>
                                    <span className='text-grey-dark font-medium'>Ref: {order.id}</span>
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='w-9 h-9 rounded-2xl bg-grey/5 hover:bg-grey/10 text-grey-muted hover:text-grey-dark flex items-center justify-center transition-colors cursor-pointer'
                                title='Close dialog'
                            >
                                <Icon icon='solar:close-circle-bold' className='text-xl' />
                            </button>
                        </div>
                    </div>

                    {/* 2. DIALOG SCROLLABLE CONTENT */}
                    <div className='p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto flex-1 bg-[#FAF8F5]/40'>
                        
                        {/* 1-Click Status Quick Actions Bar */}
                        <div className='p-4 bg-white rounded-2xl border border-primary/20 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                            <div className='flex items-center gap-3'>
                                <div className='w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0'>
                                    <Icon icon='solar:shield-check-bold' />
                                </div>
                                <div>
                                    <span className='text-xs font-bold text-grey-dark block'>
                                        Quick Action &amp; Order Status Control
                                    </span>
                                    <span className='text-[11px] text-grey-muted'>
                                        Status: <strong className='text-grey-dark uppercase font-semibold'>{order.status}</strong> • Payment: <strong className='text-emerald-700 font-semibold'>{order.paymentStatus || 'PENDING'}</strong>
                                    </span>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 flex-wrap'>
                                {order.status === 'PENDING' && (
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setStatusValue('CONFIRMED')
                                            updateMutation.mutate({ status: 'CONFIRMED' })
                                        }}
                                        disabled={updateMutation.isPending}
                                        className='px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer'
                                    >
                                        <Icon icon='solar:check-read-bold' className='text-sm' />
                                        <span>Accept Order</span>
                                    </button>
                                )}

                                {order.status === 'CONFIRMED' && (
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setStatusValue('ACTIVE')
                                            updateMutation.mutate({ status: 'ACTIVE' })
                                        }}
                                        disabled={updateMutation.isPending}
                                        className='px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer'
                                    >
                                        <Icon icon='solar:scooter-bold' className='text-sm' />
                                        <span>Start Deliveries</span>
                                    </button>
                                )}

                                {order.status === 'ACTIVE' && (
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setStatusValue('COMPLETED')
                                            updateMutation.mutate({ status: 'COMPLETED' })
                                        }}
                                        disabled={updateMutation.isPending}
                                        className='px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer'
                                    >
                                        <Icon icon='solar:cup-star-bold' className='text-sm' />
                                        <span>Mark Completed</span>
                                    </button>
                                )}

                                <CustomSelect
                                    value={statusValue}
                                    onChange={(newStatus) => {
                                        setStatusValue(newStatus)
                                        updateMutation.mutate({ status: newStatus })
                                    }}
                                    options={[
                                        { value: 'PENDING', label: 'PENDING', dotColor: 'bg-amber-500', description: 'Awaiting admin review' },
                                        { value: 'CONFIRMED', label: 'CONFIRMED', dotColor: 'bg-blue-600', description: 'Order accepted' },
                                        { value: 'ACTIVE', label: 'ACTIVE', dotColor: 'bg-emerald-600', description: 'Meal deliveries in progress' },
                                        { value: 'COMPLETED', label: 'COMPLETED', dotColor: 'bg-purple-600', description: 'Subscription finished' },
                                        { value: 'CANCELLED', label: 'CANCELLED', dotColor: 'bg-red-600', description: 'Order cancelled' },
                                    ]}
                                    labelPrefix='Status: '
                                    disabled={updateMutation.isPending}
                                />

                                <CustomSelect
                                    value={paymentStatusValue}
                                    onChange={(newPaymentStatus) => {
                                        setPaymentStatusValue(newPaymentStatus)
                                        updateMutation.mutate({ paymentStatus: newPaymentStatus })
                                    }}
                                    options={[
                                        { value: 'PENDING', label: 'PENDING', dotColor: 'bg-amber-500', description: 'Awaiting receipt or COD' },
                                        { value: 'PAID', label: 'PAID', dotColor: 'bg-emerald-600', description: 'Full payment verified' },
                                        { value: 'FAILED', label: 'FAILED', dotColor: 'bg-red-600', description: 'Payment rejected or failed' },
                                    ]}
                                    labelPrefix='Payment: '
                                    disabled={updateMutation.isPending}
                                />

                                {updateMutation.isPending && (
                                    <Icon icon='line-md:loading-loop' className='text-primary text-lg animate-spin' />
                                )}
                            </div>
                        </div>

                        {/* 3-Column Structured Information Cards */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                            
                            {/* Card 1: Customer Profile */}
                            <div className='bg-white p-5 rounded-3xl border border-grey/10 shadow-xs flex flex-col justify-between space-y-4'>
                                <div>
                                    <div className='flex items-center justify-between border-b border-grey/10 pb-2.5 mb-3'>
                                        <span className='text-xs font-bold uppercase tracking-wider text-grey-dark flex items-center gap-1.5'>
                                            <Icon icon='solar:user-bold-duotone' className='text-primary text-base' />
                                            <span>Customer Profile</span>
                                        </span>
                                        {customer?.id && (
                                            <Link
                                                href={`/admin/customers/${customer.id}`}
                                                className='text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5'
                                            >
                                                <span>Profile</span>
                                                <Icon icon='solar:arrow-right-up-bold' />
                                            </Link>
                                        )}
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-grey-dark font-bold text-xs flex items-center justify-center shrink-0'>
                                            {initials}
                                        </div>
                                        <div className='min-w-0'>
                                            <span className='font-bold text-sm text-grey-dark block truncate'>
                                                {customer?.name || 'Customer'}
                                            </span>
                                            <span className='text-xs text-grey-muted block truncate'>
                                                {customer?.email || 'No email registered'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-2 pt-2.5 border-t border-grey/10 text-xs'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-grey-muted flex items-center gap-1.5'>
                                            <Icon icon='solar:phone-bold' className='text-primary text-xs' />
                                            <span>Phone:</span>
                                        </span>
                                        <a
                                            href={`tel:${customer?.phone}`}
                                            className='font-semibold text-grey-dark hover:text-primary hover:underline'
                                        >
                                            {customer?.phone || 'N/A'}
                                        </a>
                                    </div>

                                    {customer?.whatsappNo && (
                                        <div className='flex items-center justify-between'>
                                            <span className='text-grey-muted flex items-center gap-1.5'>
                                                <Icon icon='logos:whatsapp-icon' className='text-xs' />
                                                <span>WhatsApp:</span>
                                            </span>
                                            <a
                                                href={`https://wa.me/${customer.whatsappNo.replace(/[^0-9]/g, '')}`}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='font-semibold text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]'
                                            >
                                                <span>{customer.whatsappNo}</span>
                                                <Icon icon='solar:arrow-right-up-bold' className='text-[9px]' />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card 2: Delivery & Address */}
                            <div className='bg-white p-5 rounded-3xl border border-grey/10 shadow-xs flex flex-col justify-between space-y-4'>
                                <div>
                                    <div className='flex items-center justify-between border-b border-grey/10 pb-2.5 mb-3'>
                                        <span className='text-xs font-bold uppercase tracking-wider text-grey-dark flex items-center gap-1.5'>
                                            <Icon icon='solar:map-point-bold-duotone' className='text-primary text-base' />
                                            <span>Delivery &amp; Schedule</span>
                                        </span>
                                    </div>

                                    <div className='space-y-1.5 text-xs'>
                                        <div>
                                            <span className='text-[10px] font-semibold text-grey-muted uppercase block'>Street Address</span>
                                            <span className='font-semibold text-grey-dark leading-snug block'>
                                                {order.address}
                                            </span>
                                        </div>

                                        {(order.buildingName || order.flatRoomNumber) && (
                                            <div className='flex items-center gap-2 text-xs pt-1'>
                                                {order.buildingName && (
                                                    <span className='px-2 py-0.5 rounded-md bg-grey/5 font-medium text-grey-dark border border-grey/10'>
                                                        Bldg: <strong>{order.buildingName}</strong>
                                                    </span>
                                                )}
                                                {order.flatRoomNumber && (
                                                    <span className='px-2 py-0.5 rounded-md bg-grey/5 font-medium text-grey-dark border border-grey/10'>
                                                        Room/Flat: <strong>{order.flatRoomNumber}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='space-y-1.5 pt-2.5 border-t border-grey/10 text-xs'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-grey-muted'>Drop Location:</span>
                                        <span className='font-semibold text-grey-dark bg-primary/10 px-2 py-0.5 rounded-md'>
                                            {order.deliveryLocation}
                                        </span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-grey-muted'>Service Starts:</span>
                                        <span className='font-semibold text-grey-dark'>
                                            {format(new Date(order.startDate), 'dd MMMM yyyy')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Subscribed Plans & Total */}
                            <div className='bg-white p-5 rounded-3xl border border-grey/10 shadow-xs flex flex-col justify-between space-y-4'>
                                <div>
                                    <div className='flex items-center justify-between border-b border-grey/10 pb-2.5 mb-3'>
                                        <span className='text-xs font-bold uppercase tracking-wider text-grey-dark flex items-center gap-1.5'>
                                            <Icon icon='solar:card-2-bold-duotone' className='text-primary text-base' />
                                            <span>Subscribed Plans &amp; Total</span>
                                        </span>
                                    </div>

                                    <div className='space-y-2 text-xs'>
                                        {weekdayPlanMeta && (
                                            <div className='flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80'>
                                                <div>
                                                    <div className='flex items-center gap-1.5 flex-wrap'>
                                                        <span className='font-bold text-grey-dark block'>
                                                            {weekdayPlanMeta.name}
                                                        </span>
                                                        <span className='text-[9px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded'>
                                                            {weekdayPlanMeta.days || 26} Days Plan
                                                        </span>
                                                    </div>
                                                    <span className='text-[10px] text-amber-800 font-semibold uppercase'>
                                                        {chosenSlots.join(' + ') || 'Base Plan'}
                                                    </span>
                                                </div>
                                                <span className='font-bold text-xs text-amber-900 shrink-0'>
                                                    AED {weekdayPlanMeta.price}
                                                </span>
                                            </div>
                                        )}

                                        {sundayPlanMeta && (
                                            <div className='flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80'>
                                                <div>
                                                    <div className='flex items-center gap-1.5 flex-wrap'>
                                                        <span className='font-bold text-grey-dark block'>
                                                            {sundayPlanMeta.name}
                                                        </span>
                                                        <span className='text-[9px] bg-purple-200 text-purple-950 font-bold px-1.5 py-0.2 rounded'>
                                                            {sundayPlanMeta.days || 4} Sundays
                                                        </span>
                                                    </div>
                                                    <span className='text-[10px] text-purple-800 font-semibold uppercase'>
                                                        Sunday Feast
                                                    </span>
                                                </div>
                                                <span className='font-bold text-xs text-purple-900 shrink-0'>
                                                    + AED {sundayPlanMeta.price}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='pt-2.5 border-t border-grey/10 flex items-center justify-between'>
                                    <div>
                                        <span className='text-[10px] font-semibold text-grey-muted uppercase block'>Total Amount</span>
                                        <span className='text-[10px] text-emerald-700 font-semibold'>
                                            {order.paymentMethod} • {order.paymentStatus || 'PENDING'}
                                        </span>
                                    </div>
                                    <span className='text-xl font-bold text-grey-dark'>
                                        AED {order.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Customer Notes banner if available */}
                        {order.orderRemarks && (
                            <div className='p-3.5 bg-primary/10 rounded-2xl border border-primary/20 text-xs text-grey-dark flex items-start gap-2.5'>
                                <Icon icon='solar:notes-bold-duotone' className='text-primary text-base shrink-0 mt-0.5' />
                                <div>
                                    <span className='font-bold text-grey-dark block text-[10px] uppercase tracking-wider'>
                                        Special Customer Notes / Instructions:
                                    </span>
                                    <p className='mt-0.5 font-normal leading-relaxed'>{order.orderRemarks}</p>
                                </div>
                            </div>
                        )}

                        {/* 4. UNIFIED MASTER MEAL DELIVERY & SERVED SCHEDULE (Every Day with Food Items & Served Toggle) */}
                        <div className='bg-white p-5 sm:p-7 rounded-3xl border border-grey/10 shadow-xs space-y-5'>
                            
                            {/* Section Header with Live Progress & Filters */}
                            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-grey/10 pb-4'>
                                <div>
                                    <div className='flex items-center gap-2.5'>
                                        <div className='w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center text-lg shrink-0'>
                                            <Icon icon='solar:calendar-mark-bold-duotone' />
                                        </div>
                                        <div>
                                            <h3 className='text-sm sm:text-base font-bold text-grey-dark tracking-tight'>
                                                Daily Meal Delivery &amp; Served Schedule
                                            </h3>
                                            <p className='text-xs text-grey-muted'>
                                                Day-by-day scheduled food items with 1-click Served / Delivered status tracking
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-3 flex-wrap'>
                                    {/* Progress Badge */}
                                    <span className='px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200'>
                                        {servedCount} / {totalDaysCount} Days Served ({servedPercent}%)
                                    </span>

                                    {/* Filter Tabs */}
                                    <div className='flex items-center bg-grey/5 p-1 rounded-xl border border-grey/10 text-xs font-semibold'>
                                        <button
                                            type='button'
                                            onClick={() => setScheduleFilter('ALL')}
                                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                                scheduleFilter === 'ALL' ? 'bg-white text-grey-dark shadow-2xs font-bold' : 'text-grey-muted hover:text-grey-dark'
                                            }`}
                                        >
                                            All ({scheduledDaysList.length})
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => setScheduleFilter('PENDING')}
                                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                                scheduleFilter === 'PENDING' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-grey-muted hover:text-grey-dark'
                                            }`}
                                        >
                                            Pending ({totalDaysCount - servedCount})
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => setScheduleFilter('SERVED')}
                                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                                scheduleFilter === 'SERVED' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-grey-muted hover:text-grey-dark'
                                            }`}
                                        >
                                            Served ({servedCount})
                                        </button>
                                    </div>

                                    {/* View Mode Switcher */}
                                    <div className='flex items-center bg-grey/5 p-1 rounded-xl border border-grey/10 text-xs font-semibold'>
                                        <button
                                            type='button'
                                            onClick={() => setViewMode('CARDS')}
                                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                                viewMode === 'CARDS' ? 'bg-white text-primary shadow-2xs' : 'text-grey-muted hover:text-grey-dark'
                                            }`}
                                            title='Card Grid View'
                                        >
                                            <Icon icon='solar:widget-2-bold' className='text-sm' />
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => setViewMode('TABLE')}
                                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                                viewMode === 'TABLE' ? 'bg-white text-primary shadow-2xs' : 'text-grey-muted hover:text-grey-dark'
                                            }`}
                                            title='Detailed List View'
                                        >
                                            <Icon icon='solar:list-bold' className='text-sm' />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className='w-full bg-grey/10 h-2 rounded-full overflow-hidden'>
                                <div
                                    className='bg-primary h-full rounded-full transition-all duration-300'
                                    style={{ width: `${servedPercent}%` }}
                                />
                            </div>

                            {/* CARDS VIEW: Day-by-Day Unified Cards */}
                            {viewMode === 'CARDS' ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                                    {filteredSchedule.map((dayItem) => {
                                        return (
                                            <div
                                                key={dayItem.dateStr}
                                                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 ${
                                                    dayItem.isServed
                                                        ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                                                        : 'bg-white border-grey/10 hover:border-grey/20 hover:shadow-xs'
                                                }`}
                                            >
                                                {/* Card Header: Day & Date */}
                                                <div className='flex items-center justify-between border-b border-grey/10 pb-2.5'>
                                                    <div>
                                                        <span className='text-[10px] font-bold uppercase text-grey-muted tracking-wider block'>
                                                            Day {dayItem.dayNumber} • {dayItem.dayOfWeek}
                                                        </span>
                                                        <span className='text-xs font-bold text-grey-dark block'>
                                                            {dayItem.formattedDate}
                                                        </span>
                                                    </div>

                                                    {dayItem.isSunday && (
                                                        <span className='px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold'>
                                                            Sunday Feast
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Scheduled Food Items for this Day */}
                                                <div className='space-y-2'>
                                                    {dayItem.meals.map((m, mIdx) => (
                                                        <div
                                                            key={mIdx}
                                                            className={`p-2 rounded-xl border ${m.bg} ${m.border} space-y-0.5`}
                                                        >
                                                            <div className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-grey-muted'>
                                                                <Icon icon={m.icon} className={`text-xs ${m.text}`} />
                                                                <span className={m.text}>{m.slot}</span>
                                                            </div>
                                                            <div className='text-xs font-semibold text-grey-dark leading-tight'>
                                                                {m.dishName}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* 1-Click Served / Delivered Status Toggle Button */}
                                                <button
                                                    type='button'
                                                    onClick={() => handleToggleDateServed(dayItem.dateStr)}
                                                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                        dayItem.isServed
                                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                                            : 'bg-grey/5 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-grey-dark border border-grey/15'
                                                    }`}
                                                >
                                                    {dayItem.isServed ? (
                                                        <>
                                                            <Icon icon='solar:check-read-bold' className='text-sm' />
                                                            <span>Served &amp; Delivered</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Icon icon='solar:clock-circle-bold' className='text-sm text-grey-muted' />
                                                            <span>Mark as Served</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                /* TABLE VIEW: Detailed Row-by-Row Schedule */
                                <div className='border border-grey/10 rounded-2xl overflow-hidden bg-white shadow-xs'>
                                    <table className='w-full text-left border-collapse text-xs'>
                                        <thead>
                                            <tr className='bg-grey/5 border-b border-grey/10 text-[11px] font-bold uppercase tracking-wider text-grey-muted'>
                                                <th className='p-3.5'>Day #</th>
                                                <th className='p-3.5'>Calendar Date</th>
                                                <th className='p-3.5'>Weekday</th>
                                                <th className='p-3.5'>Scheduled Food Items</th>
                                                <th className='p-3.5 text-right'>Served Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-grey/10'>
                                            {filteredSchedule.map((dayItem) => (
                                                <tr
                                                    key={dayItem.dateStr}
                                                    className={`hover:bg-grey/5 transition-colors ${
                                                        dayItem.isServed ? 'bg-emerald-50/20' : ''
                                                    }`}
                                                >
                                                    <td className='p-3.5 font-bold text-grey-dark'>
                                                        Day {dayItem.dayNumber}
                                                    </td>
                                                    <td className='p-3.5 font-semibold text-grey-dark'>
                                                        {dayItem.formattedDate}
                                                    </td>
                                                    <td className='p-3.5'>
                                                        <span className='font-semibold text-grey-dark'>
                                                            {dayItem.dayOfWeek}
                                                        </span>
                                                        {dayItem.isSunday && (
                                                            <span className='ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold'>
                                                                Feast
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className='p-3.5'>
                                                        <div className='flex items-center gap-2 flex-wrap'>
                                                            {dayItem.meals.map((m, mIdx) => (
                                                                <span
                                                                    key={mIdx}
                                                                    className={`px-2.5 py-1 rounded-lg border ${m.bg} ${m.border} font-semibold text-xs text-grey-dark flex items-center gap-1.5`}
                                                                >
                                                                    <span className={`text-[10px] font-bold ${m.text}`}>{m.slot}:</span>
                                                                    <span>{m.dishName}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className='p-3.5 text-right'>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleToggleDateServed(dayItem.dateStr)}
                                                            className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                                                                dayItem.isServed
                                                                    ? 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700'
                                                                    : 'bg-grey/5 hover:bg-emerald-50 hover:text-emerald-800 text-grey-dark border border-grey/15'
                                                            }`}
                                                        >
                                                            {dayItem.isServed ? (
                                                                <>
                                                                    <Icon icon='solar:check-read-bold' className='text-xs' />
                                                                    <span>Served</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className='text-[10px]'>⏳</span>
                                                                    <span>Pending</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>

                    </div>

                    {/* 3. DIALOG FOOTER ACTIONS */}
                    <div className='p-4 sm:px-8 border-t border-grey/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20'>
                        <Link
                            href={`/admin/orders/${order.id}`}
                            className='text-xs font-semibold text-grey-muted hover:text-primary flex items-center gap-1.5 order-2 sm:order-1 transition-colors'
                        >
                            <span>Open Dedicated Full Page</span>
                            <Icon icon='solar:arrow-right-up-bold' className='text-xs' />
                        </Link>

                        <div className='flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2'>
                            <button
                                type='button'
                                onClick={() => downloadInvoice(order.id)}
                                disabled={isGenerating}
                                className='px-4 py-2 bg-grey/5 hover:bg-grey/10 border border-grey/10 rounded-2xl text-xs font-semibold text-grey-dark transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer disabled:opacity-40'
                            >
                                {isGenerating ? (
                                    <Icon icon='line-md:loading-loop' className='text-sm' />
                                ) : (
                                    <Icon icon='solar:printer-bold-duotone' className='text-base text-primary' />
                                )}
                                <span>{isGenerating ? 'Generating...' : 'Download Invoice'}</span>
                            </button>

                            <button
                                type='button'
                                onClick={onClose}
                                className='admin-btn-primary px-6 py-2 text-xs font-bold flex-1 sm:flex-none cursor-pointer'
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
