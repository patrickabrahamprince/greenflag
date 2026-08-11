export function AdminTableSkeleton() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-50" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-50 rounded w-1/3" />
              <div className="h-2 bg-gray-50 rounded w-1/4" />
            </div>
            <div className="h-6 w-16 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
