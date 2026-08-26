import Header from '@/app/components/Layout/Header'
import Footer from '@/app/components/Layout/Footer'
import FloatingActions from '@/app/components/Common/FloatingActions'

export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <Header />
            {children}
            <Footer />
            <FloatingActions />
        </>
    )
}
