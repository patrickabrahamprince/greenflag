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
      <h2 className="text-xl font-display text-white mb-1">
        3 reasons why you&apos;re worth it
      </h2>
      <p className="text-sm text-[#8E8E93] mb-4">
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
              <span className={`text-xs ${prompt.length > 0 && prompt.length < 50 ? 'text-[#C9A961]' : 'text-[#8E8E93]'}`}>
                {prompt.length}/150
              </span>
              {prompt.length > 0 && prompt.length < 50 && (
                <span className="text-xs text-[#C9A961]">Min 50 chars</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
