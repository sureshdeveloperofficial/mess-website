import SignUp from '@/app/components/Auth/SignUp'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'
import React, { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign Up | Property',
}

const SignupPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <Suspense fallback={<div>Loading...</div>}>
                <SignUp />
            </Suspense>
        </div>
    )
}

export default SignupPage
