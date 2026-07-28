'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';

const ANALYZE_DURATION_MS = 1600;
const MIN_WORDS = 15;

interface BioAiPolishProps {
  bio: string;
  onApply: (v: string) => void;
}

function polishText(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed) return trimmed;
  const withCapitals = trimmed.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
  return /[.!?]$/.test(withCapitals) ? withCapitals : `${withCapitals}.`;
}

function buildTips(raw: string): string[] {
  const trimmed = raw.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const tips: string[] = [];

  if (wordCount < MIN_WORDS) {
    tips.push(`Add a bit more — aim for at least ${MIN_WORDS} words so she gets a real sense of you.`);
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
    setAnalyzing(true);
    setResult(null);
    // Mimic only -- no LLM call. A short, deterministic pass (capitalization
    // + punctuation cleanup) plus a few rule-based tips, wrapped in a fake
    // "thinking" delay so it reads as an AI pass rather than instant regex.
    setTimeout(() => {
      setResult({ tips: buildTips(bio), polished: polishText(bio) });
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
          {result.polished !== bio.trim() && (
            <button
              type="button"
              onClick={() => { onApply(result.polished); setResult(null); }}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Use polished version
            </button>
          )}
        </div>
      )}
    </div>
  );
}
