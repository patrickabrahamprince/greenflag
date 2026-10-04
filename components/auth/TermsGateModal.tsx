'use client';

import Link from 'next/link';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { hapticDecision } from '@/lib/haptics';
import { ShieldCheck, UserCheck, Eye } from 'lucide-react';

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
    <BottomSheet open={open} onClose={onClose} theme="light">
      <div className="text-left space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight mb-1.5">
            Our Terms &amp; Privacy
          </h2>
          <p className="text-stone-500 text-xs font-medium leading-relaxed">
            Before you continue, here&apos;s what matters most:
          </p>
        </div>

        <div className="space-y-3 bg-[#F8FAFC] border border-stone-200/90 rounded-2xl p-4 text-xs leading-relaxed text-[#1C1C1E]">
          <div className="flex items-start gap-3">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-stone-900">18+ &amp; Verified:</span> You must be 18+ and every new profile is reviewed before approval.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-stone-900">Safety &amp; Respect:</span> You&apos;re responsible for what you post, and can report or block anyone directly in the app.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-stone-900">Your Privacy:</span> We only use your data to run GreenFlag&apos;s matching and safety features — see our Privacy Policy for details.
            </p>
          </div>
        </div>

        <p className="text-stone-500 text-xs leading-relaxed text-center">
          Read the full{' '}
          <Link href="/terms" className="text-emerald-700 font-semibold underline underline-offset-2 hover:text-emerald-800">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-emerald-700 font-semibold underline underline-offset-2 hover:text-emerald-800">
            Privacy Policy
          </Link>.
        </p>

        <button
          type="button"
          onClick={() => {
            hapticDecision();
            onAccept();
          }}
          className="w-full bg-[#1C1C1E] hover:bg-black text-white font-bold text-xs py-3.5 px-4 rounded-full shadow-sm transition-all active:scale-[0.98]"
        >
          Accept Terms
        </button>
      </div>
    </BottomSheet>
  );
}

