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

    const foodItems = foodData?.data || []
    const totalFoodItems = foodData?.total || 0


    const stats = [
        { label: 'Total Categories', value: categories.length, icon: 'ion:list-outline', color: 'bg-blue-500' },
        { label: 'Total Food Items', value: totalFoodItems, icon: 'ion:fast-food-outline', color: 'bg-[#df6853]' },
        { label: 'Pending Orders', value: 0, icon: 'ion:receipt-outline', color: 'bg-orange-500' },
        { label: 'Total Revenue', value: '0.00 AED', icon: 'ion:cash-outline', color: 'bg-green-500' },
    ]

    return (
        <div className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {stats.map((stat, i) => (
                    <div key={i} className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm'>
                        <div className='flex items-center gap-4'>
                            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-${stat.color.split('-')[1]}/20`}>
                                <Icon icon={stat.icon} />
                            </div>
                            <div>
                                <div className='text-sm text-grey/40 font-medium'>{stat.label}</div>
                                <div className='text-2xl font-bold text-grey capitalize'>{stat.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm'>
                    <h4 className='text-xl font-bold text-grey mb-6'>Recent Food Items</h4>
                    <div className='space-y-4'>
                        {foodItems.slice(0, 5).map((item: any) => (
                            <div key={item.id} className='flex items-center justify-between p-4 bg-grey/5 rounded-2xl hover:bg-grey/10 transition-colors'>
                                <div className='flex items-center gap-3'>
                                    {item.image ? (
                                        <div className='w-10 h-10 rounded-lg overflow-hidden relative'>
                                            <img src={item.image} alt='' className='w-full h-full object-cover' />
                                        </div>
                                    ) : (
                                        <div className='w-10 h-10 bg-grey/10 rounded-lg flex items-center justify-center text-grey/20 text-xl'>
                                            <Icon icon='ion:fast-food-outline' />
                                        </div>
                                    )}
                                    <div>
                                        <div className='font-semibold text-grey text-sm capitalize'>{item.name}</div>
                                        <div className='text-xs text-grey/40'>{item.category.name}</div>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className='font-bold text-[#df6853]'>AED {item.price.toFixed(2)}</div>
                                    <div className='text-[10px] text-green-600 font-bold'>
                                        AED {(item.monthlyPrice || item.price * 25).toFixed(2)}/mo
                                    </div>
                                </div>
                            </div>
                        ))}
                        {foodItems.length === 0 && <p className='text-grey/20 italic text-sm text-center py-4'>No items yet.</p>}
                    </div>
                </div>

                <div className='bg-white p-8 rounded-3xl border border-grey/10 shadow-sm'>
                    <h4 className='text-xl font-bold text-grey mb-6'>Quick Overview</h4>
                    <div className='space-y-6'>
                        <p className='text-grey/40 text-sm'>Your restaurant is currently active. You can manage your menu items and categories from this dashboard.</p>
                        <div className='p-6 bg-[#df6853]/5 rounded-3xl border border-[#df6853]/10'>
                            <h5 className='font-bold text-[#df6853] text-sm mb-2'>Pro-Tip: Performance</h5>
                            <p className='text-grey/60 text-xs leading-relaxed'>We use TanStack Query for efficient data fetching and caching, ensuring your admin panel stays fast and responsive even with large menus.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
