'use client';

import { useRouter } from 'next/navigation';
import { Crown, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function OnboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const selectRole = async (gender: 'host' | 'guest') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Session expired');
      router.replace('/login');
      return;
    }
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      gender,
      role: gender,
    } as any);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.replace(`/onboard/profile?role=${gender}`);
  };

  return (
    <div className="w-full animate-fade-in min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-semibold text-white mb-3">
          Welcome to GreenFlag
        </h1>
        <p className="text-muted text-sm">Choose your path</p>
      </div>

      <div className="space-y-4 px-2">
        <button
          onClick={() => selectRole('host')}
          className="w-full h-48 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 relative overflow-hidden group active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <span className="text-2xl font-display text-[#EDEADE]">I Set the Standards</span>
            <span className="text-sm text-[#EDEADE]/60">Woman &mdash; You decide who earns your time</span>
          </div>
        </button>

        <button
          onClick={() => selectRole('guest')}
          className="w-full h-48 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 relative overflow-hidden group active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-8 h-8 text-white/80" />
            </div>
            <span className="text-2xl font-display text-[#EDEADE]">I Meet Standards</span>
            <span className="text-sm text-[#EDEADE]/60">Man &mdash; You show up through effort</span>
          </div>
        </button>
      </div>
    </div>
  );
}
