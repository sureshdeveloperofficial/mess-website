'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { motion } from 'framer-motion'

const customerNavItems = [
    { label: 'My Subscriptions & Orders', icon: 'solar:bag-check-bold-duotone', href: '/my-orders' },
    { label: 'My Profile & Delivery Info', icon: 'solar:user-bold-duotone', href: '/profile' },
    { label: 'Order New Meal Plan', icon: 'solar:cart-large-bold', href: '/get-started' },
]

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
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
    const contactPhone = settings?.contact_phone || '+971 4 264 2613'

    React.useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
        }
    }, [status, router, pathname])

    if (status === 'loading') {
        return (
            <div className='min-h-screen flex items-center justify-center bg-[#f8f9fb]'>
                <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className='w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-primary/30'
                >
                    <Icon icon='solar:chef-hat-bold-duotone' />
                </motion.div>
            </div>
        )
    }

    if (!session) return null

    const userName = session.user?.name || 'Customer'
    const userEmail = session.user?.email || ''
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()

    return (
        <div className='flex min-h-screen bg-[#f8f9fb] font-sans antialiased text-grey-dark'>
            {/* 1. CUSTOMER SIDEBAR */}
            <aside className='w-72 bg-white border-r border-grey/10 p-6 flex flex-col shrink-0 hidden md:flex min-h-screen sticky top-0 h-screen'>
                {/* Logo & Brand Header */}
                <div className='mb-6'>
                    <Link href='/' className='flex items-center gap-3 group'>
                        {logoUrl ? (
                            <div className='w-10 h-10 rounded-xl overflow-hidden bg-grey/5 border border-grey/10 flex items-center justify-center shrink-0'>
                                <img src={logoUrl} alt='Logo' className='w-full h-full object-contain p-1' />
                            </div>
                        ) : (
                            <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-primary/20 group-hover:scale-105 transition-transform'>
                                <Icon icon='solar:chef-hat-bold-duotone' className='text-2xl' />
                            </div>
                        )}
                        <div className='min-w-0'>
                            <span className='font-bold text-sm text-grey-dark tracking-tight block truncate'>
                                {restaurantName}
                            </span>
                            <span className='text-[10px] font-semibold text-primary block'>
                                Customer Portal
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Customer Profile Card */}
                <div className='p-3.5 bg-grey/5 rounded-2xl border border-grey/15 mb-6 flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs'>
                        {initials}
                    </div>
                    <div className='min-w-0 flex-1'>
                        <span className='font-extrabold text-xs text-grey-dark block truncate'>
                            {userName}
                        </span>
                        <span className='text-[11px] font-medium text-grey-dark/75 block truncate'>
                            {userEmail}
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className='flex-1 space-y-1.5'>
                    <div className='px-3 py-1.5 text-[11px] font-extrabold text-grey-dark uppercase tracking-wider'>
                        Menu &amp; Account
                    </div>

                    {customerNavItems.map((item) => {
                        const isActive = pathname === item.href || (item.href === '/my-orders' && pathname.startsWith('/my-orders'))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold ${
                                    isActive
                                        ? 'bg-primary text-white font-extrabold shadow-md shadow-primary/25'
                                        : 'text-grey-dark hover:bg-stone-100 hover:text-black'
                                }`}
                            >
                                <Icon icon={item.icon} className={`text-lg shrink-0 ${isActive ? 'text-white' : 'text-grey-dark/80'}`} />
                                <span className='truncate'>{item.label}</span>
                            </Link>
                        )
                    })}

                    <div className='pt-4 px-3 py-1.5 text-[11px] font-extrabold text-grey-dark uppercase tracking-wider'>
                        Explore Website
                    </div>

                    <Link
                        href='/'
                        className='flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold text-grey-dark hover:bg-stone-100 hover:text-black'
                    >
                        <Icon icon='solar:home-2-bold-duotone' className='text-lg shrink-0 text-grey-dark/80' />
                        <span>Back to Website</span>
                    </Link>
                </nav>

                {/* Support & Sign Out */}
                <div className='mt-auto pt-4 border-t border-grey/10 space-y-2'>
                    <a
                        href={`tel:${contactPhone}`}
                        className='flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] font-bold text-grey-dark hover:bg-primary/10 transition-colors'
                    >
                        <div className='flex items-center gap-2'>
                            <Icon icon='solar:phone-calling-bold' className='text-primary text-sm' />
                            <span>Helpline</span>
                        </div>
                        <span className='font-extrabold text-primary'>{contactPhone}</span>
                    </a>

                    <button
                        type='button'
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className='flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-all w-full text-xs cursor-pointer'
                    >
                        <Icon icon='solar:logout-2-bold-duotone' className='text-lg shrink-0' />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <div className='flex-1 flex flex-col min-w-0 overflow-x-hidden'>
                {/* Top Header */}
                <header className='h-16 bg-white border-b border-grey/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20'>
                    {/* Mobile Navigation Trigger */}
                    <div className='flex items-center gap-3'>
                        <div className='md:hidden flex items-center gap-2'>
                            <Link href='/' className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white'>
                                <Icon icon='solar:chef-hat-bold-duotone' className='text-lg' />
                            </Link>
                        </div>
                        <div className='hidden sm:block'>
                            <h1 className='text-sm font-extrabold text-grey-dark'>
                                Customer Dashboard
                            </h1>
                            <p className='text-[11px] font-medium text-grey-dark/80'>
                                Welcome back, <strong className='text-grey-dark font-extrabold'>{userName}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Mobile Menu Links + User Info */}
                    <div className='flex items-center gap-3'>
                        {/* Mobile Nav Links */}
                        <div className='flex md:hidden items-center gap-1 bg-grey/5 p-1 rounded-xl border border-grey/10 text-xs font-semibold'>
                            <Link
                                href='/my-orders'
                                className={`px-2.5 py-1 rounded-lg ${pathname.startsWith('/my-orders') ? 'bg-primary text-white font-bold' : 'text-grey-dark font-bold'}`}
                            >
                                Orders
                            </Link>
                            <Link
                                href='/profile'
                                className={`px-2.5 py-1 rounded-lg ${pathname === '/profile' ? 'bg-primary text-white font-bold' : 'text-grey-dark font-bold'}`}
                            >
                                Profile
                            </Link>
                            <Link
                                href='/get-started'
                                className='px-2.5 py-1 rounded-lg text-primary font-bold'
                            >
                                + Order
                            </Link>
                        </div>

                        <Link
                            href='/get-started'
                            className='hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-extrabold shadow-xs transition-all'
                        >
                            <Icon icon='solar:add-circle-bold' className='text-sm' />
                            <span>New Subscription</span>
                        </Link>

                        <div className='flex items-center gap-2 pl-2 border-l border-grey/10'>
                            <div className='text-right hidden lg:block'>
                                <div className='text-xs font-extrabold text-grey-dark leading-tight'>{userName}</div>
                                <div className='text-[10px] font-medium text-grey-dark/75'>{userEmail}</div>
                            </div>
                            <Link
                                href='/profile'
                                className='w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-extrabold text-xs hover:bg-primary/20 transition-colors shadow-2xs'
                                title='Go to Profile'
                            >
                                {initials}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page View Body */}
                <main className='flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto'>
                    {children}
                </main>
            </div>
        </div>
    )
}
