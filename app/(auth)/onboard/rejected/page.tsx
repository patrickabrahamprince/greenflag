'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, LogOut, RotateCcw, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function RejectedApplicationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('approval_reason')
        .eq('id', user.id)
        .single();
      setReason((profile as { approval_reason?: string })?.approval_reason ?? null);
      setLoading(false);
    };
    fetchProfile();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      const res = await fetch('/api/onboarding/restart', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to restart');
        setRestarting(false);
        return;
      }
      router.push('/onboard');
    } catch {
      toast.error('Failed to restart');
      setRestarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col justify-center items-center px-8 text-center bg-[#000000]">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleSignOut}
          className="text-xs text-ink/40 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sign Out
        </button>
      </div>

      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
        <XCircle className="w-8 h-8 text-red-400" />
      </div>

      <h1 className="font-display text-3xl text-ink mb-3">
        Not Approved This Time
      </h1>

      {reason && (
        <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-4 max-w-sm mb-6 text-left">
          <p className="text-ink/40 text-xs uppercase tracking-wide mb-1">Feedback</p>
          <p className="text-ink/80 text-sm leading-relaxed">{reason}</p>
        </div>
      )}

      <p className="text-ink/60 text-sm leading-relaxed max-w-sm mb-8">
        Refine your profile and resubmit. This will reset your previous submission.
      </p>

      <button
        onClick={handleRestart}
        disabled={restarting}
        className="btn-primary flex items-center gap-2 px-6"
      >
        {restarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        Update & Resubmit
      </button>
    </div>
  );
}
