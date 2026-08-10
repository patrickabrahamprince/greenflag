'use client';

import { useEffect, useState } from 'react';
import { Mic, Camera, Type as TypeIcon, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type IntentionType = 'text' | 'photo' | 'voice';

interface Intention {
  day_number: number;
  task_number: number;
  type: IntentionType;
  prompt: string;
}

const TYPE_META: Record<IntentionType, { label: string; icon: typeof Mic }> = {
  text: { label: 'Thought', icon: TypeIcon },
  photo: { label: 'Image', icon: Camera },
  voice: { label: 'Voice', icon: Mic },
};

export function MyStandardsSection({ userId }: { userId: string }) {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: standard } = await supabase
        .from('standards')
        .select('id, is_active')
        .eq('woman_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!standard) {
        setLoading(false);
        return;
      }
      setIsActive(!!standard.is_active);

      const { data: rows } = await supabase
        .from('intentions')
        .select('day_number, task_number, type, prompt')
        .eq('standard_id', standard.id)
        .order('day_number')
        .order('task_number');

      setIntentions((rows as Intention[]) || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="px-4 mt-6 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gold" />
      </div>
    );
  }

  if (intentions.length === 0) return null;

  const days = [1, 2, 3].map((dayNumber) => ({
    dayNumber,
    tasks: intentions.filter((i) => i.day_number === dayNumber),
  })).filter((d) => d.tasks.length > 0);

  return (
    <div className="px-4 mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <h3 className="font-display text-lg text-white">Your Standard</h3>
        </div>
        <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full ${isActive ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {isActive ? 'Live' : 'Draft'}
        </span>
      </div>

      <div className="space-y-3">
        {days.map(({ dayNumber, tasks }) => (
          <div
            key={dayNumber}
            className="rounded-2xl p-4 border border-gold/20"
            style={{ background: 'linear-gradient(135deg, rgba(210,4,45,0.08) 0%, rgba(26,26,26,0.9) 60%)' }}
          >
            <span className="text-xs text-gold/80 uppercase tracking-widest font-semibold">Day {dayNumber}</span>
            <div className="space-y-2.5 mt-2.5">
              {tasks.map((task) => {
                const meta = TYPE_META[task.type];
                const Icon = meta.icon;
                return (
                  <div key={task.task_number} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3 h-3 text-gold" />
                    </div>
                    <p className="text-sm text-ink/80 leading-snug">{task.prompt}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
