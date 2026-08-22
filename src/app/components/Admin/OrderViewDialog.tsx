'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { format } from 'date-fns'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInvoiceDownload } from '@/app/hooks/useInvoiceDownload'

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
    const [isEditingStatus, setIsEditingStatus] = useState(false)
    const [showAllDates, setShowAllDates] = useState(false)

    // Sync state when order prop changes
    React.useEffect(() => {
        if (order) {
            setStatusValue(order.status || 'PENDING')
            setPaymentStatusValue(order.paymentStatus || 'PENDING')
            setIsEditingStatus(false)
            setShowAllDates(false)
        }
    }, [order])

    // Update status mutation
    const updateMutation = useMutation({
        mutationFn: async (updatedFields: { status?: string; paymentStatus?: string }) => {
            if (!order) return
            const res = await axios.patch(`/api/orders/${order.id}`, updatedFields)
            return res.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order', order?.id] })
            toast.success('Order status updated successfully!')
            setIsEditingStatus(false)
            if (onOrderUpdated) onOrderUpdated()
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to update order status')
        },
    })

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

    const displayedDates = showAllDates
        ? order.activeDates || []
        : (order.activeDates || []).slice(0, 8)

    const hasMoreDates = (order.activeDates || []).length > 8

    return (
        <AnimatePresence>
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className='bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-grey/10 overflow-hidden my-8 flex flex-col max-h-[90vh]'
                >
                    {/* Dialog Header */}
                    <div className='p-6 sm:px-8 border-b border-grey/10 flex items-center justify-between bg-white sticky top-0 z-10'>
                        <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shrink-0'>
                                <Icon icon='solar:cart-large-bold-duotone' />
                            </div>
                            <div>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <h2 className='text-lg sm:text-xl font-extrabold text-grey-dark'>
                                        Order #{shortId}
                                    </h2>
                                    <span
                                        className={`admin-badge text-[10px] ${
                                            order.status === 'CONFIRMED'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : order.status === 'CANCELLED'
                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                order.status === 'CONFIRMED'
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
                                    <Icon icon='solar:calendar-bold' className='text-xs' />
                                    <span>Placed on {format(new Date(order.createdAt), 'dd MMMM yyyy (hh:mm a)')}</span>
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='w-9 h-9 rounded-xl bg-grey/5 hover:bg-grey/10 text-grey-muted hover:text-grey-dark flex items-center justify-center transition-colors cursor-pointer'
                                title='Close dialog'
                            >
                                <Icon icon='solar:close-circle-bold' className='text-xl' />
                            </button>
                        </div>
                    </div>

                    {/* Dialog Scrollable Content */}
                    <div className='p-6 sm:p-8 space-y-6 overflow-y-auto flex-1'>
                        {/* Status Quick Updater Banner */}
                        <div className='p-4 bg-grey/5 rounded-2xl border border-grey/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            <div className='flex items-center gap-3'>
                                <div className='w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-base'>
                                    <Icon icon='solar:tuning-square-2-bold-duotone' />
                                </div>
                                <div>
                                    <span className='text-xs font-extrabold text-grey-dark block'>
                                        Update Order &amp; Payment Status
                                    </span>
                                    <span className='text-[11px] text-grey-muted'>
                                        Changes reflect immediately across customer invoices
                                    </span>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 flex-wrap'>
                                <select
                                    value={statusValue}
                                    onChange={(e) => {
                                        const newStatus = e.target.value
                                        setStatusValue(newStatus)
                                        updateMutation.mutate({ status: newStatus })
                                    }}
                                    disabled={updateMutation.isPending}
                                    className='px-3 py-1.5 bg-white border border-grey/15 rounded-xl text-xs font-bold text-grey-dark focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer'
                                >
                                    <option value='PENDING'>Status: PENDING</option>
                                    <option value='CONFIRMED'>Status: CONFIRMED</option>
                                    <option value='CANCELLED'>Status: CANCELLED</option>
                                </select>

                                <select
                                    value={paymentStatusValue}
                                    onChange={(e) => {
                                        const newPaymentStatus = e.target.value
                                        setPaymentStatusValue(newPaymentStatus)
                                        updateMutation.mutate({ paymentStatus: newPaymentStatus })
                                    }}
                                    disabled={updateMutation.isPending}
                                    className='px-3 py-1.5 bg-white border border-grey/15 rounded-xl text-xs font-bold text-grey-dark focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer'
                                >
                                    <option value='PENDING'>Payment: PENDING</option>
                                    <option value='PAID'>Payment: PAID</option>
                                    <option value='FAILED'>Payment: FAILED</option>
                                </select>

                                {updateMutation.isPending && (
                                    <Icon icon='line-md:loading-loop' className='text-primary text-lg animate-spin' />
                                )}
                            </div>
                        </div>

                        {/* 2-Column Grid: Customer Contact & Delivery Info */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Customer Profile Card */}
                            <div className='bg-white p-5 rounded-2xl border border-grey/10 space-y-4 shadow-xs'>
                                <div className='flex items-center justify-between border-b border-grey/10 pb-3'>
                                    <span className='admin-label mb-0 flex items-center gap-1.5'>
                                        <Icon icon='solar:user-bold-duotone' className='text-primary text-sm' />
                                        <span>Customer Profile</span>
                                    </span>
                                    {customer?.id && (
                                        <Link
                                            href={`/admin/customers/${customer.id}`}
                                            className='text-[11px] font-bold text-primary hover:underline flex items-center gap-1'
                                        >
                                            <span>Full Profile</span>
                                            <Icon icon='solar:arrow-right-bold' className='text-[10px]' />
                                        </Link>
                                    )}
                                </div>

                                <div className='flex items-start gap-3.5'>
                                    <div className='w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-sm flex items-center justify-center shrink-0'>
                                        {initials}
                                    </div>
                                    <div className='space-y-1 min-w-0'>
                                        <h4 className='font-extrabold text-sm text-grey-dark truncate'>
                                            {customer?.name || 'Customer'}
                                        </h4>
                                        <div className='space-y-1 text-xs'>
                                            {customer?.phone && (
                                                <a
                                                    href={`tel:${customer.phone}`}
                                                    className='flex items-center gap-2 font-bold text-grey-dark hover:text-primary transition-colors'
                                                >
                                                    <Icon icon='solar:phone-bold' className='text-grey-muted text-xs' />
                                                    <span>{customer.phone}</span>
                                                </a>
                                            )}
                                            {customer?.whatsappNo && (
                                                <a
                                                    href={`https://wa.me/${customer.whatsappNo.replace(/[^0-9]/g, '')}`}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='flex items-center gap-2 font-bold text-green-600 hover:underline'
                                                >
                                                    <Icon icon='logos:whatsapp-icon' className='text-xs' />
                                                    <span>WhatsApp: {customer.whatsappNo}</span>
                                                </a>
                                            )}
                                            {customer?.email && (
                                                <div className='flex items-center gap-2 text-grey-muted truncate'>
                                                    <Icon icon='solar:letter-bold' className='text-xs shrink-0' />
                                                    <span className='truncate'>{customer.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Location Card */}
                            <div className='bg-white p-5 rounded-2xl border border-grey/10 space-y-4 shadow-xs'>
                                <div className='border-b border-grey/10 pb-3'>
                                    <span className='admin-label mb-0 flex items-center gap-1.5'>
                                        <Icon icon='solar:map-point-bold-duotone' className='text-primary text-sm' />
                                        <span>Delivery Address</span>
                                    </span>
                                </div>

                                <div className='space-y-2 text-xs'>
                                    <div>
                                        <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider block'>
                                            Delivery Area / Zone
                                        </span>
                                        <p className='font-bold text-grey-dark'>
                                            {order.deliveryLocation || 'UAE Location'}
                                        </p>
                                    </div>

                                    <div>
                                        <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider block'>
                                            Address
                                        </span>
                                        <p className='font-medium text-grey-muted leading-relaxed'>
                                            {order.address}
                                        </p>
                                    </div>

                                    {(order.buildingName || order.flatRoomNumber) && (
                                        <div className='flex items-center gap-3 pt-1 border-t border-grey/10 text-grey-dark font-bold text-[11px]'>
                                            {order.buildingName && <span>Bldg: {order.buildingName}</span>}
                                            {order.flatRoomNumber && <span>Flat/Room: {order.flatRoomNumber}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Subscription & Meal Package Overview */}
                        <div className='bg-white p-5 rounded-2xl border border-grey/10 space-y-4 shadow-xs'>
                            <div className='flex items-center justify-between border-b border-grey/10 pb-3'>
                                <span className='admin-label mb-0 flex items-center gap-1.5'>
                                    <Icon icon='solar:chef-hat-heart-bold-duotone' className='text-primary text-sm' />
                                    <span>Subscribed Meal Packages</span>
                                </span>
                                <span className='text-xs font-extrabold text-grey-dark'>
                                    {order.activeDates?.length || 30} Total Delivery Days
                                </span>
                            </div>

                            {/* Menu Cards */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                {order.selectedMenus && order.selectedMenus.length > 0 ? (
                                    order.selectedMenus.map((menu) => (
                                        <div
                                            key={menu.id}
                                            className='p-3.5 bg-grey/5 rounded-xl border border-grey/10 space-y-1'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <span className='font-bold text-xs text-grey-dark'>{menu.name}</span>
                                                <span className='admin-badge text-[9px]'>Active Plan</span>
                                            </div>
                                            {menu.foodItems && menu.foodItems.length > 0 && (
                                                <div className='flex flex-wrap gap-1 pt-1'>
                                                    {menu.foodItems.map((fi) => (
                                                        <span
                                                            key={fi.id}
                                                            className='text-[10px] px-2 py-0.5 bg-white rounded-md text-grey-muted border border-grey/10'
                                                        >
                                                            {fi.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className='p-3 bg-grey/5 rounded-xl text-xs text-grey-muted italic'>
                                        Custom Meal Configuration
                                    </div>
                                )}
                            </div>

                            {/* Active Delivery Schedule Dates */}
                            {order.activeDates && order.activeDates.length > 0 && (
                                <div className='pt-3 border-t border-grey/10 space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-[10px] font-bold text-grey-muted uppercase tracking-wider'>
                                            Active Schedule Dates ({order.activeDates.length} Days)
                                        </span>
                                        {hasMoreDates && (
                                            <button
                                                type='button'
                                                onClick={() => setShowAllDates(!showAllDates)}
                                                className='text-[11px] font-bold text-primary hover:underline cursor-pointer'
                                            >
                                                {showAllDates ? 'Show Less' : `+${order.activeDates.length - 8} more`}
                                            </button>
                                        )}
                                    </div>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {displayedDates.map((dateStr, idx) => (
                                            <span
                                                key={idx}
                                                className='px-2.5 py-1 bg-grey/5 border border-grey/10 rounded-lg text-[11px] font-semibold text-grey-dark'
                                            >
                                                {format(new Date(dateStr), 'dd MMM yyyy')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment & Invoice Summary */}
                        <div className='bg-primary/10 p-5 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4'>
                            <div className='space-y-1'>
                                <span className='text-[10px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                                    Payment Method: {order.paymentMethod}
                                </span>
                                <div className='flex items-center gap-2'>
                                    <span
                                        className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                                            order.paymentStatus === 'PAID'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        Payment: {order.paymentStatus || 'PENDING'}
                                    </span>
                                    {order.paymentReceiptUrl && (
                                        <a
                                            href={order.paymentReceiptUrl}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-xs font-bold text-primary hover:underline flex items-center gap-1'
                                        >
                                            <Icon icon='solar:paperclip-bold' />
                                            <span>View Payment Receipt</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className='text-left sm:text-right'>
                                <span className='text-[10px] font-bold text-grey-dark uppercase tracking-wider block'>
                                    Total Amount Due
                                </span>
                                <span className='text-2xl font-black text-grey-dark'>
                                    AED {order.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dialog Footer Actions */}
                    <div className='p-6 sm:px-8 border-t border-grey/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10'>
                        <Link
                            href={`/admin/orders/${order.id}`}
                            className='text-xs font-bold text-grey-muted hover:text-primary flex items-center gap-1.5 order-2 sm:order-1'
                        >
                            <span>Open Dedicated Full Page</span>
                            <Icon icon='solar:arrow-right-up-bold' className='text-xs' />
                        </Link>

                        <div className='flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2'>
                            <button
                                type='button'
                                onClick={() => downloadInvoice(order.id)}
                                disabled={isGenerating}
                                className='px-5 py-2.5 bg-grey/5 hover:bg-grey/10 border border-grey/10 rounded-2xl text-xs font-bold text-grey-dark transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none cursor-pointer disabled:opacity-40'
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
                                className='admin-btn-primary px-6 py-2.5 text-xs flex-1 sm:flex-none'
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
