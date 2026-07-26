'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mic, Camera, Type as TypeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';

type IntentionType = 'voice' | 'photo' | 'text';

interface DaySlot {
  dayNumber: number;
  type: IntentionType;
  prompt: string;
}

const TYPE_OPTIONS: { value: IntentionType; label: string; icon: typeof Mic }[] = [
  { value: 'voice', label: 'Voice', icon: Mic },
  { value: 'photo', label: 'Photo', icon: Camera },
  { value: 'text', label: 'Text', icon: TypeIcon },
];

function defaultSlots(): DaySlot[] {
  return [1, 2, 3].map((dayNumber) => ({ dayNumber, type: 'text', prompt: '' }));
}

export default function StandardBuilderPage() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<DaySlot[]>(defaultSlots());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.persona !== 'woman') {
      router.replace('/discover');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/api/standards/standard-builder');
        if (res.status === 401) {
          router.replace('/login');
          return;
        }
        const data = await res.json();

        if (data.redirect) {
          router.replace(data.redirect);
          return;
        }

        if (Array.isArray(data.intentions) && data.intentions.length > 0) {
          const byDay = new Map(data.intentions.map((i: { day_number: number; type: IntentionType; prompt: string }) => [i.day_number, i]));
          setSlots(
            [1, 2, 3].map((dayNumber) => {
              const existing = byDay.get(dayNumber) as { type: IntentionType; prompt: string } | undefined;
              return {
                dayNumber,
                type: existing?.type ?? 'text',
                prompt: existing?.prompt ?? '',
              };
            })
          );
        }
      } catch {
        toast.error('Failed to load your Standard.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser, router]);

  const updateSlot = (dayNumber: number, field: 'type' | 'prompt', value: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.dayNumber === dayNumber ? { ...s, [field]: value } : s))
    );
  };

  const allFilled = slots.every((s) => s.prompt.trim().length > 0);

  const handleSave = async () => {
    if (!allFilled) {
      toast.error('Write a prompt for all 3 days before saving.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/standards/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentions: slots.map((s) => ({ dayNumber: s.dayNumber, type: s.type, prompt: s.prompt.trim() })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save your Standard.');
        return;
      }

      toast.success('Your Standard is live!');
      router.push('/my-connections');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center screen-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen screen-gradient px-6 pt-8 pb-24 max-w-app mx-auto">
      <h1 className="font-display text-2xl text-ink mb-2">Set Your Standard</h1>
      <p className="text-sm text-ink/50 mb-6">
        Write one prompt for each of the first 3 days. Men will complete these, one day at a time, before you review and unlock chat.
      </p>

      <div className="space-y-4 mb-8">
        {slots.map((slot) => (
          <div key={slot.dayNumber} className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ink/40 uppercase tracking-wide">Day {slot.dayNumber}</span>
              <span className="text-xs text-ink/40">{slot.prompt.length}/140</span>
            </div>

            <textarea
              value={slot.prompt}
              onChange={(e) => updateSlot(slot.dayNumber, 'prompt', e.target.value)}
              placeholder="What do you want him to do or share today?"
              maxLength={140}
              rows={3}
              className="input w-full resize-none mb-3"
            />

            <div className="flex gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = slot.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateSlot(slot.dayNumber, 'type', opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-all ${
                      active ? 'bg-[#D4AF37] text-white' : 'bg-[#1C1C1E] text-ink/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !allFilled}
        className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Go Live'}
      </button>
    </div>
  );
}
