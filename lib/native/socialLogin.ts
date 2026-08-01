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

// Neither GoogleProvider.swift nor AppleProvider.swift in this plugin hash
// the nonce before handing it to the native SDK -- whatever string is
// passed here is exactly what ends up in the resulting ID token's `nonce`
// claim, so the same raw value goes to both the login() call and
// signInWithIdToken() below. No separate raw/hashed nonce pair needed.
async function ensureInitialized() {
  if (initialized) return;
  await SocialLogin.initialize({
    google: {
      iOSClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      mode: 'online',
    },
    apple: {
      // Native Sign in with Apple never leaves the app to redirect
      // anywhere -- '' is what the plugin's own docs specify for iOS.
      redirectUrl: '',
    },
  });
  initialized = true;
}

export async function signInWithGoogleNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) throw new Error('Native Google sign-in is iOS/Android only');
  await ensureInitialized();

  const nonce = randomNonce();
  const { result } = await SocialLogin.login({
    provider: 'google',
    options: { nonce, scopes: ['email', 'profile'] },
  });

  if (result.responseType !== 'online' || !result.idToken) {
    throw new Error('Google sign-in did not return an ID token');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: result.idToken,
    nonce,
  });
  if (error) throw error;
}

export async function signInWithAppleNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) throw new Error('Native Apple sign-in is iOS only');
  await ensureInitialized();

  const nonce = randomNonce();
  const { result } = await SocialLogin.login({
    provider: 'apple',
    options: { nonce },
  });

  if (!result.idToken) {
    throw new Error('Apple sign-in did not return an ID token');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: result.idToken,
    nonce,
  });
  if (error) throw error;
}
