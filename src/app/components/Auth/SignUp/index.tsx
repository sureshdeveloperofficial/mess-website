'use client';
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
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
      toast.success('Gourmet account created! Signing you in...')
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Sign-in failed. Please login manually.')
        router.push('/signin')
      } else {
        toast.success('Welcome aboard!')
        router.refresh()
        // Small delay to ensure session is initialized before redirection
        setTimeout(() => {
          router.push(callbackUrl)
        }, 100)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-[1400px] h-full lg:h-[900px] lg:min-h-[800px] mx-auto bg-white lg:rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 grid lg:grid-cols-2">
        
        {/* Left Side: Branding/Visuals */}
        <div className="hidden lg:flex relative bg-primary overflow-hidden items-center justify-center p-12">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
            style={{ backgroundImage: "url('/images/auth-bg.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-transparent" />
          
          <div className="relative z-10 text-white max-w-md">
            <div className="mb-8">
              <Logo />
            </div>
            <h1 className="text-5xl font-black mb-6 leading-tight uppercase tracking-tight italic">
              Join the <span className="text-secondary">Taste Revolution</span>
            </h1>
            <p className="text-lg font-bold text-white/80 leading-relaxed uppercase tracking-widest text-[12px]">
              Ready to elevate your meal experience? Create your account today and explore gourmet mess services tailored for you.
            </p>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-primary bg-grey/10 flex items-center justify-center overflow-hidden">
                    <Icon icon="ion:person-circle-outline" className="text-4xl text-white/50" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-black uppercase tracking-widest">
                <span className="text-secondary">10,000+</span> DELIGHTED USERS
              </p>
            </div>
          </div>

          <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            <span>© 2026 Al Shamil Mess</span>
            <span>Premium Taste Guaranteed</span>
          </div>
        </div>

        {/* Right Side: Form area */}
        <div className="p-8 md:p-14 lg:p-16 flex flex-col justify-center bg-white overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[550px] mx-auto">
            <div className='mb-8 lg:hidden text-center'>
              <Logo />
            </div>
            
            <div className="mb-8">
              <h2 className="text-4xl font-black text-grey tracking-tight italic uppercase">Create Account</h2>
              <p className="text-[10px] text-grey/40 font-black uppercase tracking-[0.2em] mt-2">Start your gourmet journey today</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Full Name</label>
                  <input
                    type='text'
                    placeholder='Enter your name'
                    name='name'
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className='w-full rounded-2xl border-2 border-grey/5 bg-grey/5 px-6 py-3.5 text-base outline-none transition focus:border-primary focus:bg-white text-grey font-bold placeholder:text-grey/20'
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Email Address</label>
                  <input
                    type='email'
                    placeholder='name@example.com'
                    name='email'
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className='w-full rounded-2xl border-2 border-grey/5 bg-grey/5 px-6 py-3.5 text-base outline-none transition focus:border-primary focus:bg-white text-grey font-bold placeholder:text-grey/20'
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Phone Number</label>
                  <input
                    type='text'
                    placeholder='+971 XX XXX XXXX'
                    name='phone'
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className='w-full rounded-2xl border-2 border-grey/5 bg-grey/5 px-6 py-3.5 text-base outline-none transition focus:border-primary focus:bg-white text-grey font-bold placeholder:text-grey/20'
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      name='password'
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className='w-full rounded-2xl border-2 border-grey/5 bg-grey/5 px-6 py-3.5 text-base outline-none transition focus:border-primary focus:bg-white text-grey font-bold pr-14 placeholder:text-grey/20 line-clamp-1'
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-grey/20 hover:text-primary transition-colors"
                    >
                      <Icon icon={showPassword ? "ion:eye-off-outline" : "ion:eye-outline"} className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Security Checklist */}
              {formData.password.length > 0 && (
                <div className="my-4 grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-grey/5 rounded-2xl border border-grey/5">
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
                  className='flex w-full items-center text-sm font-black text-grey justify-center rounded-2xl bg-primary px-8 py-5 transition duration-300 ease-in-out hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50 uppercase tracking-widest'>
                  {registerMutation.isPending ? (
                    <Icon icon="line-md:loading-loop" className="text-xl mr-3" />
                  ) : null}
                  {registerMutation.isPending ? 'Syncing...' : 'Create My Account'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className='text-[10px] text-grey/30 font-black uppercase tracking-widest leading-relaxed'>
                By joining you agree with our{' '}
                <Link href='/privacy' className='text-primary hover:underline font-bold'>Privacy</Link>{' '}
                &{' '}
                <Link href='/policy' className='text-primary hover:underline font-bold'>Terms</Link>
              </p>

              <p className='text-[10px] text-grey/40 font-black uppercase tracking-widest'>
                Already a member?{' '}
                <Link href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className='text-primary hover:underline ml-2'>
                  Sign In to Account
                </Link>
              </p>
            </div>
          </div>
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
