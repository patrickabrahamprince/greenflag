import './globals.css'
import { Bricolage_Grotesque } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'

// Single unified typeface across the whole app. Poppins (tried first per
// justinmind.com's mobile app font guide) reads as generic/templated --
// it's one of the most overused fonts in low-effort app UIs. Bricolage
// Grotesque is a variable grotesque with distinctive, slightly asymmetric
// letterforms that avoids that "default Bootstrap-y" look while still
// being a clean UI sans. No true italic cut -- drop faux-italic styling
// on any element that used it, lean on weight/tracking instead.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-bricolage',
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
    <html lang="en" className={bricolage.variable} style={{ colorScheme: 'dark' }}>
      <body className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans">
        {/* afterInteractive (not lazyOnload) -- lazyOnload only loads
            during browser idle time, which can be several seconds after
            the Coins page is already interactive. Someone tapping Buy
            quickly would hit `new window.Razorpay(...)` before the SDK
            exists, throwing instead of opening checkout. */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
