export function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-4">
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`h-10 rounded-2xl animate-pulse ${
                i % 2 === 0
                  ? 'w-2/3 bg-[#1C1C1E] rounded-bl-sm'
                  : 'w-1/2 bg-[#00C853]/10 rounded-br-sm'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
