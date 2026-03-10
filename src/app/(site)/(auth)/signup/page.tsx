import SignUp from '@/app/components/Auth/SignUp'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Property',
}

const SignupPage = () => {
  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      <Breadcrumb pageName='Sign Up Page' />

      <div className="container mx-auto px-4 mt-[-40px] relative z-20">
        <SignUp />
      </div>
    </div>
  )
}

export default SignupPage
