'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Order = {
    id: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
    startDate: string
    totalDays: number
    activeDates: string[]
    selectionsJson: any
    selectedMenus: {
        id: string
        date: string
        foodItems: {
            id: string
            name: string
            category: string
        }[]
    }[]
}

type PaginatedResponse = {
    orders: Order[]
    totalCount: number
    totalPages: number
    currentPage: number
}

const ITEMS_PER_PAGE = 5

export default function MyOrdersPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [page, setPage] = useState(1)

    const { data, isLoading, isPlaceholderData } = useQuery<PaginatedResponse>({
        queryKey: ['user-orders', page],
        queryFn: async () => {
            const response = await axios.get(`/api/user/orders?page=${page}&limit=${ITEMS_PER_PAGE}`)
            return response.data
        },
        enabled: !!session,
        placeholderData: keepPreviousData
    })

    const orders = data?.orders || []
    const totalPages = data?.totalPages || 0

    if (isLoading && !isPlaceholderData) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full"
                    />
                    <Icon icon="solar:tea-cup-bold-duotone" className="text-2xl text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'N/A'
            return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        } catch {
            return 'N/A'
        }
    }

    // Helper to get items for a specific date from selectionsJson
    const getItemsForDate = (order: Order, dateStr: string) => {
        const date = new Date(dateStr)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }) // e.g., "Monday"
        const selections = order.selectionsJson || {}
        const items: { id: string; name: string; category: string }[] = []

        Object.keys(selections).forEach(menuId => {
            const itemId = selections[menuId][dayName]
            if (itemId) {
                const menu = order.selectedMenus.find(m => m.id === menuId)
                const foodItem = menu?.foodItems.find(fi => fi.id === itemId)
                if (foodItem) items.push(foodItem)
            }
        })
        return items
    }

    return (
        <div className="pt-24 pb-20 container max-w-6xl">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-4 mb-12">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 bg-white border border-grey/5 px-5 py-2.5 rounded-2xl text-grey hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        <div className="w-6 h-6 rounded-full bg-grey/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                            <Icon icon="solar:alt-arrow-left-bold" className="text-xs group-hover:text-primary" />
                        </div>
                        Back
                    </button>
                    <div className="h-px grow bg-linear-to-r from-grey/5 via-grey/5 to-transparent" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-grey uppercase tracking-tight italic mb-2">My Orders</h1>
                        <p className="text-[10px] font-black text-grey/40 uppercase tracking-[0.2em]">Manage and Track Your Daily Meal Plans</p>
                    </div>
                    <Link 
                        href="/get-started"
                        className="bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3 group"
                    >
                        <Icon icon="solar:cart-large-bold" className="text-lg group-hover:rotate-12 transition-transform" />
                        New Order
                    </Link>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-[3rem] border border-grey/5 p-20 text-center shadow-xl">
                    <div className="w-24 h-24 bg-grey/5 rounded-[2.5rem] flex items-center justify-center text-grey/10 mx-auto mb-8">
                        <Icon icon="solar:box-minimalistic-bold-duotone" className="text-6xl" />
                    </div>
                    <h2 className="text-2xl font-black text-grey uppercase italic mb-4">No Orders Found</h2>
                    <p className="text-grey/40 font-bold uppercase tracking-widest text-xs mb-8">You haven't started any meal plans yet.</p>
                    <Link 
                        href="/get-started"
                        className="inline-flex bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                        Start Your First Plan
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={page}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 gap-8"
                        >
                            {orders.map((order) => {
                                const activeDates = (order.activeDates || []) as string[]
                                const today = new Date(new Date().setHours(0,0,0,0))
                                const remainingDays = activeDates.filter(d => new Date(d) >= today).length
                                
                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-[2.5rem] border border-grey/5 overflow-hidden group hover:shadow-2xl transition-all duration-500 relative"
                                    >
                                        {/* Order Status Accent */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                                            order.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'
                                        }`} />
                                        
                                        <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
                                            <div className="lg:w-1/3 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-grey/30 uppercase tracking-widest mb-1">Order ID</span>
                                                        <span className="text-sm font-black text-grey/60 uppercase">{order.id.substring(0, 10)}</span>
                                                    </div>
                                                    <div className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm ${
                                                        order.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-primary/10 text-primary'
                                                    }`}>
                                                        {order.status}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-4xl font-black text-grey uppercase tracking-tight italic leading-none">{activeDates.length} Days</h3>
                                                    <p className="text-[10px] font-bold text-grey/40 uppercase tracking-widest mt-2 flex items-center gap-2">
                                                        <Icon icon="solar:calendar-bold-duotone" className="text-primary text-sm" />
                                                        {remainingDays} Days remaining
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-5 bg-grey/5 rounded-3xl border border-grey/5">
                                                        <p className="text-[10px] font-black text-grey/20 uppercase tracking-widest mb-1">Payment</p>
                                                        <p className="text-xs font-black text-grey uppercase flex items-center gap-1">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                            {order.paymentStatus}
                                                        </p>
                                                    </div>
                                                    <div className="p-5 bg-primary/5 rounded-3xl border border-primary/5">
                                                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-1">Invested</p>
                                                        <p className="text-sm font-black text-primary uppercase leading-none">AED {order.totalAmount}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-grey/5 pt-10 lg:pt-0 lg:pl-10">
                                                <div className="flex items-center justify-between mb-8">
                                                    <p className="text-[10px] font-black text-grey/30 uppercase tracking-[0.2em]">Food Schedule Snapshot</p>
                                                    <Link href={`/my-orders/${order.id}`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 group/link">
                                                        View Full details
                                                        <Icon icon="solar:arrow-right-up-bold" className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {activeDates.slice(0, 6).map((dateStr, dIdx) => {
                                                        const date = new Date(dateStr)
                                                        const items = getItemsForDate(order, dateStr)
                                                        
                                                        return (
                                                            <div key={dIdx} className="p-5 bg-white border border-grey/5 shadow-sm rounded-2xl group/item hover:bg-primary/5 hover:border-primary/10 transition-all">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <p className="text-[10px] font-black text-primary uppercase underline underline-offset-4 decoration-primary/20">
                                                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                                    </p>
                                                                    <p className="text-[10px] font-bold text-grey/30 uppercase">
                                                                        {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {items.map((item, fIdx) => (
                                                                        <p key={fIdx} className="text-[10px] font-bold text-grey/60 line-clamp-1 flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 shrink-0" />
                                                                            {item.name}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                    {activeDates.length > 6 && (
                                                        <Link href={`/my-orders/${order.id}`} className="p-5 bg-grey/5 rounded-2xl flex flex-col items-center justify-center gap-2 text-[10px] font-black text-grey/30 uppercase tracking-widest border border-dashed border-grey/20 hover:bg-grey/10 transition-all hover:text-grey/50">
                                                            <Icon icon="solar:add-circle-bold-duotone" className="text-xl" />
                                                            +{activeDates.length - 6} Days More
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-12 h-12 rounded-2xl border border-grey/5 flex items-center justify-center text-grey hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-grey transition-all"
                            >
                                <Icon icon="solar:alt-arrow-left-bold" />
                            </button>
                            
                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${
                                            page === i + 1 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                                : 'bg-white border border-grey/5 text-grey/40 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-12 h-12 rounded-2xl border border-grey/5 flex items-center justify-center text-grey hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-grey transition-all"
                            >
                                <Icon icon="solar:alt-arrow-right-bold" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
