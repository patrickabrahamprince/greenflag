'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
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

  const attemptUnlock = useCallback(async () => {
    setChecking(true);
    try {
      await BiometricAuth.authenticate({
        reason: 'Unlock GreenFlag',
        allowDeviceCredential: true,
      });
      setLocked(false);
    } catch {
      // Failed or cancelled -- stays locked, "Try Again" retries.
    } finally {
      setChecking(false);
    }
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
    if (!Capacitor.isNativePlatform() || !hasUser) return;
    let cancelled = false;
    BiometricAuth.checkBiometry().then((result) => {
      if (cancelled || !result.isAvailable) return;
      setLocked(true);
      attemptUnlock();
    });
    return () => {
      cancelled = true;
    };
  }, [hasUser, attemptUnlock]);

  // Separately, re-lock on every return from the background -- this one
  // really can rely on a ref since it fires long after mount, well past
  // any session-restore race.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let resumeHandle: { remove: () => void } | undefined;
    let mounted = true;

    // addResumeListener requires checkBiometry() to have been called at
    // least once first, per the plugin's own contract.
    BiometricAuth.checkBiometry().then(() => {
      BiometricAuth.addResumeListener((info) => {
        if (!info.isAvailable || !hasUserRef.current) return;
        setLocked(true);
        attemptUnlock();
      }).then((handle) => {
        if (mounted) resumeHandle = handle;
        else handle.remove();
      });
    });

    return () => {
      mounted = false;
      resumeHandle?.remove();
    };
  }, [attemptUnlock]);

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
