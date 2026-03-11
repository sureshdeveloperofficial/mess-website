import SignUp from '@/app/components/Auth/SignUp'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Property',
}

const SignupPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <SignUp />
        </div>
    )
}

export default SignupPage
