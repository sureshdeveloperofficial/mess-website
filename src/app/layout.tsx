import { Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import SmoothScrollProvider from '@/app/components/Common/SmoothScrollProvider'

const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${font.className}`}>
        <SmoothScrollProvider>
          <Providers>
            {children}
          </Providers>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
