'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mic, Camera, Type as TypeIcon, ArrowLeft, Lock, ShieldCheck, Eye, MessageCircle, Sparkles } from 'lucide-react';
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
const TASK_META: { taskNumber: number; type: IntentionType; label: string; icon: typeof Mic }[] = [
  { taskNumber: 1, type: 'text', label: 'Thought', icon: TypeIcon },
  { taskNumber: 2, type: 'photo', label: 'Image', icon: Camera },
  { taskNumber: 3, type: 'voice', label: 'Voice', icon: Mic },
];

// Preset prompt suggestions per day/task, so she can tap a chip instead of
// writing from scratch. Keyed as `${dayNumber}-${taskNumber}`.
const PRESETS: Record<string, string[]> = {
  '1-1': ["What's something you're proud of?", 'Describe your perfect weekend', 'What made you smile today?'],
  '1-2': ['Share a photo of your smile', 'Show me your favorite outfit', 'A photo from your last trip'],
  '1-3': ['Tell me about your day', 'What\'s your favorite song and why?', 'Describe yourself in 30 seconds'],
  '2-1': ['What are you looking for in a partner?', 'Share a childhood memory', 'What\'s your love language?'],
  '2-2': ['Show me doing something you love', 'A photo with friends or family', 'Your favorite place in the city'],
  '2-3': ['What does a perfect date look like to you?', 'Tell me a fun fact about yourself', 'What are you passionate about?'],
  '3-1': ['Why should I give you a chance?', 'What makes you a green flag?', 'Describe your ideal relationship'],
  '3-2': ['A candid, unfiltered photo', 'Show me your hobby in action', "A photo that represents 'you'"],
  '3-3': ["Tell me why we'd be a good match", "What's a promise you'd make to a partner?", 'Say something that shows your personality'],
};

// Copy for the "locked" dialog shown after finishing a day, keyed by the
// step index just completed (0 = Day 1, 1 = Day 2). The last day has no
// dialog -- it activates the Standard and redirects straight to Discover.
const DAY_LOCK_DIALOGS: Record<number, { title: string; desc: string; button: string }> = {
  0: {
    title: 'Day 1 — Defined.',
    desc: "You know what you want. That's rare. Let's set Day 2.",
    button: 'Continue to Day 2',
  },
  1: {
    title: 'Day 2 — Defined.',
    desc: 'The bar is high. Finish Day 3 and your Standard goes live.',
    button: 'Final Day',
  },
};

const WHY_THIS_WORKS = [
  {
    icon: ShieldCheck,
    title: 'No Shortcuts',
    desc: 'He must complete all three intentions for a day before you see anything — no half-effort.',
  },
  {
    icon: Eye,
    title: 'You Decide, Daily',
    desc: 'You review and decide each day. Reject at any point and the connection ends — no second attempt on the same day.',
  },
  {
    icon: MessageCircle,
    title: 'Earned, Not Given',
    desc: "Complete all three days with your approval, and the conversation unlocks — he's earned it by then.",
  },
];

function StandardIntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="w-full animate-fade-in min-h-screen screen-gradient px-6 pt-12 pb-10 max-w-app mx-auto flex flex-col">
      <div className="flex-1">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6 shadow-[0_0_30px_-8px_rgba(192,38,211,0.6)]">
          <Sparkles className="w-7 h-7 text-gold" />
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">Set Your Standard</h1>
        <p className="text-ink/60 text-sm leading-relaxed mb-8">
          Each day: one thought, one image, one voice. He completes all three before you review.
        </p>

        <div className="space-y-4">
          {WHY_THIS_WORKS.map((point) => (
            <div key={point.title} className="flex gap-4 bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-4">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gold/10 flex items-center justify-center">
                <point.icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-ink font-semibold text-sm mb-1">{point.title}</h3>
                <p className="text-[#9DA0A6] text-xs leading-relaxed font-light">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="btn-primary w-full py-4 mt-6 font-semibold text-sm active:scale-95 transition-transform shadow-[0_0_30px_-10px_rgba(192,38,211,0.6)]"
      >
        Begin Day 1
      </button>
    </div>
  );
}

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
  const [step, setStep] = useState(0); // 0 = Day 1, 1 = Day 2, 2 = Day 3
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

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

  const currentSlot = slots[step];
  const currentDayFilled = currentSlot.tasks.every((t) => t.prompt.trim().length > 0);
  const isLastDay = step === slots.length - 1;

  const activateStandard = async () => {
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
      router.push('/discover');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (!currentDayFilled) {
      toast.error('Complete all 3 intentions for today to continue.');
      return;
    }
    if (isLastDay) {
      activateStandard();
      return;
    }
    if (DAY_LOCK_DIALOGS[step]) {
      setShowDayDialog(true);
      return;
    }
    setStep((s) => s + 1);
  };

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center screen-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (showIntro) {
    return <StandardIntroScreen onContinue={() => setShowIntro(false)} />;
  }

  const progressPercent = ((step + 1) / slots.length) * 100;

  return (
    <div className="min-h-screen screen-gradient px-6 pt-8 pb-24 max-w-app mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`text-ink/40 hover:text-ink transition-colors p-1 -ml-1 ${step === 0 ? 'invisible' : ''}`}
        >
          <ArrowLeft size={22} />
        </button>
        <span className="text-xs font-semibold text-ink/50">Day {step + 1} of {slots.length}</span>
        <div className="w-6" />
      </div>

      <div className="w-full bg-[#1C1C1E] h-1 rounded-full mb-6 overflow-hidden">
        <div className="bg-gold h-full transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
      </div>

      <h1 className="font-display text-2xl text-ink mb-2">Set Your Standard</h1>
      <p className="text-sm text-ink/50 mb-6">
        Each day: one thought, one image, one voice. He completes all three before you review.
      </p>

      <div className="card p-5 mb-8">
        <span className="text-xs text-ink/40 uppercase tracking-wide">Day {currentSlot.dayNumber}</span>

        <div className="space-y-5 mt-3">
          {currentSlot.tasks.map((task) => {
            const meta = TASK_META.find((m) => m.taskNumber === task.taskNumber)!;
            const Icon = meta.icon;
            const presets = PRESETS[`${currentSlot.dayNumber}-${task.taskNumber}`] || [];
            const isChipSelected = presets.includes(task.prompt);
            const customValue = isChipSelected ? '' : task.prompt;

            return (
              <div key={task.taskNumber}>
                <span className="flex items-center gap-1.5 text-xs font-medium text-ink/70 mb-2">
                  <Icon className="w-3.5 h-3.5 text-gold" />
                  {meta.label}
                </span>

                <div className="flex flex-wrap gap-2 mb-2">
                  {presets.map((preset) => {
                    const selected = task.prompt === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateTaskPrompt(currentSlot.dayNumber, task.taskNumber, preset)}
                        className={`px-3 py-2 rounded-xl text-xs text-left transition-all border ${
                          selected
                            ? 'bg-gold/10 border-gold text-white font-medium'
                            : 'bg-[#1C1C1E] border-[#2A2A2A] text-ink/70 hover:border-ink/30'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => updateTaskPrompt(currentSlot.dayNumber, task.taskNumber, e.target.value)}
                  placeholder="Or define your own..."
                  className="input w-full text-sm placeholder:text-xs"
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={saving || !currentDayFilled}
        className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isLastDay ? 'Activate My Standard' : `Continue to Day ${step + 2}`}
      </button>

      {showDayDialog && DAY_LOCK_DIALOGS[step] && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-xl font-display text-ink mb-2">{DAY_LOCK_DIALOGS[step].title}</h3>
            <p className="text-base text-ink/60 leading-relaxed mb-6 font-sans">
              {DAY_LOCK_DIALOGS[step].desc}
            </p>
            <button
              onClick={() => { setShowDayDialog(false); setStep((s) => s + 1); }}
              className="btn-primary w-full py-3"
            >
              {DAY_LOCK_DIALOGS[step].button}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
