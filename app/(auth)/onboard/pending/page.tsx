'use client';

import { Hourglass, LogOut, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col justify-center items-center px-8 bg-[#000000] text-center">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleSignOut}
          className="text-xs text-ink/40 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>

      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
        <Hourglass className="w-8 h-8 text-gold" />
      </div>

      <h1 className="font-display text-3xl text-ink mb-3">
        Your application is under review
      </h1>
      <p className="text-ink/60 text-sm leading-relaxed max-w-sm mb-8">
        GreenFlag is a curated community. We're reviewing your profile to make sure
        it's the right fit — you'll be notified the moment you're approved.
      </p>

      <button
        onClick={() => router.push('/discover')}
        className="btn-primary flex items-center gap-2 px-6"
      >
        <Compass className="w-4 h-4" />
        Start Discovering
      </button>
    </div>
  );
}
