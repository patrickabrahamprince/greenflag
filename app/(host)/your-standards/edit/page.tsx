'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Intention } from '@/types';

type Difficulty = 'easy' | 'medium' | 'hard';

interface IntentionForm {
  day: number;
  description: string;
  type: 'photo' | 'voice' | 'text' | 'location';
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Simple daily check-ins' },
  { value: 'medium', label: 'Medium', desc: 'Thoughtful responses' },
  { value: 'hard', label: 'Hard', desc: 'Deep, meaningful effort' },
];

const TYPE_OPTIONS = [
  { value: 'photo', label: 'Photo' },
  { value: 'voice', label: 'Voice' },
  { value: 'text', label: 'Text' },
  { value: 'location', label: 'Location' },
];

const MOCK_STANDARD = {
  name: 'The Gold Standard',
  difficulty: 'medium' as Difficulty,
  is_active: true,
  applicant_count: 2,
};

const MOCK_INTENTIONS: IntentionForm[] = [
  { day: 1, description: 'Share a photo of your favorite book', type: 'photo' },
  { day: 2, description: 'Record a voice note about your morning routine', type: 'voice' },
  { day: 3, description: 'Tell me about a place you love', type: 'text' },
  { day: 4, description: 'Share your current location for the day', type: 'location' },
  { day: 5, description: 'What does adventure mean to you?', type: 'text' },
  { day: 6, description: 'Send a photo of something that made you smile', type: 'photo' },
  { day: 7, description: 'Voice note: describe your perfect weekend', type: 'voice' },
  { day: 8, description: 'Share a location that means something to you', type: 'location' },
];

export default function EditStandardPage() {
  const router = useRouter();
  const [name, setName] = useState(MOCK_STANDARD.name);
  const [difficulty, setDifficulty] = useState<Difficulty>(MOCK_STANDARD.difficulty);
  const [intentions, setIntentions] = useState<IntentionForm[]>(MOCK_INTENTIONS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const hasApplicants = MOCK_STANDARD.applicant_count > 0;
  const isPaused = !MOCK_STANDARD.is_active;

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
    if (hasApplicants && !isPaused) {
      toast.error('Pause your standard to make edits');
      return;
    }
    if (!validate()) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Standard updated successfully!');
    router.push('/your-standards');
  }

  async function handlePause() {
    toast.success(isPaused ? 'Standard resumed' : 'Standard paused');
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
        Edit Your Standard
      </h1>

      {hasApplicants && (
        <div className="card border-gold/30 bg-gold/5 mb-6">
          <p className="text-sm text-gold">
            You have {MOCK_STANDARD.applicant_count} applicant(s).
            Pause your standard to make edits.
          </p>
          <button
            onClick={handlePause}
            className="mt-3 btn-secondary flex items-center gap-2 text-sm"
          >
            <Pause className="w-4 h-4" />
            {isPaused ? 'Resume Standard' : 'Pause Standard'}
          </button>
        </div>
      )}

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
            className={cn('input', errors.name && 'input-error')}
            maxLength={60}
            disabled={hasApplicants && !isPaused}
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
                onClick={() => !hasApplicants && setDifficulty(d.value)}
                className={cn(
                  'card text-center transition-all duration-400 ease-out',
                  difficulty === d.value
                    ? 'border-gold bg-gold/5'
                    : 'hover:border-gold/30',
                  hasApplicants && !isPaused && 'opacity-50 cursor-not-allowed'
                )}
                disabled={hasApplicants && !isPaused}
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
                  className={cn(
                    'input min-h-[80px] resize-none mb-3',
                    errors[`intention_${intention.day}`] && 'input-error'
                  )}
                  maxLength={140}
                  disabled={hasApplicants && !isPaused}
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
                      disabled={hasApplicants && !isPaused}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-400 ease-out',
                        intention.type === opt.value
                          ? 'bg-gold text-black'
                          : 'bg-surface-light text-muted hover:text-white',
                        hasApplicants && !isPaused && 'opacity-50 cursor-not-allowed'
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

        <div className="flex gap-3">
          <button
            onClick={handlePause}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Pause className="w-4 h-4" />
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
