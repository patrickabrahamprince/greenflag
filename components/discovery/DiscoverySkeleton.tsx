export function DiscoverySkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="aspect-[3/4] bg-[#F0EDE9] animate-pulse mb-4" />
        <div className="h-4 bg-[#F0EDE9] rounded w-1/3 mb-2 animate-pulse" />
        <div className="h-3 bg-[#F0EDE9] rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}
