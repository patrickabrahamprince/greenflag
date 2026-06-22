export function DiscoverySkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="aspect-[3/4] rounded-3xl bg-[#1C1C1E] animate-pulse mb-4" />
        <div className="h-4 bg-[#1C1C1E] rounded w-1/3 mb-2 animate-pulse" />
        <div className="h-3 bg-[#1C1C1E] rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}
