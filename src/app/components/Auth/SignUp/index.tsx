'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Logo from '@/app/components/Layout/Header/Logo'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'

const SignUp = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    whatsappNo: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Password Security Checklist
  const passwordCriteria = useMemo(() => ({
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
  }), [formData.password])

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean)

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.post('/api/auth/register', data)
      return response.data
    },
    onSuccess: async () => {
      toast.success('Account created successfully! Signing you in...')
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Sign-in failed. Please login manually.')
        router.push('/signin')
      } else {
        toast.success('Welcome to Premium Mess!')
        router.refresh()
        setTimeout(() => {
          router.push(callbackUrl)
        }, 150)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      toast.error('Please meet all password requirements')
      return
    }
    registerMutation.mutate(formData)
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#FFFDF5] py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden'>
      {/* Decorative Ambient Honey Yellow Glows */}
      <div className='absolute -top-24 -left-24 w-96 h-96 bg-[#FFD54F]/20 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute -bottom-24 -right-24 w-96 h-96 bg-[#FFD54F]/15 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFD54F]/10 rounded-full blur-[140px] pointer-events-none' />

      {/* Main Centered Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='w-full max-w-[620px] bg-white rounded-3xl sm:rounded-[2.5rem] p-7 sm:p-11 shadow-2xl shadow-[#FFD54F]/15 border border-[#FFD54F]/35 relative z-10'
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
          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD54F]/20 text-grey-dark text-[10px] font-black uppercase tracking-wider border border-[#FFD54F]/40 mb-3'>
            <Icon icon='solar:shield-star-bold-duotone' className='text-xs text-amber-600' />
            Authentic Meal Plans
          </div>
          <h1 className='text-2.5xl sm:text-3.5xl font-extrabold text-grey-dark tracking-tight leading-tight'>
            Create Your <span className='text-amber-500'>Account</span>
          </h1>
          <p className='text-xs sm:text-sm font-medium text-grey-dark/65 mt-1.5'>
            Sign up in seconds to start ordering your daily meals
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
            {/* Full Name */}
            <div className='space-y-1.5'>
              <label className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                Full Name <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                  <Icon icon='solar:user-bold-duotone' className='text-lg' />
                </div>
                <input
                  type='text'
                  placeholder='Full Name'
                  name='name'
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                />
              </div>
            </div>

            {/* Email Address */}
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
                  name='email'
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className='space-y-1.5'>
              <label className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                Phone Number <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                  <Icon icon='solar:phone-bold-duotone' className='text-lg' />
                </div>
                <input
                  type='tel'
                  placeholder='+971 XX XXX XXXX'
                  name='phone'
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                />
              </div>
            </div>

            {/* Password */}
            <div className='space-y-1.5'>
              <label className='text-[11px] font-extrabold text-grey-dark uppercase tracking-wider block'>
                Password <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-dark/40'>
                  <Icon icon='solar:lock-password-bold-duotone' className='text-lg' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  name='password'
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-4 py-3 pl-11 pr-11 rounded-2xl text-grey-dark font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2 text-grey-dark/40 hover:text-grey-dark transition-colors cursor-pointer p-1'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon icon={showPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} className='text-base' />
                </button>
              </div>
            </div>
          </div>

          {/* Password Security Checklist */}
          {formData.password.length > 0 && (
            <div className='my-3 grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#FFFDF5] rounded-2xl border border-[#FFD54F]/35'>
              <CheckItem label='8+ Chars' isValid={passwordCriteria.minLength} />
              <CheckItem label='Uppercase' isValid={passwordCriteria.hasUpper} />
              <CheckItem label='Number' isValid={passwordCriteria.hasNumber} />
              <CheckItem label='Symbol' isValid={passwordCriteria.hasSpecial} />
            </div>
          )}

          {/* Submit CTA Button */}
          <div className='pt-2'>
            <button
              disabled={registerMutation.isPending}
              type='submit'
              className='w-full bg-[#FFD54F] hover:bg-[#F59E0B] text-grey-dark px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base flex justify-center items-center gap-2.5 shadow-lg shadow-[#FFD54F]/25 hover:shadow-xl hover:shadow-[#FFD54F]/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              {registerMutation.isPending ? (
                <>
                  <Icon icon='line-md:loading-loop' className='text-xl' />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create My Account</span>
                  <Icon icon='solar:arrow-right-bold' className='text-base' />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Bottom Terms & Sign In Switch */}
        <div className='mt-6 text-center space-y-3 pt-4 border-t border-grey-dark/5'>
          <p className='text-[11px] text-grey-dark/50 font-medium'>
            By creating an account, you agree to our{' '}
            <Link href='/terms' className='text-amber-600 hover:underline font-bold'>Terms of Service</Link>{' '}
            &{' '}
            <Link href='/privacy' className='text-amber-600 hover:underline font-bold'>Privacy Policy</Link>.
          </p>

          <p className='text-xs font-medium text-grey-dark/70'>
            Already have an account?{' '}
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className='text-amber-600 hover:text-amber-700 font-extrabold ml-1 hover:underline'
            >
              Sign In to Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

const CheckItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
  <div className={`flex items-center gap-1.5 ${isValid ? 'text-green-600' : 'text-grey-dark/30'}`}>
    <Icon icon={isValid ? 'solar:check-circle-bold' : 'solar:close-circle-linear'} className='text-sm shrink-0' />
    <span className='text-[10px] font-extrabold uppercase tracking-wider'>{label}</span>
  </div>
)

export default SignUp
