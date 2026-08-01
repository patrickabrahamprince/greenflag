import { Quote } from 'lucide-react';

interface PromptCardProps {
  caption: string;
  answer: string;
}

// A prompt/quote card -- small caption over a large bold answer, framed by
// a quote-mark badge. Used to surface a Standard's thought/photo/voice
// answers on a profile the same way a caption alone can't: the answer is
// the thing a reader's eye should land on first, not the label above it.
export function PromptCard({ caption, answer }: PromptCardProps) {
  return (
    <div className="card text-center py-8">
      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
        <Quote size={16} className="text-gold" />
      </div>
      <p className="text-sm font-semibold text-ink/70 mb-2">{caption}</p>
      <p className="font-display text-2xl text-ink">{answer}</p>
    </div>
  );
}
