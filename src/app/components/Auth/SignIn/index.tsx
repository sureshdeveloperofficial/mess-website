'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Logo from '@/app/components/Layout/Header/Logo'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'

const Signin = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Signed in successfully!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error: any) {
      toast.error('An error occurred during sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#FFFDF5] py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden'>
      {/* Decorative Ambient Honey Yellow Glows */}
      <div className='absolute -top-24 -left-24 w-96 h-96 bg-[#fed869]/20 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -bottom-24 -right-24 w-96 h-96 bg-[#fed869]/15 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#fed869]/10 rounded-full blur-[140px] pointer-events-none' />

      {/* Main Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='w-full max-w-[500px] bg-white rounded-3xl sm:rounded-[2.5rem] p-7 sm:p-11 shadow-2xl shadow-[#fed869]/15 border border-[#fed869]/35 relative z-10'
      >
        {/* Back to Home Link */}
        <div className='mb-6'>
          <Link
            href='/'
            className='inline-flex items-center gap-1.5 text-xs font-bold text-grey-dark/60 hover:text-amber-600 transition-colors group'
          >
            <Icon icon='solar:arrow-left-linear' className='text-base group-hover:-translate-x-0.5 transition-transform' />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className='text-center mb-8'>
          <div className='inline-block mb-3'>
            <Logo />
          </div>
          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fed869]/20 text-grey-dark text-[10px] font-black uppercase tracking-wider border border-[#fed869]/40 mb-3'>
            <Icon icon='solar:user-circle-bold-duotone' className='text-xs text-amber-700' />
            Customer Portal
          </div>
          <h1 className='text-2.5xl sm:text-3.5xl font-extrabold text-grey-dark tracking-tight leading-tight'>
            Welcome <span className='text-amber-600'>Back</span>
          </h1>
          <p className='text-xs sm:text-sm font-medium text-grey-dark/65 mt-1.5'>
            Sign in to manage your meal plans and orders
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Email Field */}
          <div className='space-y-1.5'>
            <label className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
              Email Address <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                <Icon icon='solar:letter-bold-duotone' className='text-lg' />
              </div>
              <input
                type='email'
                placeholder='name@example.com'
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className='w-full bg-[#FFFDF5] border border-[#fed869]/35 focus:bg-white focus:border-[#fed869] px-4 py-3.5 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#fed869]/20 transition-all placeholder:text-grey-dark/30'
              />
            </div>
          </div>

          {/* Password Field */}
          <div className='space-y-1.5'>
            <div className='flex justify-between items-center'>
              <label className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                Password <span className='text-red-500'>*</span>
              </label>
              <Link
                href='/forgot-password'
                className='text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors'
              >
                Forgot Password?
              </Link>
            </div>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                <Icon icon='solar:lock-password-bold-duotone' className='text-lg' />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className='w-full bg-[#FFFDF5] border border-[#fed869]/35 focus:bg-white focus:border-[#fed869] px-4 py-3.5 pl-11 pr-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#fed869]/20 transition-all placeholder:text-grey-dark/30'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-grey-dark/40 hover:text-grey-dark transition-colors cursor-pointer p-1'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon icon={showPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} className='text-lg' />
              </button>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className='pt-2'>
            <button
              disabled={loading}
              type='submit'
              className='w-full bg-[#fed869] hover:bg-[#e6c04f] text-grey-dark px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base flex justify-center items-center gap-2.5 shadow-lg shadow-[#fed869]/25 hover:shadow-xl hover:shadow-[#fed869]/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              {loading ? (
                <>
                  <Icon icon='line-md:loading-loop' className='text-xl' />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <Icon icon='solar:arrow-right-bold' className='text-base' />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Bottom Signup Switch */}
        <div className='mt-8 text-center pt-6 border-t border-grey-dark/5'>
          <p className='text-xs font-medium text-grey-dark/70'>
            Don't have an account yet?{' '}
            <Link
              href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className='text-amber-600 hover:text-amber-700 font-extrabold ml-1 hover:underline'
            >
              Create Brand New Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Signin
