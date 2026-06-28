export function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] px-4 py-4">
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`h-10 rounded-2xl animate-pulse ${
                i % 2 === 0
                  ? 'w-2/3 bg-[#F0EDE9] rounded-bl-sm'
                  : 'w-1/2 bg-[#C9A961]/10 rounded-br-sm'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
