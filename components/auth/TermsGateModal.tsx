'use client';

import Link from 'next/link';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { hapticDecision } from '@/lib/haptics';

interface TermsGateModalProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

// Shown once per device before a first sign-in/sign-up action completes --
// mirrors the "accept terms before continuing" gate every major dating app
// uses, which GreenFlag was missing entirely (nothing previously blocked
// Google/Apple/email auth on terms acceptance).
export function TermsGateModal({ open, onAccept, onClose }: TermsGateModalProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="font-display text-2xl text-ink mb-3">Our Terms & Privacy</h2>
      <p className="text-ink/60 text-sm leading-relaxed mb-4">
        Before you continue, here&apos;s what matters most:
      </p>
      <ul className="space-y-2.5 text-ink/70 text-sm leading-relaxed mb-5 list-disc list-inside">
        <li>You must be 18+ and every new profile is reviewed before approval.</li>
        <li>You&apos;re responsible for what you post, and can report or block anyone directly in the app.</li>
        <li>We only use your data to run GreenFlag&apos;s matching and safety features -- see our Privacy Policy for details.</li>
      </ul>
      <p className="text-ink/50 text-xs leading-relaxed mb-6">
        Read the full{' '}
        <Link href="/terms" className="text-gold underline underline-offset-2">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-gold underline underline-offset-2">Privacy Policy</Link>.
      </p>
      <button onClick={() => { hapticDecision(); onAccept(); }} className="btn-primary w-full py-4 mb-4">
        Accept Terms
      </button>
    </BottomSheet>
  );
}
