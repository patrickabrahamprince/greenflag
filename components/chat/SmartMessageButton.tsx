'use client';

import { useState } from 'react';
import { Wand2, Loader2, Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAIPrompt } from '@/lib/hooks/useAIPrompt';

interface SmartMessageButtonProps {
  matchId: string;
  partnerName: string;
  partnerInterests: string[];
  yourName?: string;
  yourInterests?: string[];
  onMessageGenerated?: (message: string) => void;
}

export function SmartMessageButton({
  matchId,
  partnerName,
  partnerInterests,
  yourName,
  yourInterests,
  onMessageGenerated,
}: SmartMessageButtonProps) {
  const { generateFirstMessage, loading } = useAIPrompt();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const message = await generateFirstMessage(
      matchId,
      partnerName,
      partnerInterests,
      yourName,
      yourInterests
    );
    if (message) {
      setSuggestion(message);
    }
  };

  const handleCopy = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onMessageGenerated) onMessageGenerated(suggestion);
      toast.success('Copied to clipboard');
    }
  };

  if (suggestion) {
    return (
      <div className="bg-raised/50 rounded-lg p-4 space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink/70 uppercase tracking-wide">AI Suggestion</p>
          <button
            onClick={() => setSuggestion(null)}
            className="text-ink/40 hover:text-ink active:scale-90 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-ink leading-relaxed">{suggestion}</p>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 rounded-lg bg-gold text-ink font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Use This'}
          </button>
          <button
            onClick={() => handleGenerate()}
            className="flex-1 py-2 rounded-lg border border-raised text-ink font-semibold text-sm active:scale-95 transition-transform"
          >
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="w-full mb-4 py-2 px-4 rounded-lg border border-raised/50 text-ink/70 hover:text-ink hover:bg-raised/20 font-semibold text-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 size={16} />
          Smart Opener
        </>
      )}
    </button>
  );
}
