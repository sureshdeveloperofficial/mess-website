import Signin from '@/app/components/Auth/SignIn'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Property',
}

const SigninPage = () => {
  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      <Breadcrumb pageName='Sign In Page' />

      <div className="container mx-auto px-4 mt-[-40px] relative z-20">
        <Signin />
      </div>
    </div>
  )
}

export default SigninPage
