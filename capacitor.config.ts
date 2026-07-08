import type { CapacitorConfig } from '@capacitor/cli';

// This app cannot be statically exported (real API routes, cookie-based
// SSR auth via middleware.ts, a Vercel cron job) -- webDir is unused at
// runtime since server.url below points the WebView at a live Next.js
// server instead of loading a bundled static build.
const config: CapacitorConfig = {
  appId: 'com.greenflag.app',
  appName: 'GreenFlag',
  webDir: 'public',
  server: {
    // Simulator shares the host Mac's network stack, so localhost reaches
    // the local dev server directly. For a physical device this needs to
    // be the Mac's LAN IP instead (e.g. http://192.168.x.x:3000).
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
