interface TypingIndicatorProps {
  name: string;
}

export function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5 bg-card">
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}
