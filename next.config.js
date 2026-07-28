const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/your-standards', destination: '/standard/builder', permanent: true },
      { source: '/interested', destination: '/connections', permanent: true },
      { source: '/discover-men', destination: '/discover', permanent: true },
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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https: http:",
            "media-src 'self' blob: data:",
            "font-src 'self'",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
            // checkout.razorpay.com alone isn't enough -- Razorpay serves
            // several payment-method steps (UPI intent/QR, some bank
            // redirects) as a frame from api.razorpay.com directly, not
            // just via XHR. Missing it here is exactly what produces
            // Chrome's "This content is blocked" message mid-checkout.
            "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
          ].join('; '),
        },
      ],
    },
  ],
};

module.exports = withPWA(nextConfig);
