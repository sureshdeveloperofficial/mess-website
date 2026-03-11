'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Order = {
    id: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
    startDate: string
    totalDays: number
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

export default function MyOrdersPage() {
    const { data: session } = useSession()

    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['user-orders'],
        queryFn: async () => {
            const response = await axios.get('/api/user/orders')
            return response.data
        },
        enabled: !!session
    })

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Icon icon="line-md:loading-loop" className="text-4xl text-primary" />
            </div>
        )
    }

    return (
        <div className="pt-32 pb-20 container max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-grey uppercase tracking-tight italic mb-2">My Subscriptions</h1>
                    <p className="text-[10px] font-black text-grey/40 uppercase tracking-[0.2em]">Manage and Track Your Daily Meal Plans</p>
                </div>
                <Link 
                    href="/get-started"
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
                >
                    <Icon icon="solar:cart-large-bold" className="text-lg" />
                    New Subscription
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-[3rem] border border-grey/5 p-20 text-center shadow-xl">
                    <div className="w-24 h-24 bg-grey/5 rounded-[2rem] flex items-center justify-center text-grey/10 mx-auto mb-8">
                        <Icon icon="solar:box-minimalistic-bold-duotone" className="text-6xl" />
                    </div>
                    <h2 className="text-2xl font-black text-grey uppercase italic mb-4">No Subscriptions Found</h2>
                    <p className="text-grey/40 font-bold uppercase tracking-widest text-xs mb-8">You haven't started any meal plans yet.</p>
                    <Link 
                        href="/get-started"
                        className="inline-flex bg-grey text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all"
                    >
                        Start Your First Plan
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {orders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[2.5rem] border border-grey/5 overflow-hidden group hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
                                <div className="lg:w-1/3 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="px-5 py-2 bg-primary/10 text-primary rounded-full">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Order ID: {order.id.substring(0, 8)}</span>
                                        </div>
                                        <div className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${
                                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {order.status}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-black text-grey uppercase tracking-tight italic">{order.totalDays} Days Plan</h3>
                                        <p className="text-[10px] font-bold text-grey/40 uppercase tracking-widest mt-1">
                                            Started on {new Date(order.startDate).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-grey/5 rounded-2xl">
                                            <p className="text-[10px] font-black text-grey/30 uppercase tracking-widest mb-1">Payment</p>
                                            <p className="text-xs font-black text-grey uppercase">{order.paymentStatus}</p>
                                        </div>
                                        <div className="p-4 bg-grey/5 rounded-2xl">
                                            <p className="text-[10px] font-black text-grey/30 uppercase tracking-widest mb-1">Total Paid</p>
                                            <p className="text-sm font-black text-primary uppercase leading-none">AED {order.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-grey/5 pt-10 lg:pt-0 lg:pl-10">
                                    <p className="text-[10px] font-black text-grey/30 uppercase tracking-[0.2em] mb-6">Daily Food Schedule</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {order.selectedMenus.slice(0, 6).map((menu, mIdx) => (
                                            <div key={mIdx} className="p-4 bg-grey/5 rounded-2xl group/item hover:bg-primary/5 transition-all">
                                                <p className="text-[10px] font-black text-primary uppercase whitespace-nowrap overflow-hidden text-ellipsis mb-2">
                                                    {new Date(menu.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </p>
                                                <div className="space-y-1">
                                                    {menu.foodItems.map((item, fIdx) => (
                                                        <p key={fIdx} className="text-[10px] font-bold text-grey/60 line-clamp-1 flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-grey/20" />
                                                            {item.name}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {order.selectedMenus.length > 6 && (
                                            <div className="p-4 bg-grey/5 rounded-2xl flex items-center justify-center text-[10px] font-black text-grey/30 uppercase tracking-widest border border-dashed border-grey/10">
                                                +{order.selectedMenus.length - 6} More Days
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
