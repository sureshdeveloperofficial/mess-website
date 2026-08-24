import Signin from '@/app/components/Auth/SignIn'
import { Metadata } from 'next'
import React, { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign In | Premium Mess',
  description: 'Sign in to access your meal subscription and dashboard',
}

const LoginPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-xs font-bold text-grey-muted">Loading...</div>}>
                <Signin />
            </Suspense>
        </div>
    )
}

export default LoginPage
