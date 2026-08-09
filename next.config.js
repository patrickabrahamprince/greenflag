const withPWA = require('next-pwa')({
  dest: 'public',
  // Registration is done manually (see components/pwa-registrar.tsx)
  // instead of next-pwa's auto-injected script, specifically so it can be
  // skipped inside the Capacitor native app. This same URL is loaded both
  // by real website visitors (who benefit from PWA caching) and by the
  // native app's WKWebView (which doesn't -- it has its own update path
  // via App Store builds, and a caching service worker sitting in front
  // of every fetch was actively working against fast iteration: fixes
  // deployed to production could keep showing old behavior on-device
  // until the SW's cache-fallback strategies caught up).
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Vercel's file tracing only bundles what a serverless function
    // statically references; certs/apple-root-ca/*.cer is read at runtime
    // via a dynamically-built path (readFileSync(path.join(...))) in
    // app/api/payments/apple/verify, which tracing can miss. Without this,
    // Apple purchase verification would 500 in production (file not
    // found) despite working fine locally where the whole repo is present.
    outputFileTracingIncludes: {
      '/api/payments/apple/verify': ['./certs/apple-root-ca/**'],
    },
  },
  async redirects() {
    return [
      { source: '/your-standards', destination: '/standard/builder', permanent: true },
      { source: '/interested', destination: '/connections', permanent: true },
      { source: '/discover-men', destination: '/discover', permanent: true },
      { source: '/signup', destination: '/login', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https: http:",
            "media-src 'self' blob: data: https://*.supabase.co",
            "font-src 'self'",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
            "frame-src 'self'",
          ].join('; '),
        },
      ],
    },
  ],
};

module.exports = withPWA(nextConfig);
