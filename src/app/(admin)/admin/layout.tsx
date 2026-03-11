'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
    { label: 'Dashboard', icon: 'ion:grid-outline', href: '/admin' },
    { label: 'Categories', icon: 'ion:list-outline', href: '/admin/categories' },
    { label: 'Food Items', icon: 'ion:fast-food-outline', href: '/admin/food-items' },
    { label: 'Food Menu', icon: 'ion:calendar-outline', href: '/admin/food-menu' },
    { label: 'Orders', icon: 'ion:cart-outline', href: '/admin/orders' },
    { label: 'Customers', icon: 'ion:people-outline', href: '/admin/customers' },
    { label: 'Settings', icon: 'ion:settings-outline', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin-login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className='min-h-screen flex items-center justify-center bg-[#fdf2f0]'>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl'
                >
                    <Icon icon='ion:cafe' />
                </motion.div>
            </div>
        )
    }

    if (!session) return null

    return (
        <div className='flex min-h-screen bg-[#f8f9fb]'>
            {/* Sidebar */}
            <aside className='w-64 bg-white border-r border-grey/10 p-6 flex flex-col'>
                <div className='mb-10 flex items-center gap-3'>
                    <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white'>
                        <Icon icon='ion:cafe' className='text-xl' />
                    </div>
                    <span className='font-bold text-xl text-grey tracking-tight'>AL SHAMIL MESS</span>
                </div>

                <nav className='flex-1 space-y-2'>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-grey/60 hover:bg-grey/5 hover:text-grey'
                                }`}
                        >
                            <Icon icon={item.icon} className='text-xl' />
                            <span className='font-medium'>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className='mt-auto pt-6 border-t border-grey/10'>
                    <button
                        onClick={() => router.push('/api/auth/signout')}
                        className='flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all w-full'
                    >
                        <Icon icon='ion:log-out-outline' className='text-xl' />
                        <span className='font-medium'>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className='flex-1 overflow-y-auto'>
                <header className='h-16 bg-white border-b border-grey/10 px-8 flex items-center justify-between sticky top-0 z-10'>
                    <h2 className='text-xl font-semibold text-grey capitalize'>
                        {navItems.find((i) => i.href === pathname)?.label || 'Admin Panel'}
                    </h2>
                    <div className='flex items-center gap-4'>
                        <div className='text-right hidden sm:block'>
                            <div className='text-sm font-semibold text-grey'>{session.user?.email}</div>
                            <div className='text-xs text-grey/40'>Super Admin</div>
                        </div>
                        <div className='w-10 h-10 bg-grey/5 rounded-full border border-grey/10 flex items-center justify-center'>
                            <Icon icon='ion:person-outline' className='text-xl text-grey/40' />
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
