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
  // 'cover' extends content edge-to-edge under the notch/status bar/home
  // indicator -- required for this app's full-bleed gradient backgrounds
  // (login, onboarding) to actually reach the true screen edges instead
  // of rendering as an inset rectangle. Switching this to 'auto' was
  // tried and reverted: it fixed headers colliding with the notch but
  // broke every full-bleed background in the process. The correct fix
  // is env(safe-area-inset-*) padding on the specific header/button
  // elements that need it, not a global toggle that also clips
  // backgrounds that were supposed to bleed.
  viewportFit: 'cover',
  // Without this, WKWebView doesn't shrink the layout viewport when the
  // on-screen keyboard opens -- a bottom-pinned button inside a
  // min-h-dvh container stays positioned at the bottom of the
  // now-hidden-behind-the-keyboard viewport instead of reflowing above
  // it. 'resizes-content' makes 100vh/min-h-dvh actually shrink to
  // the visible area when the keyboard is up.
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={bricolage.variable} style={{ colorScheme: 'dark' }}>
      <body className="min-h-dvh bg-[#000000] text-[#FFFFFF] font-sans">
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
