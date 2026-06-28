'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { StandardDaySlot, type Intention, type IntentionType } from '@/components/host/StandardDaySlot';
import { IntentionEditor } from '@/components/host/IntentionEditor';

const DEFAULTS: Intention[] = [
  { dayNumber: 1, type: 'voice', prompt: 'Tell me 3 books that changed you' },
  { dayNumber: 2, type: 'photo', prompt: 'Show me your workspace' },
  { dayNumber: 3, type: 'text', prompt: 'Plan our ideal first date' },
];

export default function StandardBuilderPage() {
  const router = useRouter();
  const [intentions, setIntentions] = useState<Intention[]>(DEFAULTS);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const loadStandard = useCallback(async () => {
    try {
      const res = await fetch('/api/standards/standard-builder');
      const data = await res.json();
      if (data.redirect) {
        router.replace('/connections');
        return;
      }
      if (data.standardId && data.intentions?.length === 3) {
        setIntentions(
          data.intentions.map((i: { day_number: number; type: IntentionType; prompt: string }) => ({
            dayNumber: i.day_number,
            type: i.type,
            prompt: i.prompt,
          }))
        );
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadStandard();
  }, [loadStandard]);

  const activeEdit = editingDay !== null ? intentions.find((i) => i.dayNumber === editingDay) : null;

  const handleTypeChange = (type: IntentionType) => {
    if (editingDay === null) return;
    setIntentions((prev) =>
      prev.map((i) => (i.dayNumber === editingDay ? { ...i, type } : i))
    );
  };

  const handlePromptChange = (prompt: string) => {
    if (editingDay === null) return;
    setIntentions((prev) =>
      prev.map((i) => (i.dayNumber === editingDay ? { ...i, prompt } : i))
    );
  };

  const allFilled = intentions.every((i) => i.prompt.trim().length > 0);

  const handleSetActive = async () => {
    if (!allFilled) return;
    setActivating(true);
    try {
      const res = await fetch('/api/standards/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentions }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setShowSuccessPopup(true);
    } catch {
      toast.error('Failed to activate standard');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <div className="px-4 py-4">
        <button onClick={() => router.back()} className="text-[#8E8E93] mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-xl font-semibold text-[#EDEADE] mb-1">Build Your Standard</h1>
        <p className="text-xs text-[#8E8E93] mb-6">3 days. 3 intentions. Let him prove it.</p>

        <div className="space-y-3 mb-8">
          {intentions.map((intention) => (
            <StandardDaySlot
              key={intention.dayNumber}
              intention={intention}
              onEdit={() => setEditingDay(intention.dayNumber)}
            />
          ))}
        </div>

        <button
          onClick={handleSetActive}
          disabled={!allFilled || activating}
          className="w-full h-12 rounded-xl bg-[#C9A961] text-black text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          {activating ? 'Activating...' : 'Set Active'}
        </button>
      </div>

      {activeEdit && (
        <IntentionEditor
          dayNumber={activeEdit.dayNumber}
          type={activeEdit.type}
          prompt={activeEdit.prompt}
          onTypeChange={handleTypeChange}
          onPromptChange={handlePromptChange}
          onClose={() => setEditingDay(null)}
        />
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center animate-scale-in" style={{ background: '#1C1C1E', border: '1px solid #2C2C2E' }}>
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl text-green-500 font-bold">✓</span>
            </div>
            <h4 className="text-white font-display text-lg mb-2">Standard Activated!</h4>
            <p className="text-[#8E8E93] text-xs font-thin mb-6 leading-relaxed">
              Your 3-day standard is live. Men will now have to prove themselves by completing these intentions to connect with you.
            </p>
            <button
              onClick={() => router.push('/connections')}
              className="btn-primary w-full py-2.5 text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
