import './globals.css'
import { Poppins } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'

// Single unified typeface across the whole app -- Poppins is explicitly
// recommended for double duty (body text AND headlines), which lets one
// family cover what used to be three (Inter/Sora/Fraunces), using weight
// for hierarchy instead of mixing typefaces. See:
// https://www.justinmind.com/ui-design/best-font-mobile-app
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'GreenFlag',
  description: 'Set your standards. Meet your match.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable} style={{ colorScheme: 'dark' }}>
      <body className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
