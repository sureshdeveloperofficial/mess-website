'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type FoodItem = {
    id: string
    name: string
    category: string
}

type FoodMenu = {
    id: string
    name: string
    foodItems: FoodItem[]
}

type Order = {
    id: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
    startDate: string
    activeDates: string[]
    selectionsJson: Record<string, Record<string, string>>
    selectedMenus: FoodMenu[]
    address: string
    buildingName: string | null
    flatRoomNumber: string | null
}

export default function OrderDetailsPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const { data: order, isLoading } = useQuery<Order>({
        queryKey: ['user-order', id],
        queryFn: async () => {
            const response = await axios.get(`/api/user/orders/${id}`)
            return response.data
        },
        enabled: !!session && !!id
    })

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full"
                />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="pt-32 pb-20 container max-w-4xl text-center">
                <h1 className="text-2xl font-black text-grey uppercase italic">Order Not Found</h1>
                <Link href="/my-orders" className="text-primary font-bold hover:underline mt-4 inline-block">Back to My Orders</Link>
            </div>
        )
    }

    const activeDates = order.activeDates || []
    const startDate = activeDates.length > 0 ? new Date(activeDates[0]) : null
    const endDate = activeDates.length > 0 ? new Date(activeDates[activeDates.length - 1]) : null
    const today = new Date(new Date().setHours(0,0,0,0))
    const remainingDays = activeDates.filter(d => new Date(d) >= today).length

    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A'
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getItemsForDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
        const selections = order.selectionsJson || {}
        const items: FoodItem[] = []

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
            {/* Header */}
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
                        <h1 className="text-4xl lg:text-5xl font-black text-grey uppercase tracking-tight italic mb-2">Order Details</h1>
                        <p className="text-[10px] font-black text-grey/40 uppercase tracking-[0.2em]">Full Schedule & Food Items</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest ${
                            order.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-primary/10 text-primary'
                        }`}>
                            {order.status}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-grey/5 shadow-sm">
                    <p className="text-[10px] font-black text-grey/30 uppercase tracking-widest mb-2">Start Date</p>
                    <p className="text-lg font-black text-grey uppercase italic">{formatDate(startDate)}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-grey/5 shadow-sm">
                    <p className="text-[10px] font-black text-red-400/50 uppercase tracking-widest mb-2">Expired Date</p>
                    <p className="text-lg font-black text-grey uppercase italic">{formatDate(endDate)}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-grey/5 shadow-sm border-l-4 border-l-primary">
                    <p className="text-[10px] font-black text-primary/50 uppercase tracking-widest mb-2">How Many Left</p>
                    <p className="text-2xl font-black text-primary uppercase italic">{remainingDays} Days</p>
                </div>
                <div className="bg-grey p-6 rounded-[2rem] text-white">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Total Invested</p>
                    <p className="text-xl font-black text-primary italic leading-none">AED {order.totalAmount}</p>
                </div>
            </div>

            {/* Food Schedule Table */}
            <div className="bg-white rounded-[2.5rem] border border-grey/5 overflow-hidden shadow-xl mb-8">
                <div className="bg-grey/2 p-6 border-b border-grey/5 flex items-center justify-between">
                    <h2 className="text-lg font-black text-grey uppercase tracking-wider flex items-center gap-3">
                        <Icon icon="solar:calendar-date-bold-duotone" className="text-primary text-xl" />
                        Complete Food Schedule
                    </h2>
                    <span className="text-[10px] font-black text-grey/30 uppercase tracking-widest">{activeDates.length} Days Plan</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-grey/1">
                                <th className="px-8 py-5 text-[10px] font-black text-grey/30 uppercase tracking-[0.2em] w-40">Date / Day</th>
                                <th className="px-8 py-5 text-[10px] font-black text-grey/30 uppercase tracking-[0.2em]">Menu Items & Selections</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-grey/5">
                            {activeDates.map((dateStr, idx) => {
                                const date = new Date(dateStr)
                                const items = getItemsForDate(dateStr)
                                const isPast = date < today
                                
                                return (
                                    <tr key={idx} className={`group hover:bg-primary/[0.02] transition-colors ${isPast ? 'opacity-40 grayscale' : ''}`}>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-grey uppercase tracking-tight leading-none mb-1">
                                                    {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
                                                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item, iIdx) => (
                                                    <div key={iIdx} className="bg-grey/2 border border-grey/5 px-3 py-1.5 rounded-lg flex items-center gap-2 group-hover:border-primary/10 transition-all">
                                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                                        <span className="text-[11px] font-black text-grey uppercase">{item.name}</span>
                                                        <span className="text-[7px] font-black text-grey/20 uppercase tracking-tighter bg-white px-1.5 py-0.5 rounded-sm border border-grey/5">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                ))}
                                                {items.length === 0 && (
                                                    <div className="flex items-center gap-2 text-grey/20">
                                                        <Icon icon="solar:info-circle-bold" className="text-xs" />
                                                        <span className="text-[10px] font-bold uppercase italic">No items selected</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delivery Footer */}
            <div className="bg-grey rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
                <Icon icon="solar:map-point-bold-duotone" className="absolute -right-20 -bottom-20 text-[20rem] text-white/5 rotate-12" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight italic mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Icon icon="solar:home-2-bold-duotone" className="text-primary text-xl" />
                            </div>
                            Delivery Address
                        </h3>
                        <div className="space-y-4">
                            <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Primary Address</p>
                            <p className="text-lg font-black leading-tight">{order.address}</p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-white/30 uppercase mb-1">Building/City</p>
                                    <p className="font-black text-sm uppercase">{order.buildingName || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-white/30 uppercase mb-1">Flat/Room</p>
                                    <p className="font-black text-sm uppercase">{order.flatRoomNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-end">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Order ID Hash</p>
                            <p className="text-xs font-mono text-white/40 break-all">{order.id}</p>
                        </div>
                        <button 
                            onClick={() => window.print()}
                            className="mt-10 bg-white text-grey px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all flex items-center gap-3"
                        >
                            <Icon icon="solar:printer-minimalistic-bold" className="text-lg" />
                            Print Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
