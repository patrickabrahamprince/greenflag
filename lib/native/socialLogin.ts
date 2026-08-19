'use client';

import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { createClient } from '@/lib/supabase/client';

// The existing "Continue with Google/Apple" buttons use Supabase's
// web-based OAuth flow (supabase.auth.signInWithOAuth), which just opens
// the provider's login page inside the app's WKWebView -- a separate,
// isolated browsing context from Safari, so it never sees the device's
// already-signed-in Google/Apple accounts. This module is the native-SDK
// alternative used only on iOS: it gets a real ID token from the native
// account picker, then hands that to Supabase's signInWithIdToken, which
// verifies it and issues a normal Supabase session -- same end result,
// actually native UX.
const GOOGLE_IOS_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let initialized = false;

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Confirmed by testing (Supabase rejected the first attempt with "nonces
// mismatched"): Supabase's signInWithIdToken hashes whatever nonce you
// give it and compares that against the token's `nonce` claim -- it
// doesn't compare the raw value directly. Both Apple and (per this same
// error) Google's native sign-in embed the *hashed* value in the ID
// token's nonce claim, so the hashed nonce has to go to the native
// login() call and the raw, unhashed nonce has to go to Supabase, which
// then hashes it itself to find a match.
async function ensureInitialized() {
  if (initialized) return;
  // Android's initialize() validates apple.redirectUrl and rejects the
  // whole call (breaking Google init too, since it's one shared call) if
  // it's empty -- Android has no native Sign in with Apple, so it expects
  // a real web-redirect URL there. Since signInWithAppleNative already
  // refuses to run on anything but iOS, the plugin is simply never told
  // about Apple outside of iOS.
  await SocialLogin.initialize({
    google: {
      iOSClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      mode: 'online',
    },
    ...(Capacitor.getPlatform() === 'ios'
      ? {
          apple: {
            // Native Sign in with Apple never leaves the app to redirect
            // anywhere -- '' is what the plugin's own docs specify for iOS.
            redirectUrl: '',
          },
        }
      : {}),
  });
  initialized = true;
}

export async function signInWithGoogleNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) throw new Error('Native Google sign-in is iOS/Android only');
  await ensureInitialized();

  const rawNonce = randomNonce();
  const hashedNonce = await sha256Hex(rawNonce);
  // forcePrompt skips the plugin's "restore previous sign-in" fast path on
  // iOS (GIDSignIn.hasPreviousSignIn() -> restorePreviousSignIn ->
  // refreshTokensIfNeeded), which silently reuses whatever ID token is
  // already cached in the device Keychain from an earlier session --
  // that cached token's nonce claim reflects whichever nonce was current
  // back when it was first issued, not the fresh one generated above, so
  // Supabase's hash comparison fails with "nonces mismatched" on every
  // sign-in after the first on a given device. Forcing the prompt makes
  // it always run a real interactive sign-in bound to this nonce.
  const { result } = await SocialLogin.login({
    provider: 'google',
    options: { nonce: hashedNonce, scopes: ['email', 'profile'], forcePrompt: true },
  });

  if (result.responseType !== 'online' || !result.idToken) {
    throw new Error('Google sign-in did not return an ID token');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: result.idToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}

export async function signInWithAppleNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) throw new Error('Native Apple sign-in is iOS only');
  await ensureInitialized();

  const rawNonce = randomNonce();
  const hashedNonce = await sha256Hex(rawNonce);
  const { result } = await SocialLogin.login({
    provider: 'apple',
    options: { nonce: hashedNonce },
  });

  if (!result.idToken) {
    throw new Error('Apple sign-in did not return an ID token');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: result.idToken,
    nonce: rawNonce,
  });
  if (error) throw error;
}
