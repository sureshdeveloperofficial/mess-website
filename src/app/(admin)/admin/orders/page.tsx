'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { format } from 'date-fns'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, FilterOption } from '@/app/components/Admin/DataTable'
import { useInvoiceDownload } from '@/app/hooks/useInvoiceDownload'
import { OrderViewDialog, Order } from '@/app/components/Admin/OrderViewDialog'

const columnHelper = createColumnHelper<Order>()

export default function OrdersPage() {
    const searchParams = useSearchParams()
    const searchParamQuery = searchParams?.get('search') || ''

    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)

    const { downloadInvoice, isGenerating } = useInvoiceDownload()

    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await axios.get('/api/orders')
            return response.data
        },
    })

    const openOrderDetails = (order: Order) => {
        setSelectedOrderForView(order)
        setIsViewDialogOpen(true)
    }

    const closeOrderDetails = () => {
        setIsViewDialogOpen(false)
        setSelectedOrderForView(null)
    }

    // Filter computation
    const filteredOrders = useMemo(() => {
        if (activeFilter === 'pending') {
            return orders.filter((o) => o.status === 'PENDING')
        }
        if (activeFilter === 'confirmed') {
            return orders.filter((o) => o.status === 'CONFIRMED')
        }
        if (activeFilter === 'cancelled') {
            return orders.filter((o) => o.status === 'CANCELLED')
        }
        if (activeFilter === 'paid') {
            return orders.filter((o) => o.paymentStatus === 'PAID')
        }
        return orders
    }, [orders, activeFilter])

    // Filter options configuration with live counts
    const filterOptions: FilterOption[] = useMemo(() => {
        const pendingCount = orders.filter((o) => o.status === 'PENDING').length
        const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED').length
        const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length
        const paidCount = orders.filter((o) => o.paymentStatus === 'PAID').length

        return [
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'confirmed', label: 'Confirmed', count: confirmedCount },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'paid', label: 'Paid', count: paidCount },
            { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
        ]
    }, [orders])

    // Table Column Definitions
    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'Order Details',
                cell: (info) => {
                    const row = info.row.original
                    const shortId = row.id.slice(-6).toUpperCase()

                    return (
                        <div className='space-y-1'>
                            <button
                                type='button'
                                onClick={() => openOrderDetails(row)}
                                className='font-extrabold text-xs text-grey-dark hover:text-primary transition-colors font-mono block cursor-pointer text-left'
                                title='Click to View Order Details'
                            >
                                #{shortId}
                            </button>
                            <span className='text-[10px] text-grey-muted flex items-center gap-1'>
                                <Icon icon='solar:calendar-bold' className='text-xs' />
                                <span>{format(new Date(row.createdAt), 'dd MMM yyyy')}</span>
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor((row) => row.customer.name, {
                id: 'customer',
                header: 'Customer',
                cell: (info) => {
                    const customer = info.row.original.customer
                    if (!customer) {
                        return <span className='text-xs text-grey-muted italic'>Guest Customer</span>
                    }

                    return (
                        <div className='space-y-1'>
                            <Link
                                href={`/admin/customers/${customer.id}`}
                                className='font-extrabold text-xs text-grey-dark hover:text-primary transition-colors line-clamp-1 block'
                                title='View Customer Profile'
                            >
                                {customer.name}
                            </Link>
                            <div className='flex items-center gap-2 text-[11px] font-bold text-grey-muted'>
                                <a
                                    href={`tel:${customer.phone}`}
                                    className='hover:text-primary flex items-center gap-1'
                                >
                                    <Icon icon='solar:phone-bold' className='text-xs' />
                                    <span>{customer.phone}</span>
                                </a>
                                {customer.whatsappNo && (
                                    <a
                                        href={`https://wa.me/${customer.whatsappNo.replace(/[^0-9]/g, '')}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-green-600 hover:opacity-80'
                                        title='Chat on WhatsApp'
                                    >
                                        <Icon icon='logos:whatsapp-icon' className='text-xs' />
                                    </a>
                                )}
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('selectedMenus', {
                header: 'Meal Plans',
                cell: (info) => {
                    const row = info.row.original
                    const menus = info.getValue() || []
                    const durationDays = row.activeDates?.length || 0

                    return (
                        <div className='space-y-1.5'>
                            <div className='flex flex-wrap gap-1'>
                                {menus.length > 0 ? (
                                    menus.map((m) => (
                                        <span
                                            key={m.id}
                                            className='px-2 py-0.5 bg-grey/5 border border-grey/10 rounded-md text-[11px] font-bold text-grey-dark'
                                        >
                                            {m.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className='text-xs text-grey-muted italic'>Custom Plan</span>
                                )}
                            </div>
                            <span className='text-[10px] font-semibold text-grey-muted block'>
                                Starts {format(new Date(row.startDate), 'dd MMM yyyy')} ({durationDays} Days)
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('deliveryLocation', {
                header: 'Delivery Location',
                cell: (info) => {
                    const row = info.row.original
                    return (
                        <div className='space-y-0.5 max-w-[180px]'>
                            <span className='text-xs font-bold text-grey-dark block truncate'>
                                {info.getValue() || 'Standard Delivery'}
                            </span>
                            <span className='text-[10px] text-grey-muted block truncate' title={row.address}>
                                {row.address}
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('paymentMethod', {
                header: 'Payment',
                cell: (info) => {
                    const row = info.row.original
                    const isPaid = row.paymentStatus === 'PAID'

                    return (
                        <div className='space-y-1'>
                            <span className='text-[10px] font-extrabold uppercase tracking-wider text-grey-muted block'>
                                {info.getValue()}
                            </span>
                            <span
                                className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-extrabold ${
                                    isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}
                            >
                                {row.paymentStatus || 'PENDING'}
                            </span>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('status', {
                header: 'Order Status',
                cell: (info) => {
                    const status = info.getValue()
                    const isConfirmed = status === 'CONFIRMED'
                    const isCancelled = status === 'CANCELLED'

                    return (
                        <span
                            className={`admin-badge ${
                                isConfirmed
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : isCancelled
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    isConfirmed ? 'bg-green-600' : isCancelled ? 'bg-red-600' : 'bg-amber-500'
                                }`}
                            />
                            {status}
                        </span>
                    )
                },
            }),
            columnHelper.accessor('totalAmount', {
                header: 'Total Amount',
                cell: (info) => (
                    <span className='font-extrabold text-sm text-grey-dark'>
                        AED {info.getValue().toFixed(2)}
                    </span>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (info) => {
                    const row = info.row.original

                    return (
                        <div className='flex items-center gap-1.5'>
                            {/* Invoice Download */}
                            <button
                                type='button'
                                onClick={() => downloadInvoice(row.id)}
                                disabled={isGenerating}
                                title='Download Official Invoice'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all disabled:opacity-40 cursor-pointer'
                            >
                                {isGenerating ? (
                                    <Icon icon='line-md:loading-loop' className='text-base' />
                                ) : (
                                    <Icon icon='solar:printer-bold-duotone' className='text-lg' />
                                )}
                            </button>

                            {/* View Order Dialog */}
                            <button
                                type='button'
                                onClick={() => openOrderDetails(row)}
                                title='View Full Order Details'
                                className='p-2 text-grey-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer'
                            >
                                <Icon icon='solar:eye-bold-duotone' className='text-lg' />
                            </button>
                        </div>
                    )
                },
            }),
        ],
        [downloadInvoice, isGenerating]
    )

    if (isLoading) {
        return (
            <div className='min-h-[60vh] flex flex-col items-center justify-center gap-3'>
                <Icon icon='line-md:loading-loop' className='text-5xl text-primary' />
                <p className='text-xs font-bold text-grey-muted'>Loading subscriptions and orders...</p>
            </div>
        )
    }

    return (
        <div className='space-y-8 pb-16'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div>
                    <h1 className='admin-page-title'>Customer Orders</h1>
                    <p className='admin-page-subtitle'>
                        Manage customer subscriptions, delivery schedules, and active meal plans
                    </p>
                </div>

                <div className='flex items-center gap-3'>
                    <div className='px-5 py-2.5 bg-white border border-grey/10 rounded-2xl text-grey-dark font-bold text-xs shadow-xs flex items-center gap-2.5'>
                        <span className='w-2 h-2 bg-primary rounded-full animate-pulse' />
                        <span>{orders.length} Total Subscriptions</span>
                    </div>
                </div>
            </div>

            {/* Reusable DataTable Component */}
            <DataTable
                data={filteredOrders}
                columns={columns}
                searchPlaceholder='Search by Order ID, customer, phone, or location...'
                filterOptions={filterOptions}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                emptyMessage='No active orders found'
                emptySubtext='When customers place meal subscriptions, they will appear here.'
                initialPageSize={10}
            />

            {/* Centralized Order View Dialog */}
            <OrderViewDialog
                order={selectedOrderForView}
                isOpen={isViewDialogOpen}
                onClose={closeOrderDetails}
            />
        </div>
    )
}
