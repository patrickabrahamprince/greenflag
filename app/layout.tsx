import './globals.css'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SwipeBackGesture } from '@/components/layout/SwipeBackGesture'
import type { Metadata, Viewport } from 'next'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'GreenFlag',
  description: 'Meet New People for Real Trips & Weekend Getaways.',
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
  // Kept for a hypothetical Android build (Chromium respects this), but
  // it does nothing on iOS -- WebKit has never implemented the
  // interactive-widget viewport property, so this alone can't make
  // min-h-dvh respond to the keyboard in the WKWebView this app actually
  // ships in. The real fix for that is the Keyboard plugin's
  // `resize: 'body'` config in capacitor.config.ts, which resizes the
  // native WebView body itself when the keyboard shows.
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`} style={{ colorScheme: 'light' }}>
      <body className="min-h-dvh bg-base text-ink font-sans antialiased selection:bg-emerald-500/20 selection:text-ink">
        <ErrorBoundary>
          <Providers>
            <SwipeBackGesture>{children}</SwipeBackGesture>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
