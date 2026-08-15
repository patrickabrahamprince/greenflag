import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

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
//
// REVERTED: briefly pointed this at /login directly to skip the extra
// middleware round trip '/' costs on cold launch (see git history), but
// that broke native OAuth -- Google/Apple sign-in started escaping to
// the system browser instead of completing in-app. Capacitor's own
// native-bridge/navigation-interception logic evidently keys off
// server.url more strictly than just "same origin" when it carries a
// path, and a broken login flow is a far worse problem than a slow cold
// start. Back to the bare origin; the '/' round-trip cost should be
// solved server-side (e.g. middleware treating '/' as an instant
// redirect without the Supabase call) rather than by changing what
// Capacitor loads on launch.
const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://greenflag-dusky.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.greenflagapp.app',
  appName: 'GreenFlag',
  webDir: 'public',
  // Without this, the WKWebView's own background defaults to
  // UIColor.systemBackground (white in light mode) for the brief gap
  // between the native launch screen dismissing and the remote page
  // actually painting -- that gap is the "white screen before sign-in"
  // flash. Matching it to the app's real background color closes the gap
  // with dark instead of white regardless of system appearance.
  backgroundColor: '#0B0614',
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
  plugins: {
    // Only Google and Apple sign-in are used -- disabling Facebook/Twitter
    // keeps their SDKs out of the binary entirely rather than shipping
    // unused dependencies.
    SocialLogin: {
      providers: {
        google: true,
        apple: true,
        facebook: false,
        twitter: false,
      },
    },
    // Two native resize modes were tried and dropped: 'body' only sets
    // document.body.style.height via injected JS, which `dvh` units
    // (used everywhere in this app) completely ignore since they're
    // computed from the viewport, not body's height. 'native' resizes the
    // WKWebView's actual frame, which dvh does respond to, but its exact
    // timing/animation relative to the keyboard's own slide-up varied
    // enough in testing to still look broken on some screens. 'none'
    // hands this over entirely to KeyboardInsetListener
    // (components/keyboard-inset-listener.tsx), which reads the real
    // keyboardWillShow/keyboardWillHide height and drives a single CSS
    // variable -- explicit, debuggable, and not dependent on how any
    // given native resize mode happens to interact with dvh.
    Keyboard: {
      resize: KeyboardResize.None,
    },
    // No deliberate hold -- dismiss as soon as the native init step
    // finishes instead of forcing a fixed branded delay before login
    // (Google/Apple buttons) becomes visible.
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: '#0B0614',
    },
  },
};

export default config;
