interface StandardHeaderProps {
  intentionCount: number;
  activeDate: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function StandardHeader({ intentionCount, activeDate }: StandardHeaderProps) {
  return (
    <div className="card p-5 mb-6">
      <p className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
        Your Standard
      </p>
      <div className="flex items-baseline justify-between">
        <p className="font-['Playfair_Display'] text-ink text-lg italic">
          {intentionCount} Intentions
        </p>
        {activeDate && (
          <p className="text-[#8E8E93] text-xs font-thin">
            Active since {formatDate(activeDate)}
          </p>
        )}
      </div>
    </div>
  );
}
