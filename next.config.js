const withPWA = (config) => config;

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
