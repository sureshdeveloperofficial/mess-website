import CustomerPortalLayout from '@/app/components/Layout/CustomerPortalLayout'

export const metadata = {
    title: 'My Subscriptions & Orders | Al Shamil Mess',
    description: 'Track your daily meal subscriptions, upcoming food items, and delivery schedules.',
}

export default function MyOrdersLayout({ children }: { children: React.ReactNode }) {
    return <CustomerPortalLayout>{children}</CustomerPortalLayout>
}
