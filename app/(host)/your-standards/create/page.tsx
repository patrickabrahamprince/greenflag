'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Intention } from '@/types';

type Difficulty = 'easy' | 'medium' | 'hard';

interface IntentionForm {
  day: number;
  description: string;
  type: 'photo' | 'voice' | 'text' | 'location';
}

const DEFAULT_INTENTIONS: IntentionForm[] = Array.from({ length: 8 }, (_, i) => ({
  day: i + 1,
  description: '',
  type: 'text' as const,
}));

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Simple daily check-ins' },
  { value: 'medium', label: 'Medium', desc: 'Thoughtful responses' },
  { value: 'hard', label: 'Hard', desc: 'Deep, meaningful effort' },
];

const TYPE_OPTIONS = [
  { value: 'photo', label: 'Photo', icon: '📷' },
  { value: 'voice', label: 'Voice', icon: '🎤' },
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'location', label: 'Location', icon: '📍' },
];

export default function CreateStandardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [intentions, setIntentions] = useState<IntentionForm[]>(DEFAULT_INTENTIONS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function updateIntention(day: number, field: 'description' | 'type', value: string) {
    setIntentions((prev) =>
      prev.map((i) => (i.day === day ? { ...i, [field]: value } : i))
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`intention_${day}`];
      return next;
    });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Standard name is required';
    }

    if (!difficulty) {
      newErrors.difficulty = 'Select a difficulty';
    }

    intentions.forEach((intention) => {
      if (!intention.description.trim()) {
        newErrors[`intention_${intention.day}`] = 'Description is required';
      } else if (intention.description.length > 140) {
        newErrors[`intention_${intention.day}`] = 'Max 140 characters';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);

    // Mock save
    await new Promise((r) => setTimeout(r, 1000));

    toast.success('Standard created successfully!');
    router.push('/your-standards');
  }

  return (
    <div className="animate-fade-in py-6">
      <button
        onClick={() => router.push('/your-standards')}
        className="btn-ghost flex items-center gap-2 text-muted hover:text-white -ml-2 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <h1 className="font-display text-3xl text-white font-semibold mb-8">
        Create Your Standard
      </h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Standard Name
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.name;
                return next;
              });
            }}
            placeholder="e.g., The Gold Standard"
            className={cn('input', errors.name && 'input-error')}
            maxLength={60}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-3">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={cn(
                  'card text-center transition-all duration-400 ease-out',
                  difficulty === d.value
                    ? 'border-gold bg-gold/5'
                    : 'hover:border-gold/30'
                )}
              >
                <p className="font-medium text-white text-sm">{d.label}</p>
                <p className="text-xs text-muted mt-1">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-3">
            Intentions
          </label>
          <p className="text-xs text-muted mb-4">
            Set 8 intentions for guests to complete
          </p>

          <div className="space-y-4">
            {intentions.map((intention) => (
              <div key={intention.day} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gold">
                    Day {intention.day}
                  </span>
                  <span className="text-xs text-muted">
                    {intention.description.length}/140
                  </span>
                </div>
                <textarea
                  value={intention.description}
                  onChange={(e) =>
                    updateIntention(intention.day, 'description', e.target.value)
                  }
                  placeholder="Describe what the guest needs to do..."
                  className={cn(
                    'input min-h-[80px] resize-none mb-3',
                    errors[`intention_${intention.day}`] && 'input-error'
                  )}
                  maxLength={140}
                />
                {errors[`intention_${intention.day}`] && (
                  <p className="text-red-500 text-xs mb-2">
                    {errors[`intention_${intention.day}`]}
                  </p>
                )}
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        updateIntention(
                          intention.day,
                          'type',
                          opt.value as Intention['type']
                        )
                      }
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-400 ease-out',
                        intention.type === opt.value
                          ? 'bg-gold text-black'
                          : 'bg-surface-light text-muted hover:text-white'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary flex items-center justify-center gap-2 text-lg"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            'Save Standard'
          )}
        </button>
      </div>
    </div>
  );
}
