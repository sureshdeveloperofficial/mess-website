'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error('Invalid credentials')
            } else {
                toast.success('Welcome back, Admin!')
                router.push('/admin')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-[#FEEBB1]/40 px-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full bg-white rounded-3xl shadow-xl shadow-[#fed869]/15 border border-[#fed869]/30 overflow-hidden'
            >
                <div className='p-8'>
                    <div className='text-center mb-10'>
                        <div className='inline-flex items-center justify-center w-20 h-20 bg-[#fed869]/25 rounded-2xl mb-4 border border-[#fed869]/40 shadow-sm'>
                            <Icon icon='solar:chef-hat-bold-duotone' className='text-4xl text-amber-700' />
                        </div>
                        <h1 className='text-3xl font-extrabold text-grey-dark capitalize'>Admin Portal</h1>
                        <p className='text-grey-muted text-sm mt-2'>Sign in to manage your mess subscriptions</p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label className='block text-xs font-extrabold text-grey-dark uppercase tracking-wider mb-2'>Email Address</label>
                            <div className='relative'>
                                <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                                    <Icon icon='solar:letter-bold-duotone' className='text-lg' />
                                </span>
                                <input
                                    type='email'
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='block w-full pl-11 pr-4 py-3.5 border border-grey/10 rounded-2xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fed869]/40 focus:border-[#fed869] text-grey-dark font-medium text-sm transition-all'
                                    placeholder='admin@premiummess.com'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-xs font-extrabold text-grey-dark uppercase tracking-wider mb-2'>Password</label>
                            <div className='relative'>
                                <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                                    <Icon icon='solar:lock-password-bold-duotone' className='text-lg' />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='block w-full pl-11 pr-11 py-3.5 border border-grey/10 rounded-2xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fed869]/40 focus:border-[#fed869] text-grey-dark font-medium text-sm transition-all'
                                    placeholder='••••••••'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute inset-y-0 right-0 pr-3.5 flex items-center text-grey-dark/40 hover:text-grey-dark transition-colors'
                                >
                                    <Icon icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className='text-xl' />
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full py-4 bg-[#fed869] hover:bg-[#e6c04f] text-grey-dark rounded-2xl font-extrabold shadow-lg shadow-[#fed869]/35 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50'
                        >
                            {loading ? (
                                <Icon icon='line-md:loading-loop' className='text-2xl mr-2' />
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>
                </div>
                <div className='bg-grey/5 p-4 text-center border-t border-grey/10'>
                    <button
                        onClick={() => router.push('/')}
                        className='text-grey-muted hover:text-grey-dark text-xs font-bold transition-colors flex items-center justify-center w-full gap-1 cursor-pointer'
                    >
                        <Icon icon='solar:arrow-left-linear' />
                        Back to Public Site
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
