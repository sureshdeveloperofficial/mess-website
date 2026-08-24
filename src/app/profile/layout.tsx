import CustomerPortalLayout from '@/app/components/Layout/CustomerPortalLayout'

export const metadata = {
    title: 'My Profile & Delivery Info | Premium Mess',
    description: 'Manage your profile and delivery addresses.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <CustomerPortalLayout>{children}</CustomerPortalLayout>
}
