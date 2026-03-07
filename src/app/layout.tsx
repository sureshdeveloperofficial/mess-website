import { Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
