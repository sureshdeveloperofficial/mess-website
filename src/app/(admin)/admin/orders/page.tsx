'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { format } from 'date-fns'
import Link from 'next/link'
import { motion } from 'framer-motion'

type Customer = {
    id: string
    name: string
    phone: string
    email?: string
    whatsappNo?: string
}

type FoodMenu = {
    id: string
    name: string
}

type Order = {
    id: string
    customerId: string
    customer: Customer
    address: string
    buildingName?: string
    flatRoomNumber?: string
    startDate: string
    paymentMethod: string
    deliveryLocation: string
    totalAmount: number
    status: string
    createdAt: string
    selectedMenus: FoodMenu[]
    selectionsJson: any
    includeSundays: boolean
    sundaysCount: number
    activeDates: string[]
}

export default function OrdersPage() {
    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await axios.get('/api/orders')
            return response.data
        },
    })

    if (isLoading) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center'>
                <Icon icon='line-md:loading-loop' className='text-5xl text-primary' />
            </div>
        )
    }

    return (
        <div className='max-w-7xl mx-auto space-y-10 pb-20'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 px-2'>
                <div className='space-y-2'>
                    <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary'>
                            <Icon icon='ion:receipt-outline' className='text-2xl' />
                        </div>
                        <h2 className='text-4xl font-black text-grey tracking-tight'>Order View</h2>
                    </div>
                    <p className='text-grey/40 font-medium pl-1'>Manage all customer subscriptions and daily food schedules</p>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='px-6 py-3 bg-white border border-grey/10 rounded-2xl text-grey font-bold shadow-xs flex items-center gap-3'>
                        <span className='w-2 h-2 bg-primary rounded-full animate-pulse' />
                        {orders.length} Total Subscriptions
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
                {orders.length === 0 ? (
                    <div className='col-span-full py-20 text-center space-y-4'>
                        <div className='w-24 h-24 bg-grey/5 rounded-full flex items-center justify-center mx-auto text-grey/20'>
                            <Icon icon='ion:receipt-outline' className='text-6xl' />
                        </div>
                        <p className='text-xl font-bold text-grey/40'>No active orders found</p>
                    </div>
                ) : (
                    orders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className='group relative bg-white rounded-[2.5rem] border border-grey/5 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden'
                        >
                            {/* Status Accent Bar */}
                            <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 ${
                                {
                                    PENDING: 'bg-yellow-400',
                                    CONFIRMED: 'bg-green-500',
                                    CANCELLED: 'bg-red-500',
                                }[order.status] || 'bg-grey/10'
                            }`} />

                            <div className='flex justify-between items-start mb-6'>
                                <div className='space-y-1'>
                                    <span className='px-3 py-1 bg-grey/5 rounded-full text-[10px] font-black text-grey/40 tracking-widest uppercase'>
                                        #{order.id.slice(-6).toUpperCase()}
                                    </span>
                                    <h4 className='text-xl font-black text-grey group-hover:text-primary transition-colors'>{order.customer.name}</h4>
                                    <p className='text-xs font-bold text-grey/30 flex items-center gap-1'>
                                        <Icon icon='ion:calendar-outline' className='text-sm' />
                                        Ordered {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black border tracking-widest ${
                                    {
                                        PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                                        CONFIRMED: 'bg-green-50 text-green-600 border-green-100',
                                        CANCELLED: 'bg-red-50 text-red-600 border-red-100',
                                    }[order.status] || 'bg-grey/5 text-grey/60 border-grey/10'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className='grid grid-cols-2 gap-3 mb-8'>
                                <div className='bg-grey/5 p-4 rounded-2xl'>
                                    <p className='text-[8px] font-black text-grey/30 uppercase tracking-widest mb-1'>Days</p>
                                    <p className='text-lg font-black text-grey'>{order.activeDates.length} Days</p>
                                </div>
                                <div className='bg-primary/5 p-4 rounded-2xl'>
                                    <p className='text-[8px] font-black text-primary/40 uppercase tracking-widest mb-1'>Total</p>
                                    <p className='text-lg font-black text-primary'>{order.totalAmount.toFixed(0)} <span className='text-[10px]'>AED</span></p>
                                </div>
                            </div>

                            {/* Menu Preview */}
                            <div className='space-y-3 mb-8'>
                                <p className='text-[10px] font-black text-grey/30 uppercase tracking-widest flex items-center gap-2'>
                                    <Icon icon='ion:restaurant-outline' />
                                    Active Menus
                                </p>
                                <div className='flex flex-wrap gap-2'>
                                    {order.selectedMenus.map((menu) => (
                                        <span key={menu.id} className='px-3 py-1.5 bg-white border border-grey/5 rounded-lg text-[10px] font-bold text-grey shadow-xs'>
                                            {menu.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href={`/admin/orders/${order.id}`}
                                className='w-full py-4 bg-grey/5 hover:bg-primary text-grey/60 hover:text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 active:scale-95'
                            >
                                Open Order View
                                <Icon icon='ion:open-outline' className='text-lg' />
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
