'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore, useCoinStore } from '@/lib/store';

// Locks the whole app behind Face ID/Touch ID whenever someone's already
// signed in -- on cold start and every time the app comes back to the
// foreground, not just once at login. Someone picking up an already-
// unlocked phone shouldn't be able to reopen this and see matches,
// messages, or submissions without re-proving it's them.
//
// Skips entirely if the device has no biometry enrolled (checkBiometry's
// isAvailable is false) -- there's nothing to gate behind, and trapping
// someone who has no way to satisfy the prompt would just lock them out
// of their own account.
export function AppLockGate() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const setBalance = useCoinStore((s) => s.setBalance);
  const hasUserRef = useRef(!!user);
  hasUserRef.current = !!user;

  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Presenting the Face ID sheet itself can make iOS briefly report the
  // app as inactive-then-active again (a real, widely-reported quirk of
  // LocalAuthentication, not just something this app does) -- without
  // guarding against it, that blip looks exactly like "the app resumed
  // from the background" to the resume listener below, which fires
  // another attemptUnlock(), which shows Face ID again, whose dismissal
  // triggers the same blip again, forever. authenticatingRef blocks a
  // second attempt from starting while one is already in flight; the
  // cooldown after one just finished additionally absorbs the trailing
  // blip that can fire as the sheet's dismissal animation completes.
  const authenticatingRef = useRef(false);
  const lastAttemptEndedAtRef = useRef(0);
  const AUTH_COOLDOWN_MS = 1500;
  const biometryAvailableRef = useRef(false);
  // On a fresh login, the hasUser-transition effect below and a genuine
  // native-OAuth-sheet resume event can both legitimately fire attemptUnlock
  // -- e.g. resume fires first (returning from the Google/Apple sign-in
  // sheet, which does fully background this app), succeeds, and only
  // afterwards does the profile fetch in Providers.tsx populate the store
  // and flip hasUser, by which point AUTH_COOLDOWN_MS has already elapsed.
  // Both triggers are really the same "just arrived in the app" moment, so
  // once either has produced one successful unlock, the other shouldn't
  // prompt again -- only an actual later backgrounding (resume) should.
  const hasUnlockedOnceRef = useRef(false);

  const attemptUnlock = useCallback(async () => {
    if (authenticatingRef.current) return;
    authenticatingRef.current = true;
    setChecking(true);
    try {
      await BiometricAuth.authenticate({
        reason: 'Unlock GreenFlag',
        allowDeviceCredential: true,
      });
      hasUnlockedOnceRef.current = true;
      setLocked(false);
    } catch {
      // Failed or cancelled -- stays locked, "Try Again" retries.
    } finally {
      setChecking(false);
      authenticatingRef.current = false;
      lastAttemptEndedAtRef.current = Date.now();
    }
  }, []);

  const canAttempt = useCallback(() => {
    return !authenticatingRef.current && Date.now() - lastAttemptEndedAtRef.current > AUTH_COOLDOWN_MS;
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearUser();
      setBalance(0);
      setLocked(false);
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const hasUser = !!user;

  // Locks whenever we learn someone is actually signed in -- keyed on
  // `hasUser` itself rather than checked once at mount. The native
  // checkBiometry() round-trip reliably finishes before the Supabase
  // session restore in Providers.tsx does (that's two sequential network
  // calls vs. one local bridge call), so a one-time check at mount time
  // would read `hasUser` as false even for someone who's genuinely
  // logged in -- confirmed via device logs: checkBiometry kept resolving
  // isAvailable:true but authenticate() was never being called at all,
  // on both cold start and right after a fresh login. Re-running this
  // per `hasUser` transition (false -> true, at cold start or right
  // after login) closes that race instead of racing it.
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !hasUser || hasUnlockedOnceRef.current) return;
    let cancelled = false;
    BiometricAuth.checkBiometry().then((result) => {
      if (cancelled) return;
      biometryAvailableRef.current = result.isAvailable;
      if (!result.isAvailable || !canAttempt() || hasUnlockedOnceRef.current) return;
      setLocked(true);
      attemptUnlock();
    });
    return () => {
      cancelled = true;
    };
  }, [hasUser, attemptUnlock, canAttempt]);

  // Separately, re-lock whenever the app genuinely returns from the
  // background -- deliberately NOT using the biometric plugin's own
  // addResumeListener here. That helper is built on @capacitor/app's
  // `appStateChange` event, which (confirmed in @capacitor/app's own iOS
  // source) fires off UIApplication's didBecomeActive/willResignActive --
  // the same pair iOS fires for ANY transient system sheet, not just real
  // backgrounding: Face ID's own prompt, the native Google/Apple sign-in
  // account picker, permission dialogs, Razorpay's checkout sheet. Every
  // one of those was re-triggering this lock. @capacitor/app's `resume`
  // event is wired to willEnterForegroundNotification instead, which iOS
  // only fires on an actual return from the background.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let resumeHandle: { remove: () => void } | undefined;
    let mounted = true;

    App.addListener('resume', () => {
      if (!biometryAvailableRef.current || !hasUserRef.current || !canAttempt()) return;
      setLocked(true);
      attemptUnlock();
    }).then((handle) => {
      if (mounted) resumeHandle = handle;
      else handle.remove();
    });

    return () => {
      mounted = false;
      resumeHandle?.remove();
    };
  }, [attemptUnlock, canAttempt]);

  if (!locked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0614] px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-5">
        <ShieldCheck className="w-7 h-7 text-gold" />
      </div>
      <h2 className="font-display text-xl text-ink mb-2">Locked</h2>
      <p className="text-ink/50 text-sm mb-6">Unlock with Face ID to continue.</p>
      <button
        onClick={attemptUnlock}
        disabled={checking}
        className="btn-primary px-8 py-3 flex items-center justify-center gap-2"
      >
        {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Try Again'}
      </button>
      {/* Without this, declining or repeatedly failing Face ID leaves no
          way back into the app at all -- a real risk for App Review
          (a reviewer who cancels the prompt has to be able to get
          somewhere) and for a genuine user locked out by a Face ID
          failure. */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-4 text-xs text-ink/40 hover:text-ink underline underline-offset-4 decoration-ink/20 hover:decoration-ink/40 transition-colors disabled:opacity-50"
      >
        {loggingOut ? 'Logging out...' : 'Log Out'}
      </button>
    </div>
  );
}
