import { Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import SmoothScrollProvider from '@/app/components/Common/SmoothScrollProvider'

const font = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={`${font.variable}`} suppressHydrationWarning>
      <body className={`${font.className} font-sans`} suppressHydrationWarning>
        <SmoothScrollProvider>
          <Providers>
            {children}
          </Providers>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
