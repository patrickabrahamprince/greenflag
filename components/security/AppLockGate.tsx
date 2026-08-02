'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useUserStore } from '@/lib/store';

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
  const user = useUserStore((s) => s.user);
  const hasUserRef = useRef(!!user);
  hasUserRef.current = !!user;

  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(false);

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

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let resumeHandle: { remove: () => void } | undefined;

    // addResumeListener requires checkBiometry() to have been called at
    // least once first, per the plugin's own contract.
    BiometricAuth.checkBiometry().then((result) => {
      if (!result.isAvailable) return;

      if (hasUserRef.current) {
        setLocked(true);
        attemptUnlock();
      }

      BiometricAuth.addResumeListener((info) => {
        if (!info.isAvailable || !hasUserRef.current) return;
        setLocked(true);
        attemptUnlock();
      }).then((handle) => {
        resumeHandle = handle;
      });
    });

    return () => resumeHandle?.remove();
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
    </div>
  );
}
