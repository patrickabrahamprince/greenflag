'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { PageShell } from '@/components/layout/page-shell';
import { CoinBadge } from '@/components/shared/coin-badge';
import { IntentionList } from '@/components/standard/IntentionList';
import { BeginButton } from '@/components/standard/BeginButton';

interface WomanData {
  name: string;
  age: number | null;
  city: string | null;
  bio: string | null;
  photos: string[];
  why_me_prompts: string[];
  intentions: Array<{ id: string; day_number: number; type: string; prompt: string }>;
}

export default function StandardViewPage() {
  const router = useRouter();
  const params = useParams();
  const womanId = params.womanId as string;
  const [woman, setWoman] = useState<WomanData | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/standards/woman/${womanId}`);
      if (!res.ok) {
        router.push('/discover');
        return;
      }
      const data = await res.json();
      setWoman(data.woman);
      setCoinBalance(data.coinBalance ?? 0);
    } catch {
      router.push('/discover');
    } finally {
      setLoading(false);
    }
  }, [womanId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStarted = (connectionId: string) => {
    router.push(`/connection/${connectionId}`);
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C9A961]" />
        </div>
      </PageShell>
    );
  }

  if (!woman) return null;

  const photo = woman.photos?.[0];

  return (
    <PageShell>
      <Header title="" showBack rightElement={<CoinBadge />} />

      <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: photo ? `url(${photo})` : undefined,
            filter: 'blur(14px) brightness(0.7)',
            transform: 'scale(1.1)',
          }}
        />
        {!photo && <div className="absolute inset-0 bg-[#F0EDE9]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h1 className="text-2xl font-bold text-[#EDEADE]">
            {woman.name}{woman.age ? `, ${woman.age}` : ''}
          </h1>
          {woman.city && <p className="text-sm text-[#8E8E93]">{woman.city}</p>}
        </div>
      </div>

      {woman.bio && (
        <p className="text-sm text-ink/80 italic mb-6 px-1">"{woman.bio}"</p>
      )}

      <h2 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
        Her Standard — 8 Days
      </h2>
      <IntentionList intentions={woman.intentions} />

      {woman.why_me_prompts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
            Your Pitch
          </h2>
          <div className="space-y-2">
            {woman.why_me_prompts.map((prompt, i) => (
              <div key={i} className="bg-[#1C1C1E] rounded-xl p-4">
                <p className="text-sm text-[#EDEADE]">{prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pb-4">
        <BeginButton
          womanId={womanId}
          coinBalance={coinBalance}
          onStarted={handleStarted}
        />
      </div>
    </PageShell>
  );
}
