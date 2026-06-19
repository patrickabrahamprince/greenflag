'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Image, Type } from 'lucide-react';
import toast from 'react-hot-toast';

interface Standard {
  title: string;
  prompt: string;
  type: 'text' | 'image';
}

const DEFAULTS: Standard[] = [
  { title: 'Financial Mindset', prompt: 'Describe your view on wealth building', type: 'text' },
  { title: 'Life Vision', prompt: 'Where do you see yourself in 5 years?', type: 'text' },
  { title: 'Emotional Intelligence', prompt: 'How do you handle conflict in relationships?', type: 'text' },
  { title: 'Daily Rituals', prompt: 'Describe your ideal morning routine', type: 'text' },
  { title: 'Adventure Style', prompt: 'Share a photo from your favorite adventure', type: 'image' },
  { title: 'Personal Growth', prompt: 'What is a skill you are currently developing?', type: 'text' },
  { title: 'Connection Values', prompt: 'What matters most to you in a partnership?', type: 'text' },
  { title: 'Final Note', prompt: 'Share a photo that represents who you are', type: 'image' },
];

export default function YourStandardsPage() {
  const router = useRouter();
  const [standards, setStandards] = useState<Standard[]>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/standards');
        const data = await res.json();
        if (data.standards?.length === 8) setStandards(data.standards);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStandard = (idx: number, field: keyof Standard, value: string) => {
    setStandards((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const toggleType = (idx: number) => {
    setStandards((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], type: next[idx].type === 'text' ? 'image' : 'text' };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/standards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standards }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      toast.success('Standards saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <div className="px-4 py-4">
        <button onClick={() => router.back()} className="text-[#8E8E93] mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-display text-[#EDEADE]">Your Standards</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-lg bg-[#D4AF37] text-black text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <p className="text-xs text-[#8E8E93] mb-6">
          These 8 tasks will be shown to guests who apply to meet you. Customize them below.
        </p>

        <div className="space-y-4">
          {standards.map((s, idx) => (
            <div key={idx} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#D4AF37]">Task {idx + 1}/8</span>
                <button
                  onClick={() => toggleType(idx)}
                  className="flex items-center gap-1 text-xs text-[#8E8E93] hover:text-[#EDEADE] transition-colors"
                >
                  {s.type === 'text' ? <Type className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                  {s.type === 'text' ? 'Text' : 'Image'}
                </button>
              </div>
              <input
                className="input text-sm mb-2"
                placeholder="Task title"
                value={s.title}
                onChange={(e) => updateStandard(idx, 'title', e.target.value)}
              />
              <textarea
                className="input min-h-[60px] resize-none text-sm"
                placeholder="What should they share?"
                value={s.prompt}
                onChange={(e) => updateStandard(idx, 'prompt', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
