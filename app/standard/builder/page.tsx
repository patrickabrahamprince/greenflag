'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mic, Camera, Type as TypeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';

type IntentionType = 'text' | 'photo' | 'voice';

interface DayTask {
  taskNumber: number;
  type: IntentionType;
  prompt: string;
}

interface DaySlot {
  dayNumber: number;
  tasks: DayTask[];
}

// Fixed composition every day: one text, one photo, one voice task.
const TASK_META: { taskNumber: number; type: IntentionType; label: string; icon: typeof Mic; placeholder: string }[] = [
  { taskNumber: 1, type: 'text', label: 'Text', icon: TypeIcon, placeholder: 'What do you want him to write about?' },
  { taskNumber: 2, type: 'photo', label: 'Photo', icon: Camera, placeholder: 'What photo should he share?' },
  { taskNumber: 3, type: 'voice', label: 'Voice', icon: Mic, placeholder: 'What should he tell you in a voice note?' },
];

function defaultSlots(): DaySlot[] {
  return [1, 2, 3].map((dayNumber) => ({
    dayNumber,
    tasks: TASK_META.map((m) => ({ taskNumber: m.taskNumber, type: m.type, prompt: '' })),
  }));
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
          type SavedIntention = { day_number: number; task_number: number; type: IntentionType; prompt: string };
          const byDayTask = new Map(
            (data.intentions as SavedIntention[]).map((i) => [`${i.day_number}-${i.task_number}`, i])
          );
          setSlots(
            [1, 2, 3].map((dayNumber) => ({
              dayNumber,
              tasks: TASK_META.map((m) => {
                const existing = byDayTask.get(`${dayNumber}-${m.taskNumber}`);
                return { taskNumber: m.taskNumber, type: m.type, prompt: existing?.prompt ?? '' };
              }),
            }))
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

  const updateTaskPrompt = (dayNumber: number, taskNumber: number, value: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayNumber !== dayNumber
          ? s
          : { ...s, tasks: s.tasks.map((t) => (t.taskNumber === taskNumber ? { ...t, prompt: value } : t)) }
      )
    );
  };

  const allFilled = slots.every((s) => s.tasks.every((t) => t.prompt.trim().length >= 10));

  const handleSave = async () => {
    if (!allFilled) {
      toast.error('Write at least 10 characters for each task before saving.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/standards/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentions: slots.flatMap((s) =>
            s.tasks.map((t) => ({ dayNumber: s.dayNumber, taskNumber: t.taskNumber, prompt: t.prompt.trim() }))
          ),
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
        <Loader2 className="w-8 h-8 animate-spin text-[#C026D3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen screen-gradient px-6 pt-8 pb-24 max-w-app mx-auto">
      <h1 className="font-display text-2xl text-ink mb-2">Set Your Standard</h1>
      <p className="text-sm text-ink/50 mb-6">
        Each day has 3 tasks -- a text, a photo, and a voice note. Men complete all 3 for the day before you review and the next day unlocks.
      </p>

      <div className="space-y-6 mb-8">
        {slots.map((slot) => (
          <div key={slot.dayNumber} className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-5 shadow-sm">
            <span className="text-xs text-ink/40 uppercase tracking-wide">Day {slot.dayNumber}</span>

            <div className="space-y-4 mt-3">
              {slot.tasks.map((task) => {
                const meta = TASK_META.find((m) => m.taskNumber === task.taskNumber)!;
                const Icon = meta.icon;
                return (
                  <div key={task.taskNumber}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-ink/70">
                        <Icon className="w-3.5 h-3.5 text-[#C026D3]" />
                        {meta.label}
                      </span>
                      <span className="text-xs text-ink/40">{task.prompt.length}/140</span>
                    </div>
                    <textarea
                      value={task.prompt}
                      onChange={(e) => updateTaskPrompt(slot.dayNumber, task.taskNumber, e.target.value)}
                      placeholder={meta.placeholder}
                      maxLength={140}
                      rows={2}
                      className="input w-full resize-none"
                    />
                  </div>
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

      {allFilled && (
        <button
          onClick={() => router.push('/discover')}
          className="btn-secondary w-full py-3.5 mt-3"
        >
          Explore New
        </button>
      )}
    </div>
  );
}
