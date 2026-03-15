import Signin from '@/app/components/Auth/SignIn'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'
import React, { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign In | Property',
}

const SigninPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <Suspense fallback={<div>Loading...</div>}>
                <Signin />
            </Suspense>
        </div>
    )
}

export default SigninPage
