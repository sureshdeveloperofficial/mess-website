'use client'

import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'

export default function AdminDashboard() {
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const resp = await axios.get('/api/categories')
            return resp.data
        },
    })

    const { data: foodData } = useQuery({
        queryKey: ['food-items'],
        queryFn: async () => {
            const resp = await axios.get('/api/food-items?limit=5')
            return resp.data
        },
    })

    const { data: deliveryAreas = [] } = useQuery({
        queryKey: ['delivery-areas'],
        queryFn: async () => {
            const resp = await axios.get('/api/delivery-areas')
            return resp.data
        },
    })

    const foodItems = foodData?.data || []
    const totalFoodItems = foodData?.total || 0
    const activeAreasCount = Array.isArray(deliveryAreas) ? deliveryAreas.filter((a: any) => a.status === 'active').length : 0

    const stats = [
        { label: 'Food Categories', value: categories.length, icon: 'solar:list-bold-duotone', color: 'bg-blue-500' },
        { label: 'Total Food Items', value: totalFoodItems, icon: 'solar:hamburger-menu-bold-duotone', color: 'bg-primary' },
        { label: 'Delivery Zones', value: `${activeAreasCount} Active`, icon: 'solar:map-point-wave-bold-duotone', color: 'bg-purple-500' },
        { label: 'Total Revenue', value: '0.00 AED', icon: 'solar:wallet-money-bold-duotone', color: 'bg-emerald-500' },
    ]

    return (
        <div className='space-y-8'>
            <div>
                <h1 className='admin-page-title'>Restaurant Dashboard</h1>
                <p className='admin-page-subtitle'>Overview of current food plans, categories, and subscription performance</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {stats.map((stat, i) => (
                    <div key={i} className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm hover:shadow-md transition-all'>
                        <div className='flex items-center gap-4'>
                            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl shadow-sm shrink-0`}>
                                <Icon icon={stat.icon} />
                            </div>
                            <div>
                                <div className='text-xs font-bold uppercase tracking-wider text-grey-muted'>{stat.label}</div>
                                <div className='text-2xl font-extrabold text-grey-dark capitalize mt-0.5'>{stat.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='bg-white p-6 sm:p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                        <h4 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                            <Icon icon='solar:hamburger-menu-bold-duotone' className='text-primary text-2xl' />
                            Recent Food Items
                        </h4>
                    </div>
                    <div className='space-y-3'>
                        {foodItems.slice(0, 5).map((item: any) => (
                            <div key={item.id} className='flex items-center justify-between p-3.5 bg-grey/5 rounded-2xl hover:bg-grey/10 transition-colors border border-grey/5'>
                                <div className='flex items-center gap-3'>
                                    {item.image ? (
                                        <div className='w-11 h-11 rounded-xl overflow-hidden relative border border-grey/10'>
                                            <img src={item.image} alt='' className='w-full h-full object-cover' />
                                        </div>
                                    ) : (
                                        <div className='w-11 h-11 bg-grey/10 rounded-xl flex items-center justify-center text-grey-muted text-xl'>
                                            <Icon icon='solar:fastfood-bold-duotone' />
                                        </div>
                                    )}
                                    <div>
                                        <div className='font-bold text-grey-dark text-sm capitalize'>{item.name}</div>
                                        <div className='text-xs font-medium text-grey-muted'>{item.category.name}</div>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className='font-bold text-grey-dark text-sm'>AED {item.price.toFixed(2)}</div>
                                    <div className='text-[10px] text-green-600 font-bold'>
                                        AED {(item.monthlyPrice || item.price * 25).toFixed(2)}/mo
                                    </div>
                                </div>
                            </div>
                        ))}
                        {foodItems.length === 0 && <p className='text-grey-muted italic text-xs text-center py-6'>No items added yet.</p>}
                    </div>
                </div>

                <div className='bg-white p-6 sm:p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                        <h4 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                            <Icon icon='solar:info-circle-bold-duotone' className='text-primary text-2xl' />
                            Quick Overview
                        </h4>
                    </div>
                    <div className='space-y-6'>
                        <p className='text-grey-muted text-sm leading-relaxed'>Your restaurant is currently live and active. You can manage your menu items, customer subscriptions, and billing configurations directly from this portal.</p>
                        <div className='p-6 bg-primary/10 rounded-3xl border border-primary/20 space-y-2'>
                            <h5 className='font-bold text-grey-dark text-sm flex items-center gap-2'>
                                <Icon icon='solar:bolt-bold-duotone' className='text-primary text-lg' />
                                <span>High-Performance Caching</span>
                            </h5>
                            <p className='text-grey-muted text-xs leading-relaxed'>TanStack Query caches and validates administrative states instantly, ensuring zero lag even with thousands of orders and dishes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
