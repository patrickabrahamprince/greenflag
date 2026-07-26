'use client';

interface WhyMePromptsProps {
  prompts: string[];
  onPromptChange: (index: number, value: string) => void;
}

const PLACEHOLDERS = [
  'What makes you unforgettable?',
  'Why should she pick you?',
  'What do you bring to the table?',
];

export function WhyMePrompts({ prompts, onPromptChange }: WhyMePromptsProps) {
  return (
    <div>
      <h2 className="font-display text-xl text-ink mb-1">
        3 reasons why you&apos;re worth it
      </h2>
      <p className="text-sm text-[#9DA0A6] mb-4">
        Each answer 50–150 characters
      </p>
      <div className="space-y-3">
        {prompts.map((prompt, i) => (
          <div key={i}>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(i, e.target.value)}
              placeholder={PLACEHOLDERS[i]}
              maxLength={150}
              rows={3}
              className="input resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${prompt.length > 0 && prompt.length < 50 ? 'text-gold' : 'text-[#9DA0A6]'}`}>
                {prompt.length}/150
              </span>
              {prompt.length > 0 && prompt.length < 50 && (
                <span className="text-xs text-gold">Min 50 chars</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
