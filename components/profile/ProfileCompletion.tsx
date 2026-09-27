'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';
import { LIFESTYLE_OPTIONS, BASICS_OPTIONS } from '@/lib/constants/profileDetails';
import type { Profile } from '@/types';

interface ProfileCompletionProps {
  user: Profile;
}

function hasAnyDetail(user: Profile): boolean {
  const keys = [...Object.keys(LIFESTYLE_OPTIONS), ...Object.keys(BASICS_OPTIONS)] as (keyof Profile)[];
  return keys.some((key) => !!user[key]);
}

// Own-profile nudge to fill in the optional fields that make a match
// more likely: a prompt, and the Lifestyle/Basics detail fields added
// alongside this component. Deliberately excludes bio/photos/interests
// from the "missing" checklist -- onboarding already requires those, so
// by the time someone lands here they're always satisfied; including
// them here would just be dead weight that can never actually nudge
// anyone. Hides itself entirely once nothing is left to add, rather than
// showing a static "100%" bar forever.
export function ProfileCompletion({ user }: ProfileCompletionProps) {
  const router = useRouter();
  const detailsComplete = hasAnyDetail(user);
  const promptComplete = !!(user.teaser_prompt && user.teaser_answer);

  const checks = [true, true, true, promptComplete, detailsComplete];
  const percent = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const items = [
    !promptComplete && {
      label: 'Add a prompt',
      desc: 'Show off your personality to spark better conversations.',
    },
    !detailsComplete && {
      label: 'Add your details',
      desc: 'Lifestyle & basics help you stand out and connect with compatible people.',
    },
  ].filter((item): item is { label: string; desc: string } => !!item);

  if (items.length === 0) return null;

  const goToDetails = () => { hapticTap(); router.push('/profile/edit/details'); };

  return (
    <div className="w-full mt-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-bold text-ink">Profile Strength</span>
        <span className="text-xs font-bold text-emerald">{percent}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-ink/60 mb-3.5">Complete your profile to unlock more high-quality matches!</p>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={goToDetails}
            className="w-full flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl px-3.5 py-3 text-left active:scale-[0.98] transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink">{item.label}</p>
              <p className="text-[11px] text-ink/60 mt-0.5 leading-snug">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink/40 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
