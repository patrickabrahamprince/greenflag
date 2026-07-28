'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';

const ANALYZE_DURATION_MS = 1600;
const MIN_CHARS = 15;

// Deterministic (picked from the text itself, not Math.random) so the same
// bio always gets the same closer rather than flip-flopping on re-analyze.
const CLOSERS = [
  'Always up for a good conversation.',
  "Let's see where this goes.",
  'Ask me about it sometime.',
];

interface BioAiPolishProps {
  bio: string;
  onApply: (v: string) => void;
}

function polishText(raw: string): string {
  const original = raw.trim();
  if (!original) return original;

  let out = original.replace(/\s+/g, ' ');
  out = out.replace(/\bi\b/g, 'I');
  out = out.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
  if (!/[.!?]$/.test(out)) out = `${out}.`;

  // The mimic must always produce a visible change -- if formatting alone
  // didn't move the needle (already clean, capitalized, punctuated), add a
  // closing line so "Improve with AI" never looks like it did nothing.
  if (out === original) {
    out = `${out} ${CLOSERS[original.length % CLOSERS.length]}`;
  }

  return out;
}

function buildTips(raw: string): string[] {
  const trimmed = raw.trim();
  const tips: string[] = [];

  if (trimmed.length < MIN_CHARS) {
    tips.push(`Add a bit more — aim for at least ${MIN_CHARS} characters so she gets a real sense of you.`);
  }
  if (!/[.!?]$/.test(trimmed)) {
    tips.push('End with punctuation for a more finished feel.');
  }
  if (!/\b(i|my|me)\b/i.test(trimmed)) {
    tips.push('Make it personal — talk about what you actually love doing.');
  }
  if (tips.length === 0) {
    tips.push('This reads well — clear, personal, and specific.');
  }
  return tips.slice(0, 3);
}

export function BioAiPolish({ bio, onApply }: BioAiPolishProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ tips: string[]; polished: string } | null>(null);

  const handleAnalyze = () => {
    if (!bio.trim() || analyzing) return;
    const snapshot = bio;
    setAnalyzing(true);
    setResult(null);
    // Mimic only -- no LLM call. A short, deterministic pass (capitalization
    // + punctuation cleanup, with a guaranteed fallback rewrite) plus a few
    // rule-based tips, wrapped in a fake "thinking" delay so it reads as an
    // AI pass rather than instant regex.
    setTimeout(() => {
      setResult({ tips: buildTips(snapshot), polished: polishText(snapshot) });
      setAnalyzing(false);
    }, ANALYZE_DURATION_MS);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!bio.trim() || analyzing}
        className="flex items-center gap-1.5 text-xs font-medium text-gold hover:text-gold-light transition-colors disabled:opacity-40 disabled:hover:text-gold"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Analyzing your bio...
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            Improve with AI
          </>
        )}
      </button>

      {result && (
        <div className="mt-2 bg-gold/5 border border-gold/20 rounded-xl p-3 space-y-2">
          <ul className="space-y-1">
            {result.tips.map((tip) => (
              <li key={tip} className="text-xs text-ink/70 leading-relaxed flex gap-1.5">
                <Sparkles className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
          <div className="bg-black/20 border border-white/10 rounded-lg p-2.5">
            <p className="text-xs text-ink/80 leading-relaxed italic">{result.polished}</p>
          </div>
          <button
            type="button"
            onClick={() => { onApply(result.polished); setResult(null); }}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Use this version
          </button>
        </div>
      )}
    </div>
  );
}
