import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const RULE_SLIDES = [
  { title: 'Welcome to the Quiz', description: 'Answer up to 10 quick questions to help us match you better.' },
  { title: 'How to Answer', description: 'Pick ONE option per question. You can change your answer before finishing.' },
  { title: 'Progress', description: 'A progress bar will show how far you are. You must answer all to continue.' },
  { title: 'Finish', description: 'When you reach the last question, click “Finish Quiz” to save your answers.' },
];

interface QuizRulesCarouselProps { onClose: () => void; }

export const QuizRulesCarousel: React.FC<QuizRulesCarouselProps> = ({ onClose }) => {
  const [idx, setIdx] = useState(0);
  const isLast = idx === RULE_SLIDES.length - 1;
  const next = () => { if (isLast) onClose(); else setIdx(i => i + 1); };
  const { title, description } = RULE_SLIDES[idx];
  return (
    <div className="w-full max-w-md mx-auto bg-[#1C1C1E] rounded-xl p-6 text-center mb-6">
      <h2 className="font-['Playfair_Display'] text-xl text-ink mb-3">{title}</h2>
      <p className="text-ink/80 mb-4">{description}</p>
      <button onClick={next} className="btn-primary flex items-center justify-center gap-2 mx-auto">
        {isLast ? <><span>Got it</span> <CheckCircle2 size={16} /></> : <><span>Next</span> <ArrowRight size={16} /></>}
      </button>
    </div>
  );
};
