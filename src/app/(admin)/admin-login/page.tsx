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
        <div className='min-h-screen flex items-center justify-center bg-[#fdf2f0] px-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden'
            >
                <div className='p-8'>
                    <div className='text-center mb-10'>
                        <div className='inline-flex items-center justify-center w-20 h-20 bg-[#df6853]/10 rounded-2xl mb-4'>
                            <Icon icon='ion:cafe' className='text-4xl text-[#df6853]' />
                        </div>
                        <h1 className='text-3xl font-bold text-grey capitalize'>Admin Portal</h1>
                        <p className='text-grey/60 mt-2'>Sign in to manage your restaurant</p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label className='block text-sm font-medium text-grey mb-2'>Email Address</label>
                            <div className='relative'>
                                <span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-grey/40'>
                                    <Icon icon='ion:mail-outline' />
                                </span>
                                <input
                                    type='email'
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='block w-full pl-10 pr-3 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#df6853]/20 focus:border-[#df6853] transition-all'
                                    placeholder='admin@chefs-kitchen.com'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-grey mb-2'>Password</label>
                            <div className='relative'>
                                <span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-grey/40'>
                                    <Icon icon='ion:lock-closed-outline' />
                                </span>
                                <input
                                    type='password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='block w-full pl-10 pr-3 py-3 border border-grey/10 rounded-xl bg-grey/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#df6853]/20 focus:border-[#df6853] transition-all'
                                    placeholder='••••••••'
                                />
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full py-4 bg-[#df6853] text-white rounded-xl font-semibold shadow-lg shadow-[#df6853]/30 hover:bg-[#df6853]/90 active:scale-[0.98] transition-all flex items-center justify-center'
                        >
                            {loading ? (
                                <Icon icon='line-md:loading-loop' className='text-2xl mr-2' />
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>
                </div>
                <div className='bg-grey/5 p-4 text-center border-t border-grey/5'>
                    <button
                        onClick={() => router.push('/')}
                        className='text-grey/40 hover:text-grey text-sm transition-colors flex items-center justify-center w-full'
                    >
                        <Icon icon='ion:arrow-back-outline' className='mr-1' />
                        Back to Public Site
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
