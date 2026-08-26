'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const navItems = [
    { label: 'Dashboard', icon: 'solar:widget-bold-duotone', href: '/admin' },
    { label: 'Food Categories', icon: 'solar:list-bold-duotone', href: '/admin/categories' },
    { label: 'Food Items', icon: 'solar:hamburger-menu-bold-duotone', href: '/admin/food-items' },
    { label: 'Meal Types', icon: 'solar:clock-circle-bold-duotone', href: '/admin/meal-types' },
    { label: 'Food Plans', icon: 'solar:calendar-bold-duotone', href: '/admin/food-menu' },
    { label: 'Delivery Areas', icon: 'solar:map-point-wave-bold-duotone', href: '/admin/delivery-areas' },
    { label: 'Orders', icon: 'solar:cart-large-bold', href: '/admin/orders' },
    { label: 'Customers', icon: 'solar:users-group-two-rounded-bold-duotone', href: '/admin/customers' },
    { label: 'Website Settings', icon: 'solar:settings-bold-duotone', href: '/admin/website-settings' },
    { label: 'Email Settings', icon: 'solar:letter-bold-duotone', href: '/admin/email-settings' },
    { label: 'Bank Settings', icon: 'solar:card-2-bold-duotone', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await axios.get('/api/settings')
            return res.data
        },
        staleTime: 60000,
    })

    let restaurantName = settings?.restaurant_name || settings?.site_name || 'PREMIUM MESS'
    if (!restaurantName || restaurantName.toLowerCase().includes('shamil')) {
        restaurantName = 'PREMIUM MESS'
    }
    const logoUrl = settings?.site_logo || ''

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin-login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className='min-h-screen flex items-center justify-center bg-[#f8f9fb]'>
                <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-primary/30'
                >
                    <Icon icon='solar:chef-hat-bold-duotone' />
                </motion.div>
            </div>
        )
    }

    if (!session) return null

    return (
        <div className='flex min-h-screen bg-[#f8f9fb]'>
            {/* Sidebar */}
            <aside className='w-64 bg-white border-r border-grey/10 p-6 flex flex-col'>
                <div className='mb-8 flex items-center gap-3'>
                    {logoUrl ? (
                        <div className='w-10 h-10 rounded-xl overflow-hidden bg-grey/5 border border-grey/10 flex items-center justify-center shrink-0'>
                            <img src={logoUrl} alt='Logo' className='w-full h-full object-contain p-1' />
                        </div>
                    ) : (
                        <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-primary/20'>
                            <Icon icon='solar:chef-hat-bold-duotone' className='text-2xl' />
                        </div>
                    )}
                    <span className='font-extrabold text-base text-grey-dark tracking-tight line-clamp-1' title={restaurantName}>
                        {restaurantName}
                    </span>
                </div>

                <nav className='flex-1 space-y-1.5'>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href
                                ? 'bg-primary text-grey-dark font-extrabold shadow-md shadow-primary/25'
                                : 'text-grey-muted hover:bg-grey/5 hover:text-grey-dark font-semibold'
                                }`}
                        >
                            <Icon icon={item.icon} className='text-xl' />
                            <span className='text-sm'>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className='mt-auto pt-6 border-t border-grey/10'>
                    <button
                        onClick={() => router.push('/api/auth/signout')}
                        className='flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-all w-full text-sm cursor-pointer'
                    >
                        <Icon icon='solar:logout-2-bold-duotone' className='text-xl' />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className='flex-1 overflow-y-auto'>
                <header className='h-16 bg-white border-b border-grey/10 px-8 flex items-center justify-end sticky top-0 z-10'>
                    <div className='flex items-center gap-3.5'>
                        <div className='text-right hidden sm:block'>
                            <div className='text-xs font-bold text-grey-dark'>{session.user?.email}</div>
                            <div className='text-[10px] font-bold text-grey-muted uppercase tracking-wider'>Super Admin</div>
                        </div>
                        <div className='w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center text-primary'>
                            <Icon icon='solar:user-bold-duotone' className='text-xl' />
                        </div>
                    </div>
                </header>

                <div className='p-8'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}
