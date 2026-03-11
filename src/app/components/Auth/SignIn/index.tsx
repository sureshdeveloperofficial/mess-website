'use client';
import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Logo from '@/app/components/Layout/Header/Logo'
import { Icon } from '@iconify/react'

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
      toast.error('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-[1400px] h-full lg:h-[800px] lg:min-h-[700px] mx-auto bg-white lg:rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 grid lg:grid-cols-2">
        
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
              Experience the <span className="text-secondary">Art of Taste</span>
            </h1>
            <p className="text-lg font-bold text-white/80 leading-relaxed uppercase tracking-widest text-[12px]">
              Join thousands of food lovers enjoying premium mess services daily. Your journey to healthy and delicious meals starts here.
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
                <span className="text-secondary">5000+</span> ACTIVE MEMBERS
              </p>
            </div>
          </div>

          <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            <span>© 2026 Al Shamil Mess</span>
            <span>Premium Quality Guaranteed</span>
          </div>
        </div>

        {/* Right Side: Form area */}
        <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[450px] mx-auto">
            <div className='mb-10 lg:hidden text-center'>
              <Logo />
            </div>
            
            <div className="mb-10">
              <h2 className="text-4xl font-black text-grey tracking-tight italic uppercase">Welcome Back</h2>
              <p className="text-[10px] text-grey/40 font-black uppercase tracking-[0.2em] mt-2">Sign in to access your dashboard</p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-4">Email Address</label>
                <input
                  type='email'
                  placeholder='name@example.com'
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className='w-full rounded-2xl border-2 border-grey/5 bg-grey/5 px-6 py-4 text-base outline-none transition focus:border-primary focus:bg-white text-grey font-bold placeholder:text-grey/20'
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest">Password</label>
                  <Link
                    href='/forgot-password'
                    className='text-[10px] font-black text-primary hover:text-primary/70 transition-colors uppercase tracking-widest'>
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className='w-full rounded-2xl border-2 border-grey/5 bg-grey/5 px-6 py-4 text-base outline-none transition focus:border-primary focus:bg-white text-grey font-bold pr-14 placeholder:text-grey/20 line-clamp-1'
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

              <div className='pt-4'>
                <button
                  disabled={loading}
                  type='submit'
                  className='flex w-full items-center text-sm font-black text-grey justify-center rounded-2xl bg-primary px-8 py-5 transition duration-300 ease-in-out hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50 uppercase tracking-widest'>
                  {loading ? (
                    <Icon icon="line-md:loading-loop" className="text-xl mr-3" />
                  ) : null}
                  {loading ? 'Authenticating...' : 'Sign In to Account'}
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className='text-[10px] text-grey/40 font-black uppercase tracking-widest'>
                New here?{' '}
                <Link href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className='text-primary hover:underline ml-2'>
                  Create Brand New Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signin
