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
      desc: 'Lifestyle & basics help you stand out and match better.',
    },
  ].filter((item): item is { label: string; desc: string } => !!item);

  if (items.length === 0) return null;

  const goToDetails = () => { hapticTap(); router.push('/profile/edit/details'); };

  return (
    <div className="w-full mt-2 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs font-semibold text-gold shrink-0">{percent}%</span>
      </div>
      <p className="text-xs text-ink/50 mb-4">Complete your profile to be seen by more people!</p>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={goToDetails}
            className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink font-medium">{item.label}</p>
              <p className="text-xs text-ink/50 mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink/40 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
