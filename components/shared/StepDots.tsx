interface StepDotsProps {
  current: number;
  total: number;
}

export function StepDots({ current, total }: StepDotsProps) {
  return (
    <div className="flex items-center gap-1.5 mb-6" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? 'w-7 bg-[#1C1C1E]'
              : 'w-2 bg-stone-200'
          }`}
        />
      ))}
    </div>
  );
}
