'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import { format } from 'date-fns'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

type Customer = {
    id: string
    name: string
    phone: string
    email?: string
    whatsappNo?: string
}

type FoodItem = {
    id: string
    name: string
    image?: string
}

type FoodMenu = {
    id: string
    name: string
    foodItems: FoodItem[]
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
    activeDates: string[]
}

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const { data: order, isLoading, error } = useQuery<Order>({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await axios.get(`/api/orders/${id}`)
            return response.data
        },
        enabled: !!id,
    })

    if (isLoading) {
        return (
            <div className='min-h-[60vh] flex items-center justify-center'>
                <Icon icon='line-md:loading-loop' className='text-5xl text-primary' />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center'>
                <div className='w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500'>
                    <Icon icon='ion:alert-circle-outline' className='text-5xl' />
                </div>
                <div>
                    <h3 className='text-2xl font-bold text-grey'>Order Not Found</h3>
                    <p className='text-grey/40'>The order you are looking for does not exist or has been removed.</p>
                </div>
                <Link 
                    href='/admin/orders'
                    className='px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all'
                >
                    Back to Orders
                </Link>
            </div>
        )
    }

    return (
        <div className='max-w-6xl mx-auto space-y-8 pb-20'>
            {/* Header / Actions */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div className='flex items-center gap-4'>
                    <button 
                        onClick={() => router.back()}
                        className='p-3 bg-white border border-grey/10 rounded-2xl text-grey/40 hover:text-grey hover:border-grey transition-all'
                    >
                        <Icon icon='ion:arrow-back' className='text-xl' />
                    </button>
                    <div>
                        <div className='flex items-center gap-3 mb-1'>
                            <span className='px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold tracking-widest uppercase'>
                                Order #{order.id.slice(-8).toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                {
                                    PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                                    CONFIRMED: 'bg-green-50 text-green-600 border-green-100',
                                    CANCELLED: 'bg-red-50 text-red-600 border-red-100',
                                }[order.status] || 'bg-grey/5 text-grey/60 border-grey/10'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                        <h2 className='text-3xl font-black text-grey uppercase tracking-tighter'>Order View</h2>
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    <button 
                        onClick={() => window.print()}
                        className='px-6 py-3 bg-white border border-grey/10 text-grey rounded-2xl font-bold hover:bg-grey/5 transition-all flex items-center gap-2'
                    >
                        <Icon icon='ion:print-outline' className='text-xl' />
                        Print View
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Left Column: Customer & Delivery */}
                <div className='lg:col-span-1 space-y-8'>
                    {/* Customer Info */}
                    <section className='bg-white rounded-4xl p-8 border border-grey/5 shadow-sm space-y-6'>
                        <div className='flex items-center gap-3 pb-4 border-b border-grey/5'>
                            <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                                <Icon icon='ion:person-outline' className='text-xl' />
                            </div>
                            <h3 className='text-lg font-black text-grey uppercase tracking-wider'>Customer Info</h3>
                        </div>
                        
                        <div className='space-y-4'>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Name</p>
                                <div className='p-4 bg-grey/5 rounded-2xl font-bold text-grey capitalize'>{order.customer.name}</div>
                            </div>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Phone & WhatsApp</p>
                                <div className='flex gap-2 font-bold'>
                                    <div className='flex-1 p-4 bg-grey/5 rounded-2xl text-grey'>{order.customer.phone}</div>
                                    {order.customer.whatsappNo && (
                                        <div className='w-14 p-4 bg-green-50 rounded-2xl text-green-600 flex items-center justify-center'>
                                            <Icon icon='ion:logo-whatsapp' className='text-xl' />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {order.customer.email && (
                                <div>
                                    <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Email</p>
                                    <div className='p-4 bg-grey/5 rounded-2xl font-bold text-grey truncate'>{order.customer.email}</div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Delivery Details */}
                    <section className='bg-white rounded-4xl p-8 border border-grey/5 shadow-sm space-y-6'>
                        <div className='flex items-center gap-3 pb-4 border-b border-grey/5'>
                            <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                                <Icon icon='ion:location-outline' className='text-xl' />
                            </div>
                            <h3 className='text-lg font-black text-grey uppercase tracking-wider'>Delivery Specs</h3>
                        </div>
                        
                        <div className='space-y-4'>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Full Address</p>
                                <div className='p-5 bg-grey/5 rounded-2xl font-bold text-grey leading-relaxed'>
                                    {order.address}
                                    {order.buildingName && (
                                        <span className='block text-primary text-sm mt-1'>Building: {order.buildingName}</span>
                                    )}
                                    {order.flatRoomNumber && (
                                        <span className='block text-primary text-sm mt-1'>Flat/Room: {order.flatRoomNumber}</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-1 ml-1'>Drop-off Location</p>
                                <div className='p-4 bg-grey/5 rounded-2xl font-bold text-grey capitalize'>
                                    {order.deliveryLocation.replace(/_/g, ' ')}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Subscription & Schedule */}
                <div className='lg:col-span-2 space-y-8'>
                    {/* Subscription Summary Cards */}
                    <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        <div className='bg-white p-6 rounded-4xl border border-grey/5 shadow-sm'>
                            <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-2'>Subscribed Days</p>
                            <p className='text-4xl font-black text-primary'>{order.activeDates.length} <span className='text-sm font-bold text-grey'>Days</span></p>
                            <p className='text-xs text-grey/40 mt-1'>Starting {format(new Date(order.startDate), 'MMM dd, yyyy')}</p>
                        </div>
                        <div className='bg-white p-6 rounded-4xl border border-grey/5 shadow-sm'>
                            <p className='text-[10px] font-black text-grey/40 uppercase tracking-widest mb-2'>Daily Rate</p>
                            <p className='text-4xl font-black text-grey'>{(order.totalAmount / order.activeDates.length).toFixed(1)} <span className='text-sm font-bold text-grey'>AED</span></p>
                            <p className='text-xs text-grey/40 mt-1'>Average per meal day</p>
                        </div>
                        <div className='bg-primary p-6 rounded-4xl shadow-lg shadow-primary/20 flex flex-col justify-center text-white'>
                            <p className='text-[10px] font-black text-white/50 uppercase tracking-widest mb-1'>Total Billing</p>
                            <p className='text-4xl font-black text-white'>{order.totalAmount.toFixed(2)} <span className='text-sm font-bold text-white/80'>AED</span></p>
                        </div>
                    </section>

                    {/* Daily Schedule */}
                    <section className='bg-white rounded-4xl p-8 border border-grey/5 shadow-sm space-y-8'>
                        <div className='flex items-center justify-between gap-3 pb-6 border-b border-grey/5'>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                                    <Icon icon='ion:calendar-number-outline' className='text-xl' />
                                </div>
                                <h3 className='text-lg font-black text-grey uppercase tracking-wider'>Daily Food Schedule</h3>
                            </div>
                            <div className='hidden sm:flex items-center gap-2 px-4 py-2 bg-grey/5 rounded-xl text-[10px] font-black text-grey/40 uppercase tracking-widest'>
                                <Icon icon='ion:information-circle-outline' className='text-lg' />
                                Full Monthly View
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-4'>
                            {order.activeDates.sort().map((dateStr, idx) => {
                                const date = new Date(dateStr)
                                const fullDayName = format(date, 'EEEE')
                                const dailyItems: any[] = []
                                
                                order.selectedMenus.forEach(menu => {
                                    const menuSelections = (order.selectionsJson as any)[menu.id] || {}
                                    const itemId = menuSelections[fullDayName]
                                    if (itemId) {
                                        const item = (menu as any).foodItems.find((fi: any) => fi.id === itemId)
                                        if (item) {
                                            dailyItems.push({
                                                ...item,
                                                menuName: menu.name
                                            })
                                        }
                                    }
                                })

                                return (
                                    <motion.div 
                                        key={dateStr}
                                        initial={{ opacity: 0, x: idx % 2 === 0 ? -10 : 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className='group bg-grey/5 p-5 rounded-4xl border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300 shadow-xs hover:shadow-lg'
                                    >
                                        <div className='flex items-center justify-between mb-4'>
                                            <div className='flex flex-col'>
                                                <span className='text-[#FF6B3E] text-[10px] font-black uppercase tracking-widest leading-none mb-1'>
                                                    {format(date, 'MMM dd')}
                                                </span>
                                                <span className='text-grey font-black text-lg leading-none'>
                                                    {fullDayName}
                                                </span>
                                            </div>
                                            <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xs text-grey group-hover:bg-primary group-hover:text-white transition-all'>
                                                <Icon icon='ion:restaurant-outline' className='text-xl' />
                                            </div>
                                        </div>

                                        <div className='space-y-3'>
                                            {dailyItems.length > 0 ? (
                                                dailyItems.map((item, idxx) => (
                                                    <div key={`${dateStr}-${idxx}`} className='flex items-start gap-3 bg-white/50 group-hover:bg-grey/5 p-3 rounded-2xl transition-colors'>
                                                        <div className='w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0' />
                                                        <div className='flex flex-col'>
                                                            <span className='text-sm font-black text-grey leading-tight'>{item.name}</span>
                                                            <span className='text-[8px] font-black text-grey/40 uppercase tracking-widest mt-0.5'>{item.menuName}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className='text-xs text-grey/30 italic px-2'>No menu items selected for this day.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
