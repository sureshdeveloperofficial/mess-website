'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type Customer = {
    id: string
    name: string
    phone: string
    email: string | null
    whatsappNo: string | null
    createdAt: string
    _count: {
        orders: number
    }
}

export default function CustomersPage() {
    const { data: customers = [], isLoading } = useQuery<Customer[]>({
        queryKey: ['admin-customers'],
        queryFn: async () => {
            const response = await axios.get('/api/admin/customers')
            return response.data
        }
    })

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <Icon icon="line-md:loading-loop" className="text-4xl text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Icon icon="ion:people-outline" className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-grey tracking-tight italic uppercase">Customer Directory</h1>
                        <p className="text-[10px] font-black text-grey/40 uppercase tracking-[0.2em] mt-1">Manage and View All Registered Members</p>
                    </div>
                </div>

                <div className="bg-white border border-grey/5 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-black text-grey uppercase tracking-tight">{customers.length} Total Customers</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer, idx) => (
                    <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-[2.5rem] border border-grey/5 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-grey/5 rounded-[1.5rem] flex items-center justify-center text-grey/20 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <Icon icon="ion:person-outline" className="text-3xl" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-grey/30 uppercase tracking-widest block mb-1">Total Orders</span>
                                    <span className="text-2xl font-black text-primary italic uppercase tracking-tighter">
                                        {customer._count.orders} <span className="text-[10px] font-bold text-grey/40 not-italic ml-1">Subscriptions</span>
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black text-grey uppercase tracking-tight italic line-clamp-1">{customer.name}</h3>
                                    <p className="text-[10px] font-bold text-grey/30 uppercase tracking-[0.2em]">Joined {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center gap-3 text-grey/60 group-hover:text-grey transition-colors">
                                        <div className="w-8 h-8 bg-grey/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Icon icon="ion:call-outline" className="text-lg" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-wide">{customer.phone}</span>
                                    </div>
                                    
                                    {customer.email && (
                                        <div className="flex items-center gap-3 text-grey/60 group-hover:text-grey transition-colors">
                                            <div className="w-8 h-8 bg-grey/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <Icon icon="ion:mail-outline" className="text-lg" />
                                            </div>
                                            <span className="text-sm font-bold lowercase tracking-tight italic">{customer.email}</span>
                                        </div>
                                    )}

                                    {customer.whatsappNo && (
                                        <div className="flex items-center gap-3 text-grey/60 group-hover:text-grey transition-colors">
                                            <div className="w-8 h-8 bg-grey/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <Icon icon="logos:whatsapp-icon" className="text-lg" />
                                            </div>
                                            <span className="text-sm font-bold uppercase tracking-wide">{customer.whatsappNo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-grey/5 border-t border-grey/5 flex items-center justify-between">
                            <span className="text-[10px] font-black text-grey/30 uppercase tracking-[0.2em]">Customer ID: {customer.id.substring(0, 8)}</span>
                            <Link 
                                href={`/admin/orders?search=${customer.phone}`}
                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-grey/40 hover:bg-primary hover:text-white hover:scale-110 transition-all shadow-sm"
                                title="View Customer Orders"
                            >
                                <Icon icon="ion:cart-outline" className="text-xl" />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
