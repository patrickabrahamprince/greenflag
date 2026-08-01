import type { CapacitorConfig } from '@capacitor/cli';

// This app cannot be statically exported (real API routes, cookie-based
// SSR auth via middleware.ts, a Vercel cron job) -- webDir is unused at
// runtime since server.url below points the WebView at a live server
// instead of loading a bundled static build.
//
// Defaults to the production Vercel deployment -- this is what ships in
// the App Store build. For local development against a dev server
// instead, run with CAPACITOR_SERVER_URL set, e.g.:
//   CAPACITOR_SERVER_URL=http://localhost:3000 npx cap sync ios
// (physical devices need the Mac's LAN IP, not localhost, since they
// don't share the host's network stack the way the Simulator does).
const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://greenflag-dusky.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.greenflagapp.app',
  appName: 'GreenFlag',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
    // Capacitor's WKWebView only navigates in-app within the configured
    // server.url's origin by default -- any other top-level navigation
    // (Google's OAuth consent screen, Supabase's own /auth/v1/authorize
    // redirect hop, Sign in with Apple) gets cancelled and handed to the
    // system browser instead, which is why OAuth logins were finishing
    // in Safari rather than back inside the app. Allowlisting the actual
    // domains involved in the OAuth round trip keeps the whole flow
    // in-app.
    allowNavigation: [
      '*.supabase.co',
      'accounts.google.com',
      '*.google.com',
      'appleid.apple.com',
    ],
  },
};

export default config;
