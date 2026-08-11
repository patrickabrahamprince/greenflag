import './globals.css'
import localFont from 'next/font/local'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SwipeBackGesture } from '@/components/layout/SwipeBackGesture'
import type { Metadata, Viewport } from 'next'

// Cabinet Grotesk, per the Dateasy design system -- self-hosted via
// next/font/local (not next/font/google, since it isn't on Google Fonts)
// so the four weights this app actually uses are bundled and available
// offline inside the Capacitor WKWebView, not fetched from Fontshare's
// CDN at runtime.
const cabinetGrotesk = localFont({
  src: [
    { path: './fonts/cabinet-grotesk/CabinetGrotesk-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/cabinet-grotesk/CabinetGrotesk-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/cabinet-grotesk/CabinetGrotesk-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/cabinet-grotesk/CabinetGrotesk-Extrabold.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-cabinet-grotesk',
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
    <html lang="en" className={cabinetGrotesk.variable} style={{ colorScheme: 'dark' }}>
      <body className="min-h-dvh bg-base text-ink font-sans">
        <ErrorBoundary>
          <Providers>
            <SwipeBackGesture>{children}</SwipeBackGesture>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
