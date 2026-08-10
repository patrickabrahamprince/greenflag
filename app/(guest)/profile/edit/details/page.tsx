'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Music, Quote, Plus, Loader2, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { hapticTap } from '@/lib/haptics';
import {
  LIFESTYLE_OPTIONS, BASICS_OPTIONS, LIFESTYLE_LABELS, BASICS_LABELS,
  LIFESTYLE_ICONS, BASICS_ICONS, TEASER_PROMPTS,
  type LifestyleField, type BasicsField,
} from '@/lib/constants/profileDetails';

type DetailField = LifestyleField | BasicsField;

// Unlike the moderated name/age/city/bio/photos flow (profile_edit_requests
// -- see /profile/edit), these fields are low-stakes metadata, not identity
// claims, so they save instantly on selection, same as interests during
// onboarding -- no review queue, no separate "unsaved changes" state.
export default function ProfileDetailsEditPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const supabase = createClient();

  const [openField, setOpenField] = useState<DetailField | null>(null);
  const [saving, setSaving] = useState<DetailField | null>(null);
  const [anthemTitle, setAnthemTitle] = useState(user?.anthem_title ?? '');
  const [anthemArtist, setAnthemArtist] = useState(user?.anthem_artist ?? '');
  const [savingAnthem, setSavingAnthem] = useState(false);
  const [prompt, setPrompt] = useState(user?.teaser_prompt ?? '');
  const [promptAnswer, setPromptAnswer] = useState(user?.teaser_answer ?? '');
  const [promptPickerOpen, setPromptPickerOpen] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);

  const saveField = async (field: DetailField, value: string) => {
    if (!user) return;
    setSaving(field);
    setOpenField(null);
    const prevUser = user;
    setUser({ ...user, [field]: value });
    hapticTap();

    const update: Partial<Record<DetailField, string>> = { [field]: value };
    const { error } = await supabase.from('profiles').update(update).eq('id', user.id);
    if (error) {
      setUser(prevUser);
      toast.error('Failed to save. Please try again.');
    }
    setSaving(null);
  };

  const saveAnthem = async () => {
    if (!user) return;
    setSavingAnthem(true);
    const { error } = await supabase
      .from('profiles')
      .update({ anthem_title: anthemTitle.trim() || null, anthem_artist: anthemArtist.trim() || null })
      .eq('id', user.id);
    setSavingAnthem(false);
    if (error) {
      toast.error('Failed to save anthem');
      return;
    }
    setUser({ ...user, anthem_title: anthemTitle.trim() || null, anthem_artist: anthemArtist.trim() || null });
    toast.success('Anthem saved');
  };

  const savePrompt = async () => {
    if (!user) return;
    setSavingPrompt(true);
    const { error } = await supabase
      .from('profiles')
      .update({ teaser_prompt: prompt.trim() || null, teaser_answer: promptAnswer.trim() || null })
      .eq('id', user.id);
    setSavingPrompt(false);
    if (error) {
      toast.error('Failed to save prompt');
      return;
    }
    setUser({ ...user, teaser_prompt: prompt.trim() || null, teaser_answer: promptAnswer.trim() || null });
    toast.success('Prompt saved');
  };

  const renderRow = (
    field: DetailField,
    label: string,
    Icon: LucideIcon,
    value: string | null | undefined
  ) => (
    <button
      key={field}
      onClick={() => setOpenField(field)}
      className="w-full flex items-center gap-4 py-4 border-b border-white/5 text-left active:opacity-70 transition-opacity"
    >
      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink/50">{label}</p>
        <p className="text-base text-ink font-medium">{value || 'Add'}</p>
      </div>
      {saving === field && <Loader2 size={16} className="animate-spin text-ink/50 shrink-0" />}
    </button>
  );

  const openOptions = openField
    ? (openField in LIFESTYLE_OPTIONS ? LIFESTYLE_OPTIONS[openField as LifestyleField] : BASICS_OPTIONS[openField as BasicsField])
    : [];
  const openValue = openField ? (user?.[openField] as string | null | undefined) : null;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <button onClick={() => router.back()} aria-label="Back" className="p-2 -ml-2 text-ink active:opacity-60 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-display flex-1">More About You</h1>
      </div>

      <div className="px-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 mt-4 mb-1">My Prompt</h2>
        <button
          type="button"
          onClick={() => setPromptPickerOpen(true)}
          className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left active:scale-[0.98] transition-transform mt-2"
        >
          <span className="text-ink font-medium">{prompt || 'Select a prompt'}</span>
          <Plus size={18} className="text-ink/50" />
        </button>
        {prompt && (
          <textarea
            value={promptAnswer}
            onChange={(e) => setPromptAnswer(e.target.value)}
            placeholder="Your answer..."
            maxLength={120}
            rows={3}
            className="input resize-none mt-3"
          />
        )}
        <button
          onClick={savePrompt}
          disabled={savingPrompt || !prompt || !promptAnswer.trim()}
          className="btn-secondary w-full mt-3 mb-8 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {savingPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Prompt'}
        </button>

        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 mt-4 mb-1">Lifestyle</h2>
        {(Object.keys(LIFESTYLE_OPTIONS) as LifestyleField[]).map((field) =>
          renderRow(field, LIFESTYLE_LABELS[field], LIFESTYLE_ICONS[field], user?.[field] as string | null)
        )}

        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 mt-6 mb-1">Basics</h2>
        {(Object.keys(BASICS_OPTIONS) as BasicsField[]).map((field) =>
          renderRow(field, BASICS_LABELS[field], BASICS_ICONS[field], user?.[field] as string | null)
        )}

        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 mt-6 mb-1">My Anthem</h2>
        <div className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
            <Music size={18} className="text-gold" />
          </div>
          <div className="flex-1 space-y-2">
            <input
              className="input"
              placeholder="Song title"
              value={anthemTitle}
              onChange={(e) => setAnthemTitle(e.target.value)}
              maxLength={100}
            />
            <input
              className="input"
              placeholder="Artist"
              value={anthemArtist}
              onChange={(e) => setAnthemArtist(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>
        <button
          onClick={saveAnthem}
          disabled={savingAnthem}
          className="btn-secondary w-full mb-8 flex items-center justify-center gap-2"
        >
          {savingAnthem ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Anthem'}
        </button>
      </div>

      <BottomSheet open={!!openField} onClose={() => setOpenField(null)}>
        <h2 className="font-display text-xl text-ink mb-4">
          {openField && (openField in LIFESTYLE_OPTIONS ? LIFESTYLE_LABELS[openField as LifestyleField] : BASICS_LABELS[openField as BasicsField])}
        </h2>
        <div className="space-y-2 pb-6">
          {openOptions.map((option) => (
            <button
              key={option}
              onClick={() => openField && saveField(openField, option)}
              className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-left text-ink/90 text-sm hover:border-gold/50 active:scale-[0.98] transition-all"
            >
              {option}
              {openValue === option && <Check size={16} className="text-gold shrink-0" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={promptPickerOpen} onClose={() => setPromptPickerOpen(false)}>
        <h2 className="font-display text-xl text-ink mb-4">Pick a prompt</h2>
        <div className="space-y-2 pb-6">
          {TEASER_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => { setPrompt(p); setPromptPickerOpen(false); }}
              className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-left text-ink/90 text-sm hover:border-gold/50 active:scale-[0.98] transition-all"
            >
              <Quote size={14} className="text-gold shrink-0" />
              {p}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
