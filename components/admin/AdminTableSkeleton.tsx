export function AdminTableSkeleton() {
  return (
    <div className="bg-[#1A1A1A] border border-raised rounded-xl overflow-hidden">
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-raised" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-raised rounded w-1/3" />
              <div className="h-2 bg-raised rounded w-1/4" />
            </div>
            <div className="h-6 w-16 bg-raised rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
