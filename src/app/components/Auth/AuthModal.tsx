'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/app/components/Layout/Header/Logo'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '' })
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  // Sync mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Password criteria for SignUp
  const passwordCriteria = useMemo(() => ({
    minLength: signUpData.password.length >= 8,
    hasUpper: /[A-Z]/.test(signUpData.password),
    hasNumber: /[0-9]/.test(signUpData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(signUpData.password),
  }), [signUpData.password])

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean)

  // Handle Sign In Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email: signInData.email,
        password: signInData.password,
        redirect: false
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Signed in successfully!')
        onClose()
        router.refresh()
      }
    } catch (error: any) {
      toast.error('An error occurred during sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Sign Up Mutation
  const registerMutation = useMutation({
    mutationFn: async (data: typeof signUpData) => {
      const response = await axios.post('/api/auth/register', data)
      return response.data
    },
    onSuccess: async () => {
      toast.success('Account created successfully! Signing you in...')
      const result = await signIn('credentials', {
        email: signUpData.email,
        password: signUpData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Sign-in failed. Please login manually.')
        setMode('signin')
      } else {
        toast.success('Welcome to Premium Mess!')
        onClose()
        router.refresh()
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.')
    }
  })

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      toast.error('Please meet all password requirements')
      return
    }
    registerMutation.mutate(signUpData)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-[#171717]/60 backdrop-blur-sm transition-opacity'
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`w-full ${
              mode === 'signup' ? 'max-w-[780px]' : 'max-w-[560px]'
            } bg-white rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 md:p-12 shadow-2xl shadow-[#FFD54F]/20 border border-[#FFD54F]/35 relative z-10 my-auto transition-all duration-300 max-h-[92vh] overflow-y-auto`}
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className='absolute top-5 right-5 p-2 rounded-full text-grey-dark/50 hover:text-grey-dark hover:bg-[#FFD54F]/20 transition-all cursor-pointer'
              aria-label='Close modal'
            >
              <Icon icon='solar:close-circle-bold' className='text-2xl' />
            </button>

            {/* Brand Logo & Header */}
            <div className='text-center mb-6'>
              <div className='inline-block mb-3'>
                <Logo />
              </div>

              {/* Mode Switch Tabs */}
              <div className='inline-flex p-1 rounded-2xl bg-[#FFFDF5] border border-[#FFD54F]/35 mt-1'>
                <button
                  type='button'
                  onClick={() => setMode('signin')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-[#FFD54F] text-grey-dark shadow-sm'
                      : 'text-grey-dark/60 hover:text-grey-dark'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type='button'
                  onClick={() => setMode('signup')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#FFD54F] text-grey-dark shadow-sm'
                      : 'text-grey-dark/60 hover:text-grey-dark'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* TAB: SIGN IN */}
            {mode === 'signin' && (
              <motion.form
                key='signin-form'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSignInSubmit}
                className='space-y-4 max-w-[440px] mx-auto'
              >
                <div className='space-y-1'>
                  <label className='text-[11px] font-bold text-grey-dark uppercase tracking-wider block'>
                    Email Address <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                      <Icon icon='solar:letter-bold-duotone' className='text-base' />
                    </div>
                    <input
                      type='email'
                      placeholder='name@example.com'
                      required
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-3.5 py-3 pl-10 rounded-2xl text-grey-dark font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                    />
                  </div>
                </div>

                <div className='space-y-1'>
                  <div className='flex justify-between items-center'>
                    <label className='text-[11px] font-bold text-grey-dark uppercase tracking-wider block'>
                      Password <span className='text-red-500'>*</span>
                    </label>
                    <Link
                      href='/forgot-password'
                      onClick={onClose}
                      className='text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors'
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                      <Icon icon='solar:lock-password-bold-duotone' className='text-base' />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      required
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-3.5 py-3 pl-10 pr-10 rounded-2xl text-grey-dark font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-grey-dark/40 hover:text-grey-dark transition-colors cursor-pointer p-1'
                    >
                      <Icon icon={showPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} className='text-base' />
                    </button>
                  </div>
                </div>

                <div className='pt-1.5'>
                  <button
                    disabled={loading}
                    type='submit'
                    className='w-full bg-[#FFD54F] hover:bg-[#F59E0B] text-grey-dark px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex justify-center items-center gap-2 shadow-md shadow-[#FFD54F]/25 hover:shadow-lg hover:shadow-[#FFD54F]/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                  >
                    {loading ? (
                      <>
                        <Icon icon='line-md:loading-loop' className='text-base' />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <Icon icon='solar:arrow-right-bold' className='text-sm' />
                      </>
                    )}
                  </button>
                </div>

                <div className='text-center pt-2.5 border-t border-grey-dark/5'>
                  <p className='text-xs font-medium text-grey-dark/70'>
                    Don't have an account?{' '}
                    <button
                      type='button'
                      onClick={() => setMode('signup')}
                      className='text-amber-600 hover:text-amber-700 font-bold ml-1 hover:underline cursor-pointer'
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </motion.form>
            )}

            {/* TAB: SIGN UP */}
            {mode === 'signup' && (
              <motion.form
                key='signup-form'
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSignUpSubmit}
                className='space-y-3.5 sm:space-y-4'
              >
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4'>
                  <div className='space-y-1'>
                    <label className='text-[11px] font-bold text-grey-dark uppercase tracking-wider block'>
                      Full Name <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                        <Icon icon='solar:user-bold-duotone' className='text-base' />
                      </div>
                      <input
                        type='text'
                        placeholder='Full Name'
                        required
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-3.5 py-3 pl-10 rounded-2xl text-grey-dark font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                      />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <label className='text-[11px] font-bold text-grey-dark uppercase tracking-wider block'>
                      Email Address <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                        <Icon icon='solar:letter-bold-duotone' className='text-base' />
                      </div>
                      <input
                        type='email'
                        placeholder='name@example.com'
                        required
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-3.5 py-3 pl-10 rounded-2xl text-grey-dark font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                      />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <label className='text-[11px] font-bold text-grey-dark uppercase tracking-wider block'>
                      Phone Number <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                        <Icon icon='solar:phone-bold-duotone' className='text-base' />
                      </div>
                      <input
                        type='tel'
                        placeholder='+971 XX XXX XXXX'
                        required
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-3.5 py-3 pl-10 rounded-2xl text-grey-dark font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                      />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <label className='text-[11px] font-bold text-grey-dark uppercase tracking-wider block'>
                      Password <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-grey-dark/40'>
                        <Icon icon='solar:lock-password-bold-duotone' className='text-base' />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        required
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className='w-full bg-[#FFFDF5] border border-[#FFD54F]/35 focus:bg-white focus:border-[#FFD54F] px-3.5 py-3 pl-10 pr-10 rounded-2xl text-grey-dark font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD54F]/20 transition-all placeholder:text-grey-dark/30'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-grey-dark/40 hover:text-grey-dark transition-colors cursor-pointer p-1'
                      >
                        <Icon icon={showPassword ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} className='text-base' />
                      </button>
                    </div>
                  </div>
                </div>

                {signUpData.password.length > 0 && (
                  <div className='my-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-[#FFFDF5] rounded-2xl border border-[#FFD54F]/35'>
                    <CheckItem label='8+ Chars' isValid={passwordCriteria.minLength} />
                    <CheckItem label='Uppercase' isValid={passwordCriteria.hasUpper} />
                    <CheckItem label='Number' isValid={passwordCriteria.hasNumber} />
                    <CheckItem label='Symbol' isValid={passwordCriteria.hasSpecial} />
                  </div>
                )}

                <div className='pt-1.5'>
                  <button
                    disabled={registerMutation.isPending}
                    type='submit'
                    className='w-full bg-[#FFD54F] hover:bg-[#F59E0B] text-grey-dark px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex justify-center items-center gap-2 shadow-md shadow-[#FFD54F]/25 hover:shadow-lg hover:shadow-[#FFD54F]/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Icon icon='line-md:loading-loop' className='text-base' />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create My Account</span>
                        <Icon icon='solar:arrow-right-bold' className='text-sm' />
                      </>
                    )}
                  </button>
                </div>

                <div className='text-center pt-2.5 border-t border-grey-dark/5'>
                  <p className='text-xs font-medium text-grey-dark/70'>
                    Already a member?{' '}
                    <button
                      type='button'
                      onClick={() => setMode('signin')}
                      className='text-amber-600 hover:text-amber-700 font-bold ml-1 hover:underline cursor-pointer'
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const CheckItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
  <div className={`flex items-center gap-1.5 ${isValid ? 'text-green-600' : 'text-grey-dark/30'}`}>
    <Icon icon={isValid ? 'solar:check-circle-bold' : 'solar:close-circle-linear'} className='text-xs shrink-0' />
    <span className='text-[9px] font-bold uppercase tracking-wider'>{label}</span>
  </div>
)

export default AuthModal
