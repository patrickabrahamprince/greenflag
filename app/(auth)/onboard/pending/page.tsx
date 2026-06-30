'use client';

import { Hourglass, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PendingApprovalPage() {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col justify-center items-center px-8 bg-[#FAF9F7] text-center">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleSignOut}
          className="text-xs text-ink/40 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>

      <div className="w-16 h-16 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/30 flex items-center justify-center mb-6">
        <Hourglass className="w-8 h-8 text-[#C9A961]" />
      </div>

      <h1 className="font-['Playfair_Display'] text-3xl text-ink mb-3">
        Your application is under review
      </h1>
      <p className="text-ink/60 text-sm leading-relaxed max-w-sm">
        GreenFlag is a curated community. We're reviewing your profile to make sure
        it's the right fit — you'll be notified the moment you're approved.
      </p>
    </div>
  );
}
