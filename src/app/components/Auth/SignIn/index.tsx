import React, { useState } from 'react'
import Link from 'next/link'
import SocialSignIn from '../SocialSignIn'
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
    <div className="w-full max-w-[500px] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
      <div className="p-8 md:p-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className='mb-8 text-center'>
          <Logo />
          <h2 className="text-2xl font-black text-grey mt-4">Welcome Back</h2>
          <p className="text-sm text-grey/40 font-bold uppercase tracking-widest mt-1">Sign in to your account</p>
        </div>

        <SocialSignIn />

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative z-10 bg-white px-4 text-xs font-black text-grey/30 uppercase tracking-widest">OR</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type='email'
                placeholder='name@example.com'
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className='w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-2.5 md:py-3 text-base outline-none transition focus:border-primary focus:bg-white text-black font-medium'
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-grey/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
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

          <div className="flex justify-end">
            <Link
              href='/forgot-password'
              className='text-xs font-bold text-grey/50 hover:text-primary transition-colors'>
              Forgot Password?
            </Link>
          </div>

          <div className='pt-2'>
            <button
              disabled={loading}
              type='submit'
              className='flex w-full items-center text-sm font-black text-grey justify-center rounded-2xl bg-primary px-5 py-3.5 md:py-4 transition duration-300 ease-in-out hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 uppercase tracking-widest'>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className='text-sm text-black/60 font-bold'>
            Not a member yet?{' '}
            <Link href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className='text-primary hover:underline'>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signin
