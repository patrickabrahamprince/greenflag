export function CardSkeleton() {
  return (
    <div className="rounded-[24px] bg-surface border-[0.5px] border-border overflow-hidden animate-pulse">
      <div className="h-72 bg-surface-elevated" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-full bg-surface-elevated" />
        <div className="h-3 w-1/2 rounded-full bg-surface-elevated" />
        <div className="h-14 w-full rounded-[16px] bg-surface-elevated mt-4" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-[24px] bg-surface border-[0.5px] border-border p-5 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-elevated" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded-full bg-surface-elevated" />
              <div className="h-3 w-1/4 rounded-full bg-surface-elevated" />
            </div>
          </div>
          <div className="h-1 rounded-full bg-surface-elevated" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="text-center space-y-4 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-surface-elevated mx-auto" />
      <div className="space-y-2">
        <div className="h-6 w-1/3 rounded-full bg-surface-elevated mx-auto" />
        <div className="h-3 w-1/4 rounded-full bg-surface-elevated mx-auto" />
      </div>
      <div className="h-4 w-2/3 rounded-full bg-surface-elevated mx-auto" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-3 animate-pulse p-4">
      {[80, 60, 70, 50].map((w, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className={`h-10 rounded-[16px] bg-surface-elevated w-[${w}%]`} />
        </div>
      ))}
    </div>
  );
}
