import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import SocialSignUp from '../SocialSignUp'
import Logo from '@/app/components/Layout/Header/Logo'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Icon } from '@iconify/react'

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
      toast.success('Account created successfully!')
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        toast.error('Registered but failed to sign in automatically')
        router.push('/signin')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Registration failed')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      toast.error('Please meet all password security requirements')
      return
    }
    registerMutation.mutate(formData)
  }

  return (
    <div className="w-full max-w-[650px] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
      <div className="p-8 md:p-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className='mb-8 text-center'>
          <Logo />
          <h2 className="text-2xl font-black text-grey mt-4">Create Account</h2>
          <p className="text-sm text-grey/40 font-bold uppercase tracking-widest mt-1">Join Al Shamil Mess today</p>
        </div>

        <SocialSignUp />

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative z-10 bg-white px-4 text-xs font-black text-grey/30 uppercase tracking-widest">OR</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1">Full Name</label>
              <input
                type='text'
                placeholder='Enter your name'
                name='name'
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-2.5 md:py-3 text-base outline-none transition focus:border-primary focus:bg-white text-black font-medium'
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type='email'
                placeholder='name@example.com'
                name='email'
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className='w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-2.5 md:py-3 text-base outline-none transition focus:border-primary focus:bg-white text-black font-medium'
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1">Phone Number</label>
              <input
                type='text'
                placeholder='+971 XX XXX XXXX'
                name='phone'
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className='w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-2.5 md:py-3 text-base outline-none transition focus:border-primary focus:bg-white text-black font-medium'
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  name='password'
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className='w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-2.5 md:py-3 text-base outline-none transition focus:border-primary focus:bg-white text-black font-medium pr-12'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grey/30 hover:text-primary transition-colors"
                >
                  <Icon icon={showPassword ? "ion:eye-off-outline" : "ion:eye-outline"} className="text-xl" />
                </button>
              </div>
            </div>
          </div>

          {/* Password Security Checklist */}
          {formData.password.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-xl">
              <CheckItem label="8+ Characters" isValid={passwordCriteria.minLength} />
              <CheckItem label="Uppercase" isValid={passwordCriteria.hasUpper} />
              <CheckItem label="A Number" isValid={passwordCriteria.hasNumber} />
              <CheckItem label="Special Char" isValid={passwordCriteria.hasSpecial} />
            </div>
          )}

          <div className='pt-4'>
            <button
              disabled={registerMutation.isPending}
              type='submit'
              className='flex w-full items-center text-sm font-black text-grey justify-center rounded-2xl bg-primary px-5 py-3.5 md:py-4 transition duration-300 ease-in-out hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 uppercase tracking-widest'>
              {registerMutation.isPending ? 'Processing...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className='text-[10px] md:text-xs text-black/40 font-medium leading-relaxed'>
            By creating an account you agree with our{' '}
            <Link href='/privacy' className='text-primary hover:underline font-bold'>Privacy</Link>{' '}
            and{' '}
            <Link href='/policy' className='text-primary hover:underline font-bold'>Policy</Link>
          </p>

          <p className='text-sm text-black/60 font-bold'>
            Already have an account?{' '}
            <Link href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className='text-primary hover:underline'>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const CheckItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
  <div className={`flex items-center gap-2 ${isValid ? 'text-green-500' : 'text-grey/30'}`}>
    <Icon icon={isValid ? "ion:checkmark-circle" : "ion:ellipse-outline"} className="text-xs" />
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </div>
)

export default SignUp
